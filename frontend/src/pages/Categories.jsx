import React, { useState, useEffect } from 'react'
import { MdAdd, MdEdit, MdCategory, MdColorLens, MdFormatListNumbered } from 'react-icons/md'
import Modal from '../components/Modal'
import { Toggle, StatusBadge, FormField, inputClass, Btn } from '../components/UI'

const emptyCategory = { id: '', name: '', icon: '📦', color_hex: '#3b82f6', sort_order: 0, status: true }

export default function Categories({ addAlert }) {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyCategory)
  const [editId, setEditId] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/categories')
      const data = await res.json()
      if (data.status === 'success') {
        setCategories(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const openAdd = () => { setForm(emptyCategory); setModal('add') }
  const openEdit = (c) => { setForm({ ...c }); setEditId(c.id); setModal('edit') }

  const save = async () => {
    // Validation
    if (!form.name?.trim()) {
      addAlert?.('error', 'Missing Name', 'Please provide a category name to continue.');
      return;
    }
    
    // Letters-only validation
    const lettersOnly = /^[A-Za-z\s]+$/;
    if (!lettersOnly.test(form.name)) {
      addAlert?.('warning', 'Invalid Name', 'Category names should only contain letters and spaces.');
      return;
    }

    if (!form.id?.trim()) {
      addAlert?.('error', 'Missing Slug', 'A category ID (slug) is required for system indexing.');
      return;
    }

    setIsLoading(true)
    try {
      const url = modal === 'add' 
        ? 'http://localhost:5000/api/categories' 
        : `http://localhost:5000/api/categories/${editId}`
      const method = modal === 'add' ? 'POST' : 'PUT'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      
      const data = await res.json()
      if (data.status === 'success') {
        addAlert?.('success', modal === 'add' ? 'Category Created' : 'Category Updated', `Successfully ${modal === 'add' ? 'added' : 'updated'} "${form.name}" in Firestore.`);
        fetchCategories()
        setModal(null)
      } else {
        addAlert?.('error', 'Save Failed', data.message || 'An error occurred while saving the category.');
      }
    } catch (err) {
      console.error('Failed to save category:', err)
      addAlert?.('error', 'Network Error', 'Could not reach the server. Please check your connection.');
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStatus = async (id, currentStatus) => {
    try {
      const category = categories.find(c => c.id === id)
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...category, status: !currentStatus }),
      })
      if (res.ok) fetchCategories()
    } catch (err) {
      console.error('Failed to toggle status:', err)
    }
  }

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="p-4 lg:p-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-xl font-700 text-slate-800 dark:text-white">Categories</h2>
          <p className="text-sm text-slate-400 mt-0.5">{categories.length} live categories from Firestore</p>
        </div>
        <Btn onClick={openAdd}><MdAdd size={18} />Add Category</Btn>
      </div>

      {isLoading && categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-surface-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
           <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mb-4" />
           <p className="text-slate-500 font-medium">Syncing with Firestore...</p>
        </div>
      ) : (
        <>
          {/* Cards grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {categories.map(c => (
              <div key={c.id} className="group bg-white dark:bg-surface-900 rounded-3xl shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 border border-slate-100 dark:border-slate-800 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner relative overflow-hidden"
                      style={{ backgroundColor: `${c.color_hex}15`, color: c.color_hex }}
                    >
                      <div className="absolute inset-0 opacity-10" style={{ backgroundColor: c.color_hex }} />
                      <span className="relative z-10">{c.icon.length > 5 ? '📦' : c.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-display font-800 text-slate-800 dark:text-white text-lg">{c.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase tracking-wider font-700 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                          Order: {c.sort_order}
                        </span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge active={c.status} />
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                  <div className="flex items-center gap-2">
                    <Toggle checked={c.status} onChange={() => toggleStatus(c.id, c.status)} />
                    <span className="text-xs font-600 text-slate-400 dark:text-slate-500 uppercase">
                      {c.status ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <button onClick={() => openEdit(c)} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all">
                    <MdEdit size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Table view */}
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-display font-800 text-slate-800 dark:text-white">All Categories List</h3>
              <span className="text-xs font-700 text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                Ordered by Priority
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-left">
                    <th className="px-6 py-4 text-xs font-700 text-slate-400 uppercase tracking-widest">Priority</th>
                    <th className="px-6 py-4 text-xs font-700 text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-xs font-700 text-slate-400 uppercase tracking-widest hidden md:table-cell">Theme Color</th>
                    <th className="px-6 py-4 text-xs font-700 text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-700 text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {categories.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-700 text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">#{c.sort_order}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{c.icon.length > 5 ? '📦' : c.icon}</span>
                          <span className="font-700 text-slate-700 dark:text-slate-200">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded-full shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" style={{ backgroundColor: c.color_hex }} />
                           <span className="font-mono text-xs text-slate-400 uppercase">{c.color_hex}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge active={c.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEdit(c)} className="p-2 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all">
                          <MdEdit size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Create New Category' : 'Modify Category'}>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category Name" required>
              <input 
                className={inputClass} 
                value={form.name} 
                onChange={e => {
                  const val = e.target.value;
                  const slug = val.toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]+/g, '');
                  setForm(prev => ({ ...prev, name: val, id: slug }));
                }} 
                placeholder="e.g. Electronics" 
              />
            </FormField>
            <FormField label="Category ID (Slug)" required>
               <input className={`${inputClass} font-mono text-xs`} value={form.id} onChange={e => f('id', e.target.value)} placeholder="e.g. electronics_items" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Icon / Resource Name" required>
               <input className={inputClass} value={form.icon} onChange={e => f('icon', e.target.value)} placeholder="e.g. ic_cat_bathroom" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Accent Color">
              <div className="flex gap-2">
                <input type="color" className="h-11 w-12 rounded-xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-700 p-1 cursor-pointer" value={form.color_hex} onChange={e => f('color_hex', e.target.value)} />
                <input className={`${inputClass} flex-1 font-mono uppercase`} value={form.color_hex} onChange={e => f('color_hex', e.target.value)} placeholder="#000000" />
              </div>
            </FormField>
            <FormField label="Sort Order" required>
              <div className="relative">
                <MdFormatListNumbered className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input className={`${inputClass} pl-10`} type="number" value={form.sort_order} onChange={e => f('sort_order', e.target.value)} placeholder="0" />
              </div>
            </FormField>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-sm font-800 text-slate-800 dark:text-white">Visibility Status</p>
              <p className="text-xs text-slate-400 mt-0.5">Control if this category is visible on the storefront.</p>
            </div>
            <Toggle checked={form.status} onChange={v => f('status', v)} />
          </div>
        </div>
        <div className="px-6 py-5 bg-slate-50 dark:bg-surface-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={save} disabled={isLoading}>
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              modal === 'add' ? 'Create Category' : 'Push Changes'
            )}
          </Btn>
        </div>
      </Modal>
    </div>
  )
}
