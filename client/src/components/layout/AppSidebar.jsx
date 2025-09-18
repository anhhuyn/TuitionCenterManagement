//AppSidebar.jsx
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import '../../styles/AppSidebar.css';


import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { AppSidebarNav } from './AppSidebarNav'
import logo from '../../assets/images/logo.png';
import { sygnet } from '../../assets/brand/sygnet';

// sidebar nav config
import navigation from '../../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.ui.sidebarShow)
const unfoldable = useSelector((state) => state.ui.sidebarUnfoldable)

  return (
    <CSidebar
  className="border-end custom-sidebar"
  position="fixed"
  unfoldable={unfoldable}
  visible={sidebarShow}
  onVisibleChange={(visible) => {
  dispatch({ type: 'set', payload: { sidebarShow: visible } })
}}
>

     <CSidebarHeader className="sidebar-header border-bottom">
  <CSidebarBrand to="/" className="app-sidebar-brand">
    <img src={logo} alt="Logo" className="app-sidebar-logo" />
    <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
  </CSidebarBrand>
  <CCloseButton
    className="d-lg-none"
    dark
    onClick={() => dispatch({ type: 'set', sidebarShow: false })}
  />
</CSidebarHeader>

      <AppSidebarNav items={navigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
