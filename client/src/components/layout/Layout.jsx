import React from 'react'
import { useSelector } from 'react-redux'
import AppHeader from './AppHeader' 
import AppSidebar from './AppSidebar'

const Layout = ({ children }) => {
  const sidebarShow = useSelector(state => state.ui.sidebarShow)

  return (
    <div className="d-flex">
      <AppSidebar />
      <div
        className="flex-grow-1 d-flex flex-column min-vh-100"
        style={{ marginLeft: sidebarShow ? '250px' : '0', transition: 'margin-left 0.3s ease' }}
      >
        <AppHeader />
        <main style={{ padding: '20px', flexGrow: 1 }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
