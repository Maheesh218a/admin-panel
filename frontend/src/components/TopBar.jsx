import React, { useState } from 'react'
import { MdMenu, MdSearch, MdNotifications, MdDarkMode, MdLightMode } from 'react-icons/md'

export default function TopBar({ title, subtitle, onMenuToggle, isDarkMode, toggleDarkMode, admin }) {
  const [search, setSearch] = useState('')

  const initials = admin?.name
    ? admin.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'SA'

  return (
    <header className="bg-white dark:bg-black border-b border-slate-100 dark:border-white/5 px-4 lg:px-6 py-3.5 flex items-center gap-4 sticky top-0 z-10 transition-colors duration-300">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-colors"
      >
        <MdMenu size={22} />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="font-display text-lg font-700 text-slate-800 dark:text-white leading-tight transition-colors">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block transition-colors">{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 w-52 focus-within:border-sky-300 dark:focus-within:border-sky-500 focus-within:bg-white dark:focus-within:bg-black transition-all">
        <MdSearch className="text-slate-400" size={16} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="bg-transparent text-sm text-slate-600 dark:text-slate-300 placeholder-slate-400 outline-none w-full"
        />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all active:scale-90"
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? <MdLightMode size={20} className="text-amber-400" /> : <MdDarkMode size={20} />}
      </button>

      {/* Notif */}
      <button className="relative p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
        <MdNotifications size={20} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-surface-800"></span>
      </button>

      {/* Avatar with real name */}
      <div
        className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-white text-xs font-700 cursor-pointer shadow-sm"
        title={admin?.name || 'Admin'}
      >
        {initials}
      </div>
    </header>
  )
}
