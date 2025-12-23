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
        to: '/admin/classlist',
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
    to: '/admin/announcements',
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
        name: 'Đề xuất mở lớp',
        to: '/base/breadcrumbs',
      },
      {
        component: CNavItem,
        name: (
          <React.Fragment>
            {'Thời khóa biểu'}
            <CIcon icon={cilExternalLink} size="sm" className="ms-2" />
          </React.Fragment>
        ),
        href: 'https://coreui.io/react/docs/components/calendar/',
        badge: {
          color: 'danger',
          text: 'PRO',
        },
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
        name: 'Học viên trong lớp',
        to: '/buttons/button-groups',
      },
      {
        component: CNavItem,
        name: 'Chuyển lớp',
        to: '/buttons/dropdowns',
      },
       {
        component: CNavItem,
        name: 'Chờ xếp lớp',
        to: '/buttons/dropdowns',
      },
      
    ],
  },
  {
    component: CNavGroup,
    name: 'Kết nối phụ huynh',
    icon: <CIcon icon={cilChatBubble} customClassName="nav-icon" />,
    items: [
      
      {
        component: CNavItem,
        name: 'Danh sách phụ huynh',
        to: '/forms/checks-radios',
      },
      {
        component: CNavItem,
        name: 'Phản hồi',
        to: '/forms/floating-labels',
      },
      {
        component: CNavItem,
        name: 'Cảnh báo học viên',
        to: '/forms/form-control',
      },
    ],
  },
 
  {
    component: CNavGroup,
    name: 'Tài liệu',
    icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Tài liệu học',
        to: '/notifications/alerts',
      },
      {
        component: CNavItem,
        name: 'Đề thi',
        to: '/notifications/badges',
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
        name: 'Duyệt lịch nghỉ',
        to: '/register',
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
        name: 'Thông tin thanh toán',
        to: '/login',
      },
      {
        component: CNavItem,
        name: 'Thu chi',
        to: '/register',
      },
      {
        component: CNavItem,
        name: 'Duyệt thanh toán',
        to: '/404',
      },
    ],
  },
  
]

export default _nav
