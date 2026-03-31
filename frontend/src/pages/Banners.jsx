import React, { useState, useEffect } from 'react'
import { MdAdd, MdEdit, MdDelete, MdImage } from 'react-icons/md'
import Modal from '../components/Modal'
import { StatusBadge, FormField, inputClass, Btn } from '../components/UI'

const emptyBanner = { id: '', title: '', subtitle: '', label: '', image_url: '', cta_text: 'Shop Now', sort_order: 1, target_category: '' }
const positions = ['Hero', 'Sidebar', 'Footer', 'Popup']

const positionColor = {
  Hero: 'bg-sky-100 text-sky-600',
  Sidebar: 'bg-violet-100 text-violet-600',
  Footer: 'bg-slate-100 text-slate-600',
  Popup: 'bg-amber-100 text-amber-600',
}

export default function Banners({ addAlert }) {
  const [banners, setBanners] = useState([])
  const [categoryList, setCategoryList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyBanner)
  const [editId, setEditId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  React.useEffect(() => {
    fetchBanners()
    fetchCategories()
  }, [])

  const fetchBanners = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/banners')
      const data = await res.json()
      if (data.status === 'success') setBanners(data.data)
    } catch (err) {
      console.error('Failed to fetch banners:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories')
      const data = await res.json()
      if (data.status === 'success') setCategoryList(data.data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const openAdd = () => { setForm(emptyBanner); setModal('add') }
  const openEdit = (b) => { setForm({ ...b }); setEditId(b.id); setModal('edit') }

  const save = async () => {
    // 1. Mandatory Check
    if (!form.title || !form.image_url) {
      addAlert?.('warning', 'Missing Content', 'A banner must have at least a Title and an Image URL.');
      return;
    }

    // 2. URL Validation
    try {
      new URL(form.image_url);
    } catch (_) {
      addAlert?.('error', 'Invalid Link', 'Please provide a direct URL to a banner image.');
      return;
    }

    setLoading(true)
    try {
      const url = modal === 'add' ? 'http://localhost:5000/api/banners' : `http://localhost:5000/api/banners/${editId}`;
      const method = modal === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        addAlert?.('success', modal === 'add' ? 'Banner Published' : 'Changes Saved', `"${form.title}" is now live on the storefront.`);
        fetchBanners();
        setModal(null);
      } else {
        addAlert?.('error', 'Publication Failed', 'Our servers could not publish the banner. Try again.');
      }
    } catch (err) {
      addAlert?.('error', 'Network Timeout', 'Could not sync with Firestore. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  const deleteBanner = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/banners/${id}`, { method: 'DELETE' });
      addAlert?.('info', 'Banner Removed', 'The promotional banner has been permanently deleted.');
      fetchBanners();
      setDeleteConfirm(null);
    } catch (err) { console.error(err) }
  }

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="p-4 lg:p-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-xl font-700 text-slate-800">Banners</h2>
          <p className="text-sm text-slate-400 mt-0.5">{banners.length} banners · {banners.filter(b => b.status).length} active</p>
        </div>
        <Btn onClick={openAdd}><MdAdd size={18} />Add Banner</Btn>
      </div>

      {/* Position filter summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {positions.map(pos => {
          const count = banners.filter(b => b.position === pos).length
          return (
            <div key={pos} className="bg-white rounded-xl shadow-card p-4">
              <span className={`text-xs font-700 px-2 py-1 rounded-lg ${positionColor[pos]}`}>{pos}</span>
              <p className="font-display text-2xl font-700 text-slate-800 mt-2">{count}</p>
              <p className="text-xs text-slate-400">banner{count !== 1 ? 's' : ''}</p>
            </div>
          )
        })}
      </div>

      {/* Banner cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {banners.map(b => (
          <div key={b.id} className="bg-white rounded-2xl shadow-card overflow-hidden transition-all hover:shadow-lg">
            {/* Preview image */}
            <div className="relative">
              <img
                src={b.image_url}
                alt={b.title}
                className="w-full h-32 object-cover"
                onError={e => { e.target.src = `https://placehold.co/600x128/e2e8f0/94a3b8?text=${encodeURIComponent(b.title)}` }}
              />
              <div className="absolute top-2 left-2">
                <span className="text-[9px] font-900 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md shadow-sm uppercase tracking-widest text-slate-800">
                   {b.label}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <p className="text-white font-800 text-sm font-display uppercase tracking-widest">{b.title}</p>
                <p className="text-white/70 text-[10px] uppercase font-600">{b.subtitle}</p>
              </div>
            </div>

            {/* Card body */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-700 text-slate-400 uppercase tracking-widest">Button Text</p>
                <p className="text-xs font-600 text-sky-500">{b.cta_text}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(b)} className="p-2 rounded-xl hover:bg-sky-50 text-slate-400 hover:text-sky-500 transition-all">
                  <MdEdit size={18} />
                </button>
                <button onClick={() => setDeleteConfirm(b.id)} className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all">
                  <MdDelete size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table view */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-display font-700 text-slate-800">All Banners</h3>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 uppercase tracking-wide">Banner Detail</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 uppercase tracking-wide hidden sm:table-cell">Label</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 uppercase tracking-wide hidden md:table-cell">CTA Text</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 uppercase tracking-wide">Sort</th>
                <th className="text-right px-5 py-3.5 text-xs font-600 text-slate-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map(b => (
                <tr key={b.id} className="table-row border-t border-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        <img src={b.image_url} alt={b.title} className="w-full h-full object-cover"
                          onError={e => { e.target.src = 'https://placehold.co/48x32/e2e8f0/94a3b8?text=IMG' }} />
                      </div>
                      <div>
                        <p className="font-500 text-slate-700">{b.title}</p>
                        <p className="text-xs text-slate-400">{b.subtitle}</p>
                        <p className="text-[10px] font-mono text-slate-300 mt-0.5">{b.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-[10px] font-700 px-2 py-1 rounded-md bg-slate-100 text-slate-500 uppercase tracking-wider">{b.label}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sky-500 font-600 text-xs hidden md:table-cell">{b.cta_text}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-700 text-slate-400"># {b.sort_order}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(b)} className="p-2 rounded-xl hover:bg-sky-50 text-slate-400 hover:text-sky-500 transition-all"><MdEdit size={16} /></button>
                      <button onClick={() => setDeleteConfirm(b.id)} className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all"><MdDelete size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Create Promotional Banner' : 'Edit Banner'} width="max-w-2xl">
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Banner Title (Heading)" required>
              <input 
                className={inputClass} 
                value={form.title} 
                onChange={e => {
                  const val = e.target.value;
                  const slug = `banner_${val.toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]+/g, '')}`;
                  setForm(prev => ({ ...prev, title: val, id: slug }));
                }} 
                placeholder="e.g. Mega Summer Electronics" 
              />
            </FormField>
            <FormField label="Document ID (Auto)" required>
              <input className={`${inputClass} font-mono text-xs`} value={form.id} onChange={e => f('id', e.target.value)} placeholder="banner_mega_sale" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Label (Badge Text)" required>
              <input className={inputClass} value={form.label} onChange={e => f('label', e.target.value)} placeholder="e.g. MEGA SALE" />
            </FormField>
            <FormField label="CTA Text (Button)" required>
              <input className={inputClass} value={form.cta_text} onChange={e => f('cta_text', e.target.value)} placeholder="Shop Now" />
            </FormField>
          </div>

          <FormField label="Subtitle (Description)">
            <input className={inputClass} value={form.subtitle} onChange={e => f('subtitle', e.target.value)} placeholder="e.g. All mobile phones 40% OFF" />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Target Category">
              <select className={inputClass} value={form.target_category || ''} onChange={e => f('target_category', e.target.value)}>
                <option value="">No link (General)</option>
                {categoryList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Sort Priority" required>
              <input className={inputClass} type="number" value={form.sort_order} onChange={e => f('sort_order', e.target.value)} placeholder="1" />
            </FormField>
          </div>

          <FormField label="Direct Image URL" required>
            <div className="relative">
              <MdImage className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input className={`${inputClass} pl-10`} value={form.image_url} onChange={e => f('image_url', e.target.value)} placeholder="https://..." />
            </div>
            {form.image_url && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100 shadow-inner relative group h-32 bg-slate-50">
                <img src={form.image_url} alt="preview" className="w-full h-full object-cover"
                  onError={e => e.target.parentElement.style.display = 'none'} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-white text-xs font-700 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">Live Preview</span>
                </div>
              </div>
            )}
          </FormField>
        </div>
        <div className="px-6 py-5 border-t border-slate-100 dark:border-white/10 flex justify-end gap-3 transition-colors bg-slate-50/50 dark:bg-white/5">
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={save} disabled={loading}>
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (modal === 'add' ? 'Publish Banner' : 'Push Changes')}
          </Btn>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Banner" width="max-w-sm">
        <div className="p-6">
          <p className="text-slate-600 text-sm mb-6">Delete this banner? It will be immediately removed from the storefront.</p>
          <div className="flex justify-end gap-3">
            <Btn variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => deleteBanner(deleteConfirm)}>Delete</Btn>
          </div>
        </div>
      </Modal>
    </div>
  )
}
