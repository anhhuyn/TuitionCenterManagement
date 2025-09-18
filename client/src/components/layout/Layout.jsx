import React from 'react'
import { useSelector } from 'react-redux'
import AppHeader from './AppHeader'
import AppSidebar from './AppSidebar'

const Layout = ({ children }) => {
  const sidebarShow = useSelector(state => state.ui.sidebarShow)
  const sidebarWidth = sidebarShow ? 250 : 0

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <AppSidebar />

      {/* AppHeader cố định ở trên cùng */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: sidebarWidth,
          right: 0,
          height: '64px',
          zIndex: 1000,
          backgroundColor: '#fff',
          transition: 'left 0.3s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
        }}
      >
        <AppHeader />
      </div>

      {/* Main content */}
      <main
        style={{
          marginLeft: sidebarWidth,
          padding: '20px',
          paddingTop: '84px', 
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
          backgroundColor: 'transparent',
        }}
      >
        {children}
      </main>
    </div>
  )
}

export default Layout
