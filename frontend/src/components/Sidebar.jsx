import React, { useState, useEffect } from 'react'
import {
  MdDashboard, MdInventory2, MdCategory, MdPeople,
  MdImage, MdShoppingCart, MdSettings, MdLogout,
  MdStorefront, MdClose
} from 'react-icons/md'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: MdDashboard },
  { id: 'products', label: 'Products', icon: MdInventory2 },
  { id: 'categories', label: 'Categories', icon: MdCategory },
  { id: 'users', label: 'Users', icon: MdPeople },
  { id: 'banners', label: 'Banners', icon: MdImage },
  { id: 'orders', label: 'Orders', icon: MdShoppingCart },
]

export default function Sidebar({ active, onNavigate, mobileOpen, setMobileOpen, admin, onLogout }) {
  const [orderCount, setOrderCount] = useState(0)

  // Get initials from name
  const initials = admin?.name
    ? admin.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'SA'

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/orders')
        const data = await res.json()
        if (data.status === 'success') {
          setOrderCount(data.data.length)
        }
      } catch (err) {
        console.error('Sidebar order count fetch failed:', err)
      }
    }
    fetchCount()
    
    // Optional: Refresh periodically
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-white dark:bg-black z-30 flex flex-col
        transition-all duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        shadow-[4px_0_24px_rgba(0,0,0,0.06)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.5)]
        border-r border-slate-100 dark:border-white/5
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md">
              <MdStorefront className="text-white text-lg" />
            </div>
            <span className="font-display font-bold text-surface-900 dark:text-white text-xl tracking-tight transition-colors">Shofyra</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin transition-colors">
          <p className="text-xs font-600 text-slate-400 dark:text-slate-500 px-3 pb-2 uppercase tracking-widest">Main Menu</p>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { onNavigate(id); setMobileOpen(false) }}
              className={`sidebar-link ${active === id ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === 'orders' && orderCount > 0 && (
                <span className="ml-auto bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 text-[10px] font-700 px-2 py-0.5 rounded-full ring-1 ring-sky-200 dark:ring-sky-500/20">{orderCount}</span>
              )}
            </button>
          ))}

          <div className="pt-4">
            <p className="text-xs font-600 text-slate-400 dark:text-slate-500 px-3 pb-2 uppercase tracking-widest">System</p>
            <button 
              onClick={() => { onNavigate('settings'); setMobileOpen(false) }}
              className={`sidebar-link ${active === 'settings' ? 'active' : ''}`}
            >
              <MdSettings size={18} />
              <span>Settings</span>
            </button>
          </div>
        </nav>

        {/* Admin profile + logout */}
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-700/50">
          <div
            onClick={onLogout}
            className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer group"
            title="Click to sign out"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-white text-xs font-700 flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-600 text-slate-700 dark:text-slate-200 truncate transition-colors">
                {admin?.name || 'Admin'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate transition-colors">
                {admin?.email || ''}
              </p>
            </div>
            <MdLogout size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors" />
          </div>
        </div>
      </aside>
    </>
  )
}
