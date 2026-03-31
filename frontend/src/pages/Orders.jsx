import React, { useState, useEffect } from 'react'
import { MdSearch, MdVisibility, MdReceipt, MdShoppingBag } from 'react-icons/md'
import Modal from '../components/Modal'
import { OrderBadge, Btn } from '../components/UI'
import html2pdf from 'html2pdf.js'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewOrder, setViewOrder] = useState(null)
  const [isPrinting, setIsPrinting] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/orders')
      const data = await res.json()
      if (data.status === 'success') {
        setOrders(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    if (!viewOrder) return
    setIsPrinting(true)
    
    const element = document.getElementById('order-receipt')
    const opt = {
      margin: [10, 10],
      filename: `Order_${viewOrder.id.toUpperCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    html2pdf().set(opt).from(element).save().then(() => {
      setIsPrinting(false)
    }).catch(err => {
      console.error('PDF Generation Error:', err)
      setIsPrinting(false)
    })
  }

  const calculateTotal = (order) => {
    if (order.total_amount) return parseFloat(order.total_amount)
    if (order.total) return parseFloat(order.total)
    return (order.items || []).reduce((sum, item) => sum + (parseFloat(item.unit_price || 0) * (item.quantity || 0)), 0)
  }

  const filtered = orders.filter(o => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_email || '').toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  // Format date from Timestamp or Number
  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A'
    // Handle numeric timestamp (ms) or Firestore Timestamp
    const d = dateVal._seconds ? new Date(dateVal._seconds * 1000) : new Date(parseFloat(dateVal))
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="p-4 lg:p-6 fade-in transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-xl font-700 text-slate-800 dark:text-white transition-colors">Orders</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{orders.length} live orders from Firestore</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-black rounded-2xl shadow-card dark:shadow-none border dark:border-white/5 p-4 mb-4 transition-colors duration-300">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 flex-1 focus-within:border-sky-300 focus-within:bg-white dark:focus-within:bg-black transition-all">
          <MdSearch className="text-slate-400 dark:text-slate-500" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search order ID or customer name..."
            className="bg-transparent text-sm outline-none flex-1 text-slate-600 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-black rounded-2xl shadow-card dark:shadow-none border dark:border-white/5 overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 transition-colors">
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 dark:text-slate-500 uppercase tracking-wide">Order ID</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 dark:text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 dark:text-slate-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 dark:text-slate-500 uppercase tracking-wide">Total</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-400 dark:text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-600 text-slate-400 dark:text-slate-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {isLoading && orders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-slate-400 dark:text-slate-600">Loading orders...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-slate-300 dark:text-slate-700 text-sm">No orders found</td></tr>
              ) : filtered.map((o) => (
                <tr key={o.id} className="table-row border-t border-slate-50 dark:border-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-700 text-slate-700 dark:text-slate-300 font-mono text-xs bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-lg">#{o.id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 transition-colors">
                    <div>
                      <p className="font-600">{o.customer_name || 'Guest User'}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{o.customer_email || 'No email'}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500 text-xs hidden sm:table-cell transition-colors">{formatDate(o.order_date)}</td>
                  <td className="px-5 py-3.5 font-700 text-slate-700 dark:text-slate-300 transition-colors">LKR {calculateTotal(o).toFixed(2)}</td>
                  <td className="px-5 py-3.5">
                    <OrderBadge status={o.status || 'Success'} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setViewOrder(o)}
                      className="p-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-500/10 text-slate-400 hover:text-sky-500 transition-colors"
                    >
                      <MdVisibility size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title="Order Summary" width="max-w-2xl">
        {viewOrder && (
          <div className="p-0 overflow-hidden">
            <div className="p-6 space-y-6" id="order-receipt">
              {/* Order Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                <div>
                  <p className="text-[10px] font-700 text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Order Identification</p>
                  <p className="font-700 font-mono text-slate-800 dark:text-white text-lg">#{viewOrder.id.toUpperCase()}</p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-[10px] font-700 text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Payment Status</p>
                  <OrderBadge status={viewOrder.status || 'Success'} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Customer Details */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-xs font-700 text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    Customer Information
                  </h4>
                  <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-600 font-700">
                        {(viewOrder.customer_name || 'G').charAt(0)}
                      </div>
                      <div>
                        <p className="font-600 text-slate-800 dark:text-slate-200">{viewOrder.customer_name || 'Guest User'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{viewOrder.customer_email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logistics & Payment */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-xs font-700 text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Payment Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-3">
                      <p className="text-[10px] font-600 text-slate-400 mb-1">Method</p>
                      <p className="text-sm font-600 text-slate-700 dark:text-slate-300">{viewOrder.payment || 'PayHere'}</p>
                    </div>
                    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-3">
                      <p className="text-[10px] font-600 text-slate-400 mb-1">Date</p>
                      <p className="text-sm font-600 text-slate-700 dark:text-slate-300">{formatDate(viewOrder.order_date)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xs font-700 text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <MdShoppingBag size={14} className="text-emerald-500" />
                  Purchased Items
                </h4>
                <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-white/5 text-slate-400 text-[10px] font-700 uppercase tracking-wider">
                        <th className="text-left px-4 py-2">Item</th>
                        <th className="text-center px-4 py-2">Qty</th>
                        <th className="text-right px-4 py-2">Price</th>
                        <th className="text-right px-4 py-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                      {viewOrder.items && viewOrder.items.length > 0 ? (
                        viewOrder.items.map((item, idx) => (
                          <tr key={idx} className="text-slate-600 dark:text-slate-300">
                            <td className="px-4 py-3 font-500">{item.product_name}</td>
                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-right">LKR {parseFloat(item.unit_price || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-600">LKR {(item.quantity * (item.unit_price || 0)).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No items detailed in this record</td></tr>
                      )}
                    </tbody>
                  </table>
                  <div className="bg-slate-50 dark:bg-white/5 p-4 flex justify-between items-center">
                    <span className="text-xs font-700 text-slate-400 uppercase">Grand Total</span>
                    <span className="text-lg font-700 text-slate-800 dark:text-white">LKR {calculateTotal(viewOrder).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10 flex justify-end bg-slate-50/50 dark:bg-black">
              <Btn variant="secondary" onClick={() => setViewOrder(null)}>Close Receipt</Btn>
              <Btn 
                onClick={handlePrint}
                disabled={isPrinting}
                className="ml-2 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
              >
                {isPrinting ? (
                  <span className="flex items-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Generating...</span>
                ) : (
                  <>
                    <MdReceipt size={18} className="mr-2" />
                    Print Order
                  </>
                )}
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
