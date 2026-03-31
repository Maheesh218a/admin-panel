import React from 'react'

export function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-sky-500' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export function StatusBadge({ active, labels = ['Active', 'Inactive'] }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-600 ${
      active
        ? 'bg-emerald-50 text-emerald-600'
        : 'bg-rose-50 text-rose-500'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-rose-400'}`} />
      {active ? labels[0] : labels[1]}
    </span>
  )
}

export function OrderBadge({ status }) {
  const map = {
    Delivered: 'bg-emerald-50 text-emerald-600',
    Shipped: 'bg-sky-50 text-sky-600',
    Processing: 'bg-amber-50 text-amber-600',
    Pending: 'bg-violet-50 text-violet-600',
    Cancelled: 'bg-rose-50 text-rose-500',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-600 ${map[status] || 'bg-slate-50 text-slate-500'}`}>
      {status}
    </span>
  )
}

export function FormField({ label, children, required }) {
  return (
    <div>
      <label className="block text-sm font-600 text-slate-600 mb-1.5">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export const inputClass = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all placeholder-slate-400 bg-white"

export function Btn({ children, onClick, variant = 'primary', className = '', type = 'button', size = 'md' }) {
  const base = 'inline-flex items-center gap-2 font-600 rounded-xl transition-all duration-150 cursor-pointer'
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' }
  const variants = {
    primary: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm hover:shadow-md hover:opacity-90 active:scale-95',
    secondary: 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95',
    danger: 'bg-rose-50 text-rose-500 hover:bg-rose-100 active:scale-95',
    ghost: 'text-slate-500 hover:bg-slate-100 active:scale-95',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm active:scale-95',
  }
  return (
    <button type={type} onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

export function EmptyState({ icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="text-5xl mb-3 opacity-40">{icon}</div>
      <p className="text-sm">{message}</p>
    </div>
  )
}
