  //AppSidebar.jsx
  import React, { useState, useEffect } from 'react';
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
  import { getUserApi } from '../../util/api'; // API lấy user
  import { CNavGroup } from '@coreui/react';
  import { cilSchool, cilCalendar } from '@coreui/icons';

  // sidebar nav config
  import navigation from '../../_nav'

  const AppSidebar = () => {
    const [roleId, setRoleId] = useState(null);
    const [filteredNavigation, setFilteredNavigation] = useState(navigation);
    const dispatch = useDispatch()
    const sidebarShow = useSelector((state) => state.ui.sidebarShow)
    const unfoldable = useSelector((state) => state.ui.sidebarUnfoldable)

useEffect(() => {
  const fetchUser = async () => {
    const user = await getUserApi();
    setRoleId(user.roleId);

    if (user.roleId === 'R1') {
      // tìm group "Lớp học"
      const classGroup = navigation.find(item => item.name === 'Lớp học');

      // lấy 2 item cần thiết, đổi tên và gán icon
      const myClasses = classGroup?.items
        .filter(i => i.name === 'Danh sách lớp học' || i.name === 'Lịch trống giáo viên')
        .map(i => {
          if (i.name === 'Danh sách lớp học') 
            return { ...i, name: 'Lớp học của tôi', icon: <CIcon icon={cilSchool} customClassName="nav-icon" /> };
          if (i.name === 'Lịch trống giáo viên') 
            return { ...i, name: 'Lịch dạy của tôi', icon: <CIcon icon={cilCalendar} customClassName="nav-icon" /> };
          return i;
        }) || [];

      // menu mới: giữ Trang chủ + Tin tức + 2 item này
      const filteredNav = navigation
        .filter(item => item.name === 'Trang chủ' || item.name === 'Tin tức')
        .concat(myClasses);

      setFilteredNavigation(filteredNav);
    } else {
      setFilteredNavigation(navigation); // role khác -> full menu
    }
  };

  fetchUser();
}, []);

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

        <AppSidebarNav items={filteredNavigation} />
        <CSidebarFooter className="border-top d-none d-lg-flex">
          <CSidebarToggler
            onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
          />
        </CSidebarFooter>
      </CSidebar>
    )
  }

  export default React.memo(AppSidebar)
