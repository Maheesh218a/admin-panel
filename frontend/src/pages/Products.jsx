import React, { useState, useEffect } from 'react'
import { MdAdd, MdEdit, MdSearch, MdFilterList } from 'react-icons/md'
import Modal from '../components/Modal'
import { Toggle, StatusBadge, FormField, inputClass, Btn } from '../components/UI'

const emptyProduct = { name: '', category: '', price: '', original_price: '', stock: '', status: true, image: '', description: '', badge: '' }

export default function Products({ addAlert }) {
  const [products, setProducts] = useState([])
  const [categoryList, setCategoryList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modal, setModal] = useState(null) // null | 'add' | 'edit'
  const [form, setForm] = useState(emptyProduct)
  const [editId, setEditId] = useState(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/products')
      const data = await res.json()
      if (data.status === 'success') {
        setProducts(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories')
      const data = await res.json()
      if (data.status === 'success') {
        setCategoryList(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const filtered = products.filter(p => {
    const name = p.name || ''
    const category = p.category || ''
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || category.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  const openAdd = () => { setForm(emptyProduct); setModal('add') }
  const openEdit = (p) => { setForm({ ...p }); setEditId(p.id); setModal('edit') }

  const save = async () => {
    // Strict Validation: Cannot be empty
    // Strict Validation: Cannot be empty
    const fields = ['name', 'category', 'price', 'original_price', 'stock', 'description', 'image', 'badge']
    const missing = fields.find(k => !form[k]?.toString().trim())
    
    if (missing) {
      addAlert?.('warning', 'Incomplete Form', `Please fill in the "${missing.replace('_', ' ')}" field to continue.`);
      return
    }

    const price = parseFloat(form.price)
    const stock = parseInt(form.stock)

    if (isNaN(price) || price < 0) {
      addAlert?.('error', 'Invalid Price', 'Product price must be a positive number.');
      return;
    }

    if (isNaN(stock) || stock < 0) {
      addAlert?.('error', 'Invalid Stock', 'Stock quantity cannot be negative.');
      return;
    }

    setIsSyncing(true)
    try {
      const url = modal === 'add' ? 'http://localhost:5000/api/products' : `http://localhost:5000/api/products/${editId}`
      const method = modal === 'add' ? 'POST' : 'PUT'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: price,
          original_price: parseFloat(form.original_price),
          stock: stock,
          status: true, // Enforce active status
          updatedAt: new Date()
        }),
      })
      
      if (res.ok) {
        addAlert?.('success', modal === 'add' ? 'Sync Successful' : 'Saved Changes', `"${form.name}" has been synchronized with Firestore.`);
        fetchProducts()
        setModal(null)
      } else {
        const errorData = await res.json();
        addAlert?.('error', 'Sync Failed', errorData.message || 'An error occurred during product synchronization.');
      }
    } catch (err) {
      console.error('Failed to save product:', err)
      addAlert?.('error', 'Network Timeout', 'The connection to Firestore was lost. Please check your network.');
    } finally {
      setIsSyncing(false)
    }
  }

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="p-4 lg:p-6 fade-in transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-xl font-700 text-slate-800 dark:text-white transition-colors">Products</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{products.length} live products from Firestore</p>
        </div>
        <Btn onClick={openAdd}><MdAdd size={18} />Add Product</Btn>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-black rounded-2xl shadow-card dark:shadow-none border dark:border-white/5 p-4 mb-4 flex flex-col sm:flex-row gap-3 transition-colors duration-300">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 flex-1 focus-within:border-sky-300 focus-within:bg-white dark:focus-within:bg-black transition-all">
          <MdSearch className="text-slate-400 dark:text-slate-500" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="bg-transparent text-sm outline-none flex-1 text-slate-600 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 transition-colors" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-black rounded-2xl shadow-card dark:shadow-none border dark:border-white/5 overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 transition-colors">
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 dark:text-slate-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 dark:text-slate-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 dark:text-slate-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 dark:text-slate-500 uppercase tracking-wide hidden sm:table-cell">Stock</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 dark:text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-600 text-slate-400 dark:text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {isLoading && products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-slate-400 dark:text-slate-600">Loading products from Firestore...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-slate-300 dark:text-slate-700 text-sm">No products found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="table-row border-t border-slate-50 dark:border-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" 
                        onError={(e) => { e.target.src = 'https://placehold.co/40x40?text=IMG' }} />
                      <span className="font-500 text-slate-700 dark:text-slate-300 transition-colors">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell transition-all">
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-[10px] uppercase tracking-widest font-800 px-3 py-1.5 rounded-xl border dark:border-white/5 shadow-sm transition-all hover:scale-105"
                        style={{ 
                          backgroundColor: `${categoryList.find(c => c.name === p.category)?.color_hex}15` || 'rgba(125, 211, 252, 0.1)',
                          color: categoryList.find(c => c.name === p.category)?.color_hex || '#38bdf8',
                        }}
                      >
                        {p.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-600 text-slate-700 dark:text-slate-300 transition-colors">LKR {parseFloat(p.price).toFixed(2)}</td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className={`font-500 ${p.stock === 0 ? 'text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {p.stock === 0 ? 'Out of stock' : p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge active={true} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-500/10 text-slate-400 hover:text-sky-500 transition-colors">
                      <MdEdit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add New Product' : 'Edit Product'} width="max-w-2xl">
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Product Name" required>
              <input className={inputClass} value={form.name || ''} onChange={e => f('name', e.target.value)} placeholder="e.g. Wireless Headphones" />
            </FormField>
            <FormField label="Badge (e.g. New, Sale)" required>
              <input className={inputClass} value={form.badge || ''} onChange={e => f('badge', e.target.value)} placeholder="New" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category" required>
              <select className={inputClass} value={form.category || ''} onChange={e => f('category', e.target.value)}>
                <option value="">Select category</option>
                {categoryList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Stock Quantity" required>
              <input className={inputClass} type="number" value={form.stock || ''} onChange={e => f('stock', e.target.value)} placeholder="0" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Current Price (LKR)" required>
              <input className={inputClass} type="number" step="0.01" value={form.price || ''} onChange={e => f('price', e.target.value)} placeholder="0.00" />
            </FormField>
            <FormField label="Original Price (LKR)" required>
              <input className={inputClass} type="number" step="0.01" value={form.original_price || ''} onChange={e => f('original_price', e.target.value)} placeholder="0.00" />
            </FormField>
          </div>

          <FormField label="Description" required>
            <textarea 
              className={`${inputClass} min-h-[100px] py-3`} 
              value={form.description || ''} 
              onChange={e => f('description', e.target.value)} 
              placeholder="Provide a detailed product description..."
            />
          </FormField>

          <FormField label="Image URL" required>
            <input className={inputClass} value={form.image || ''} onChange={e => f('image', e.target.value)} placeholder="https://..." />
          </FormField>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10 flex justify-end gap-3 transition-colors bg-slate-50/50 dark:bg-white/5">
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={save} disabled={isSyncing}>{isSyncing ? 'Syncing...' : (modal === 'add' ? 'Add Product' : 'Save Changes')}</Btn>
        </div>
      </Modal>
    </div>
  )
}
