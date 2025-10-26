import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  CCard,
  CCardBody,
  CButton,
  CSpinner,
  CRow,
  CCol,
} from '@coreui/react'
import {
  cilCalendar,
  cilPencil,
  cilBook,
  cilSchool,
  cilDollar,
  cilClock,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import '../../styles/TeacherDetail.css'

const TeacherDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await axios.get(`http://localhost:8088/v1/api/teacher-subjects/${id}`)
        setTeacher(res.data)
      } catch (error) {
        console.error('Lỗi tải chi tiết giáo viên:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTeacher()
  }, [id])

  if (loading) {
    return (
      <div className="loading-spinner">
        <CSpinner color="primary" />
        <p>Đang tải dữ liệu...</p>
      </div>
    )
  }

  if (!teacher) {
    return <p className="text-center text-muted mt-5">Không tìm thấy thông tin giáo viên</p>
  }

  const DetailItem = ({ icon, label, value }) => (
    <div className="detail-item">
      <CIcon icon={icon} className="detail-item-icon" size="lg" />
      <div>
        <small className="detail-item-label">{label}</small>
        <div className="detail-item-value">{value || '—'}</div>
      </div>
    </div>
  )

  return (
    <div className="teacher-detail-container">
      <CCard className="teacher-card">
        <CCardBody>
          {/* ===== Nút hành động trên cùng ===== */}
          <div className="top-action-buttons">
            <CButton
              color="primary"
              variant="outline"
              onClick={() => navigate(`/admin/teacher-payments/edit/${id}`)}
            >
              <CIcon icon={cilPencil} className="me-1" /> Chỉnh sửa
            </CButton>
          </div>

          <CRow>
            {/* ===== Cột trái - Thông tin cá nhân ===== */}
            <CCol md={5} className="teacher-left">
              <div className="teacher-avatar-wrapper">
                <img
                  src={teacher.teacherAvatar || '/default-avatar.png'}
                  alt={teacher.teacherName}
                  className="teacher-avatar"
                  onError={(e) => (e.target.src = '/default-avatar.png')}
                />
              </div>
              <h4 className="teacher-name">{teacher.teacherName || '—'}</h4>
              <p className="teacher-email">{teacher.email || '—'}</p>

              <div className="teacher-info-section">
                <DetailItem icon={cilCalendar} label="Ngày sinh" value={teacher.dateOfBirth} />
                <DetailItem icon={cilPencil} label="Chuyên môn" value={teacher.specialty} />
              </div>
            </CCol>

            {/* ===== Cột phải - Hợp đồng & chuyên môn ===== */}
            <CCol md={7} className="teacher-right">
              <h5 className="section-title">Thông tin Hợp đồng & Giảng dạy</h5>
              <div className="teacher-info-section">
                <DetailItem icon={cilBook} label="Môn dạy" value={teacher.subjectName} />
                <DetailItem icon={cilSchool} label="Lớp" value={teacher.grade} />
                <DetailItem icon={cilDollar} label="Lương theo giờ" value={teacher.salaryRate} />
                <DetailItem icon={cilClock} label="Ngày tạo thỏa thuận" value={teacher.createdAt} />
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default TeacherDetail
