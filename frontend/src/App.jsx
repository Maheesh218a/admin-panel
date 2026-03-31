import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Users from './pages/Users'
import Banners from './pages/Banners'
import Orders from './pages/Orders'
import SignIn from './pages/SignIn'
import Settings from './pages/Settings'
import { AlertContainer } from './components/Alert'

const pages = {
  dashboard: { component: Dashboard, title: 'Dashboard', subtitle: "Welcome back! Here's an overview of your store." },
  products:  { component: Products,  title: 'Products',  subtitle: 'Manage your product catalogue.' },
  categories:{ component: Categories,title: 'Categories', subtitle: 'Organise your products into categories.' },
  users:     { component: Users,     title: 'Users',     subtitle: 'Manage registered customers and admins.' },
  banners:   { component: Banners,   title: 'Banners',   subtitle: 'Control promotional banners on your storefront.' },
  orders:    { component: Orders,    title: 'Orders',    subtitle: 'View and manage customer orders.' },
  settings:  { component: Settings,  title: 'Settings',  subtitle: 'Manage your profile and security settings.' },
}

export default function App() {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('adminData')) || null } catch { return null }
  })
  const [activePage, setActivePage] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const addAlert = useCallback((type, title, message) => {
    const id = Date.now() + Math.random()
    setAlerts(prev => [...prev, { id, type, title, message }])
  }, [])

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  const handleLogin = (adminData) => {
    setAdmin(adminData)
    localStorage.setItem('adminData', JSON.stringify(adminData))
  }

  const handleLogout = () => {
    setAdmin(null)
    localStorage.removeItem('adminData')
    setActivePage('dashboard')
    addAlert('info', 'Signed Out', 'You have been logged out successfully.')
  }

  if (!admin) {
    return (
      <>
        <AlertContainer alerts={alerts} removeAlert={removeAlert} />
        <SignIn onLogin={handleLogin} addAlert={addAlert} />
      </>
    )
  }

  const { component: PageComponent, title, subtitle } = pages[activePage] || pages.dashboard

  return (
    <div className="flex h-screen overflow-hidden bg-surface-100 dark:bg-black transition-colors duration-300">
      <AlertContainer alerts={alerts} removeAlert={removeAlert} />

      <Sidebar
        active={activePage}
        onNavigate={setActivePage}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        admin={admin}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title={title}
          subtitle={subtitle}
          onMenuToggle={() => setMobileOpen(true)}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          admin={admin}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <PageComponent key={activePage} admin={admin} addAlert={addAlert} onLogout={handleLogout} />
        </main>
      </div>
    </div>
  )
}
