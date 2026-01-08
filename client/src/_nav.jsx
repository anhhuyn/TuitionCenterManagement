import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilDescription,
  cilExternalLink,
  cilSchool,
  cilHome,
  cilUser,
  cilChatBubble,
  cilBook,
  cilGroup,
  cilMoney,
   cilBarChart
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Trang chủ',
    to: '/dashboard',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
  },

   {
    component: CNavGroup,
    name: 'Thống kê',
    to: '/base',
    icon: <CIcon icon={ cilBarChart} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Doanh thu',
        to: '/admin/revenue-statistics',
      },
      {
        component: CNavItem,
        name: 'Lớp học',
        to: '/admin/statistics/classroom',
      },
       ],
  },

  {
    component: CNavTitle,
    name: 'Thông tin chung',
  },
  {
    component: CNavItem,
    name: 'Tin tức',
    to: '/announcements',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Lịch học chung',
    to: '/admin/sessions/daily',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Học tập',
  },
  {
    component: CNavGroup,
    name: 'Lớp học',
    to: '/base',
    icon: <CIcon icon={cilSchool} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Danh sách lớp học',
        to: '/admin/classlist',
      },
      {
        component: CNavItem,
        name: 'Lịch trống giáo viên',
        to: '/admin/teacher-schedule',
      },
      {
        component: CNavItem,
        name: 'Kiểm tra phòng trống',
        to: '/admin/room-schedule',
      },
      
    ],
  },
  {
    component: CNavGroup,
    name: 'Học viên',
    to: '/buttons',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Danh sách học viên',
        to: '/admin/hocvien',
      },
      {
        component: CNavItem,
        name: 'Học phí học sinh',
        to: '/admin/student-tuitions', // Trang danh sách
      },
      {
        component: CNavItem,
        name: 'Tạo hóa đơn học phí',
        to: '/admin/student-tuitions/create', // Trang tạo mới
      },
      
    ],
  },
  {
    component: CNavTitle,
    name: 'Quản lý',
  },
  {
    component: CNavGroup,
    name: 'Quản lý nhân viên',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Danh sách giáo viên',
        to: '/admin/nhanvien',
      },
      {
        component: CNavItem,
        name: 'Thỏa thuận giáo viên',
        to: '/admin/teacher-payments',
      },
      {
        component: CNavItem,
        name: 'Bảng lương chính thức',
        to: '/admin/teacher-main-payments',
      },
      {
        component: CNavItem,
        name: 'Tạo bảng lương',
        to: "/admin/teacher-main-payments/create",
      },

    ],
  },

  {
    component: CNavGroup,
    name: 'Quản lý tài chính',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
    items: [
    
      {
        component: CNavItem,
        name: 'Thống kê Doanh thu',
        to: '/admin/revenue-statistics', 
      }
    ],
  },
  
]

export default _nav
