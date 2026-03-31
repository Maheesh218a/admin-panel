import React, { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'
import {
  MdInventory2, MdPeople, MdShoppingCart, MdAttachMoney,
  MdTrendingUp, MdArrowUpward, MdArrowDownward
} from 'react-icons/md'
import { chartData, mockOrders } from '../data/mockData'
import { OrderBadge } from '../components/UI'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#09090b] border border-slate-100 dark:border-white/10 rounded-xl shadow-lg p-3 text-sm transition-colors duration-300">
        <p className="font-600 text-slate-600 dark:text-slate-300 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-500">
            {p.name}: {p.name === 'revenue' ? '$' : ''}{p.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard({ admin }) {
  const [liveStats, setLiveStats] = useState({
    activeProducts: 0,
    productsThisWeek: 0,
    totalUsers: 0,
    usersThisWeek: 0,
    totalOrders: 0,
    ordersThisWeek: 0,
    totalRevenue: 0,
    revenueThisWeek: 0,
    recentOrders: []
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      // Fetch Products
      const pRes = await fetch('http://localhost:5000/api/products')
      const pData = await pRes.json()
      const products = pData.data || []
      const activeProducts = products.length
      
      const productsThisWeek = products.filter(p => {
        if (!p.createdAt) return false
        const createdDate = p.createdAt._seconds ? new Date(p.createdAt._seconds * 1000) : new Date(p.createdAt)
        return createdDate >= sevenDaysAgo
      }).length

      // Fetch Users
      const uRes = await fetch('http://localhost:5000/api/users')
      const uData = await uRes.json()
      const users = uData.data || []
      const totalUsers = users.length
      
      const usersThisWeek = users.filter(u => {
        const dateField = u.registerDate || u.createdAt || u.creationTime
        if (!dateField) return false
        const createdDate = new Date(dateField)
        return createdDate >= sevenDaysAgo
      }).length

      // Fetch Orders
      const oRes = await fetch('http://localhost:5000/api/orders')
      const oData = await oRes.json()
      const orders = oData.data || []
      const totalOrders = orders.length
      
      const ordersThisWeek = orders.filter(o => {
        if (!o.order_date) return false
        const createdDate = o.order_date._seconds ? new Date(o.order_date._seconds * 1000) : new Date(parseFloat(o.order_date))
        return createdDate >= sevenDaysAgo
      }).length

      const totalRevenue = orders.reduce((sum, o) => {
        if (o.total_amount) return sum + parseFloat(o.total_amount)
        if (o.total) return sum + parseFloat(o.total)
        return sum + (o.items || []).reduce((iSum, item) => iSum + (parseFloat(item.unit_price || 0) * (item.quantity || 0)), 0)
      }, 0)

      const revenueThisWeek = orders
        .filter(o => {
          if (!o.order_date) return false
          const createdDate = o.order_date._seconds ? new Date(o.order_date._seconds * 1000) : new Date(parseFloat(o.order_date))
          return createdDate >= sevenDaysAgo
        })
        .reduce((sum, o) => {
          if (o.total_amount) return sum + parseFloat(o.total_amount)
          if (o.total) return sum + parseFloat(o.total)
          return sum + (o.items || []).reduce((iSum, item) => iSum + (parseFloat(item.unit_price || 0) * (item.quantity || 0)), 0)
        }, 0)

      setLiveStats({
        activeProducts,
        productsThisWeek,
        totalUsers,
        usersThisWeek,
        totalOrders,
        ordersThisWeek,
        totalRevenue,
        revenueThisWeek,
        recentOrders: orders.slice(0, 5)
      })
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    }
  }

  const stats = [
    { label: 'Total Revenue', value: `LKR ${liveStats.totalRevenue.toLocaleString()}`, change: `+LKR ${liveStats.revenueThisWeek.toLocaleString()}`, up: liveStats.revenueThisWeek > 0, icon: MdAttachMoney, color: 'from-sky-500 to-blue-600', bg: 'bg-sky-50', text: 'text-sky-600' },
    { label: 'Total Orders', value: liveStats.totalOrders.toLocaleString(), change: `+${liveStats.ordersThisWeek}`, up: liveStats.ordersThisWeek > 0, icon: MdShoppingCart, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-600' },
    { label: 'Active Products', value: liveStats.activeProducts.toLocaleString(), change: `+${liveStats.productsThisWeek}`, up: liveStats.productsThisWeek > 0, icon: MdInventory2, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: 'Total Users', value: liveStats.totalUsers.toLocaleString(), change: `+${liveStats.usersThisWeek}`, up: liveStats.usersThisWeek > 0, icon: MdPeople, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600' },
  ]

  // Helper for total calculation in table
  const getOrderTotal = (order) => {
    if (order.total_amount) return parseFloat(order.total_amount)
    if (order.total) return parseFloat(order.total)
    return (order.items || []).reduce((sum, item) => sum + (parseFloat(item.unit_price || 0) * (item.quantity || 0)), 0)
  }

  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A'
    const d = dateVal._seconds ? new Date(dateVal._seconds * 1000) : new Date(parseFloat(dateVal))
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 fade-in transition-colors duration-300">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-48 h-full opacity-10">
          <div className="w-48 h-48 rounded-full bg-white absolute -top-12 -right-12" />
          <div className="w-32 h-32 rounded-full bg-white absolute bottom-0 right-16" />
        </div>
        <p className="text-sky-100 text-sm font-500 mb-1 opacity-90 font-display">Good morning 👋</p>
        <h2 className="font-display text-2xl font-700 mb-1">Welcome back, {admin?.name?.split(' ')[0] || 'Admin'}!</h2>
        <p className="text-sky-100 text-sm opacity-90">Here's what's happening with your store today.</p>
        <div className="mt-4 flex items-center gap-2">
          <MdTrendingUp size={16} className="text-sky-100" />
          <span className="text-sky-100 text-sm">Revenue is up <strong className="text-white font-700 underline underline-offset-4 decoration-sky-300/30">14.2%</strong> compared to last month</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} dark:bg-white/5 ${s.text} flex items-center justify-center`}>
                <s.icon size={20} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-600 ${s.up ? 'text-emerald-500' : 'text-rose-400'}`}>
                {s.up ? <MdArrowUpward size={12} /> : <MdArrowDownward size={12} />}
                {s.change}
              </span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-500 mb-1">{s.label}</p>
            <p className="font-display text-2xl font-700 text-slate-800 dark:text-white transition-colors">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white dark:bg-black rounded-2xl p-5 shadow-card dark:shadow-none border dark:border-white/5 transition-colors duration-300">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-700 text-slate-800 dark:text-white transition-colors">Revenue Overview</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Last 6 months performance</p>
            </div>
            <span className="bg-sky-50 dark:bg-white/5 text-sky-600 dark:text-sky-400 text-xs font-600 px-3 py-1.5 rounded-xl transition-colors">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-white/5" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'currentColor' }} className="text-slate-400 dark:text-slate-600" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} className="text-slate-400 dark:text-slate-600" axisLine={false} tickLine={false} tickFormatter={v => `LKR ${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders chart */}
        <div className="bg-white dark:bg-black rounded-2xl p-5 shadow-card dark:shadow-none border dark:border-white/5 transition-colors duration-300">
          <div className="mb-5">
            <h3 className="font-display font-700 text-slate-800 dark:text-white transition-colors">Orders</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-white/5" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'currentColor' }} className="text-slate-400 dark:text-slate-600" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} className="text-slate-400 dark:text-slate-600" axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#818cf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white dark:bg-black rounded-2xl shadow-card dark:shadow-none border dark:border-white/5 overflow-hidden transition-colors duration-300">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="font-display font-700 text-slate-800 dark:text-white transition-colors">Recent Orders</h3>
          <span className="text-xs text-sky-500 dark:text-sky-400 font-600 cursor-pointer hover:underline">View all →</span>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5">
                <th className="text-left px-5 py-3 text-xs font-600 text-slate-400 dark:text-slate-500 uppercase tracking-wide">Order</th>
                <th className="text-left px-5 py-3 text-xs font-600 text-slate-400 dark:text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-600 text-slate-400 dark:text-slate-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                <th className="text-left px-5 py-3 text-xs font-600 text-slate-400 dark:text-slate-500 uppercase tracking-wide">Total</th>
                <th className="text-left px-5 py-3 text-xs font-600 text-slate-400 dark:text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {(liveStats.recentOrders || []).map((o, i) => (
                <tr key={i} className="table-row border-t border-slate-50 dark:border-white/5">
                  <td className="px-5 py-3.5 font-600 text-slate-700 dark:text-slate-300">#{o.id.slice(-6).toUpperCase()}</td>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-500 text-slate-700 dark:text-slate-200 transition-colors">{o.customer_name || 'Guest'}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{o.customer_email || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500 hidden sm:table-cell">{formatDate(o.order_date)}</td>
                  <td className="px-5 py-3.5 font-600 text-slate-700 dark:text-slate-300 transition-colors">LKR {getOrderTotal(o).toFixed(2)}</td>
                  <td className="px-5 py-3.5"><OrderBadge status={o.status || 'Success'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
