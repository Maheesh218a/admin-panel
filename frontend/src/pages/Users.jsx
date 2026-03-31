import React, { useState, useEffect } from 'react'
import { MdAdd, MdEdit, MdSearch, MdPerson } from 'react-icons/md'
import Modal from '../components/Modal'
import { Toggle, StatusBadge, FormField, inputClass, Btn } from '../components/UI'

const emptyUser = { name: '', email: '', phone: '', role: 'Customer', status: true, password: '' }
const roles = ['Customer', 'Admin', 'Moderator']

const avatarColors = ['from-sky-500 to-blue-600', 'from-violet-500 to-purple-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-500', 'from-rose-500 to-pink-600']

export default function Users({ addAlert }) {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyUser)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users')
      const data = await res.json()
      setUsers(data.data || [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = users.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.phone || '').toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A'
    const d = new Date(dateVal)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const openAdd = () => { setForm(emptyUser); setModal('add') }
  const openEdit = (u) => { setForm({ ...u }); setEditId(u.id); setModal('edit') }

  const save = async () => {
    // 1. Mandatory Check
    if (!form.name || !form.email) {
      addAlert?.('warning', 'Missing Details', 'User name and email are mandatory.');
      return;
    }

    // 2. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      addAlert?.('error', 'Invalid Email', 'Please provide a professional email address format.');
      return;
    }

    // 3. Phone Validation (10-12 digits)
    const phoneRegex = /^\d{10,12}$/;
    if (form.phone && !phoneRegex.test(form.phone.replace(/\D/g, ''))) {
      addAlert?.('warning', 'Phone Format', 'Contact number should be between 10 to 12 digits.');
      return;
    }

    // 4. Password validation for NEW users
    if (modal === 'add' && (!form.password || form.password.length < 6)) {
      addAlert?.('error', 'Weak Security', 'Please set a password of at least 6 characters.');
      return;
    }

    setLoading(true)
    try {
      const url = modal === 'add' ? 'http://localhost:5000/api/users' : `http://localhost:5000/api/users/${editId}`;
      const method = modal === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.status === 'success') {
        addAlert?.('success', modal === 'add' ? 'New Member Added' : 'Profile Updated', `Successfully ${modal === 'add' ? 'registered' : 'updated'} ${form.name}.`);
        fetchUsers();
        setModal(null);
      } else {
        addAlert?.('error', 'Process Failed', data.message || 'An error occurred during user saving.');
      }
    } catch (err) {
      console.error('Failed to save user:', err);
      addAlert?.('error', 'Network Timeout', 'Could not reach server. Please check your admin connection.');
    } finally {
      setLoading(false);
    }
  }

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="p-4 lg:p-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-xl font-700 text-slate-800">Users</h2>
          <p className="text-sm text-slate-400 mt-0.5">{users.length} registered users</p>
        </div>
        <Btn onClick={openAdd}><MdAdd size={18} />Add User</Btn>
      </div>

      {/* Stats mini */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: 'Total', value: users.length, color: 'text-slate-700' },
          { label: 'Recently Joined', value: users.filter(u => {
            const d = new Date(u.registerDate);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return d >= weekAgo;
          }).length, color: 'text-emerald-500' },
          { label: 'Active', value: users.length, color: 'text-sky-500' },
        ].map((s, i) => (
          <div key={i} className="stat-card p-4 text-center">
            <p className={`font-display text-2xl font-700 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 font-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-card p-4 mb-4">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-sky-300 focus-within:bg-white transition-all">
          <MdSearch className="text-slate-400" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or phone..." className="bg-transparent text-sm outline-none flex-1 text-slate-600 placeholder-slate-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 uppercase tracking-wide">Phone</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-600 text-slate-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-16 text-slate-400">Loading users...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16 text-slate-300 text-sm">No users found</td></tr>
              ) : filtered.map((u, idx) => (
                <tr key={idx} className="table-row border-t border-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center text-slate-400 text-xs font-700 flex-shrink-0">
                        {u.profilePicUrl ? (
                          <img src={u.profilePicUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white`}>
                            {(u.name || 'U')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-500 text-slate-700">{u.name || 'Unknown User'}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 font-500">{u.phone || 'N/A'}</td>
                  <td className="px-5 py-3.5 text-slate-400 hidden lg:table-cell">{formatDate(u.registerDate)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <StatusBadge active={true} />
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-500 transition-colors"><MdEdit size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add New User' : 'Edit User'}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" required>
              <input className={inputClass} value={form.name} onChange={e => f('name', e.target.value)} placeholder="John Doe" />
            </FormField>
            <FormField label="Email Address" required>
              <input className={inputClass} type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="john@example.com" disabled={modal === 'edit'} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone Number" required>
              <input className={inputClass} value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="0771234567" />
            </FormField>
            <FormField label="User Role">
              <select className={inputClass} value={form.role} onChange={e => f('role', e.target.value)}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </FormField>
          </div>

          {modal === 'add' && (
            <FormField label="Temporary Password" required>
              <input className={inputClass} type="password" value={form.password} onChange={e => f('password', e.target.value)} placeholder="Min 6 characters" />
            </FormField>
          )}

          <div className="flex items-center justify-between py-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
               <p className="text-sm font-600 text-slate-700">Account Access</p>
               <p className="text-xs text-slate-400">Enable or disable this user's ability to login.</p>
            </div>
            <Toggle checked={form.status} onChange={v => f('status', v)} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={save} disabled={loading}>{loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (modal === 'add' ? 'Add Member' : 'Save Changes')}</Btn>
        </div>
      </Modal>

    </div>
  )
}
