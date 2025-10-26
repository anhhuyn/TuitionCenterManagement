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
// Thêm icon cho các trường thông tin, ví dụ: @coreui/icons-react
// Giả sử đã cài đặt @coreui/icons-react và coreui/icons
// Nếu không dùng thư viện icon, bạn có thể bỏ qua phần import này
import {
  cilCalendar,
  cilPencil,
  cilBook,
  cilSchool,
  cilDollar,
  cilClock,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const TeacherDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await axios.get(`http://localhost:8088/v1/api/teacher-subjects/${id}`)
        // Giả lập một chút dữ liệu nếu API trả về thiếu để giao diện đẹp hơn
        setTeacher(res.data) 
      } catch (error) {
        console.error('❌ Lỗi tải chi tiết giáo viên:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeacher()
  }, [id])

  // --- Render Loading/Error ---
  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p className="mt-2">Đang tải dữ liệu...</p>
      </div>
    )
  }

  if (!teacher) {
    return <p className="text-center text-muted mt-5">Không tìm thấy thông tin giáo viên</p>
  }

  // --- Component con cho từng dòng thông tin để tái sử dụng ---
  const DetailItem = ({ icon, label, value }) => (
    <div className="d-flex align-items-center mb-3">
      <CIcon icon={icon} className="me-3 text-info" size="xl" />
      <div>
        <small className="text-muted d-block fw-semibold">{label}</small>
        <strong className="text-dark fs-6">{value || '—'}</strong>
      </div>
    </div>
  )

  // --- Render Giao diện chính ---
  return (
    <div className="container py-4">
      <CButton
        color="secondary"
        onClick={() => navigate(-1)}
        className="mb-4 d-flex align-items-center"
      >
        <CIcon icon={cilSchool} className="me-2" />
        Quay lại
      </CButton>
      <div className="d-flex justify-content-center">
        <CCard
          className="shadow-lg border-0"
          style={{ maxWidth: '800px', borderRadius: '20px' }}
        >
          {/* Header với Avatar */}
          <div
            className="text-center p-4"
            style={{
              backgroundColor: '#e6f7ff', // Màu xanh nhạt dễ chịu
              borderRadius: '20px 20px 0 0',
            }}
          >
            <img
              src={teacher.teacherAvatar || '/default-avatar.png'}
              alt={teacher.teacherName}
              className="rounded-circle shadow-lg mb-3"
              style={{
                width: '150px', // Tăng kích thước avatar
                height: '150px',
                objectFit: 'cover',
                border: '6px solid #fff',
              }}
              onError={(e) => (e.target.src = '/default-avatar.png')}
            />

            <h3 className="fw-bold text-primary mb-1 mt-2">
              {teacher.teacherName || '—'}
            </h3>
            <p className="text-secondary fw-normal mb-0">
              <CIcon icon={cilPencil} className="me-1" size="sm" />
              {teacher.email || '—'}
            </p>
          </div>

          {/* Body Thông tin chi tiết */}
          <CCardBody className="p-5">
            <h5 className="mb-4 text-info fw-bold">Thông tin Hợp đồng & Chuyên môn</h5>

            <CRow>
              {/* Cột 1: Thông tin cá nhân */}
              <CCol md={6}>
                <DetailItem
                  icon={cilCalendar}
                  label="Ngày sinh"
                  value={teacher.dateOfBirth}
                />
                <DetailItem
                  icon={cilPencil}
                  label="Chuyên môn"
                  value={teacher.specialty}
                />
                <DetailItem
                  icon={cilBook}
                  label="Môn dạy"
                  value={teacher.subjectName}
                />
              </CCol>

              {/* Cột 2: Thông tin Hợp đồng */}
              <CCol md={6}>
                <DetailItem
                  icon={cilSchool}
                  label="Lớp"
                  value={teacher.grade}
                />
                <DetailItem
                  icon={cilDollar}
                  label="Lương theo giờ"
                  value={teacher.salaryRate}
                />
                <DetailItem
                  icon={cilClock}
                  label="Thời gian tạo thỏa thuận"
                  value={teacher.createdAt}
                />
              </CCol>
            </CRow>
            
            {/* Có thể thêm nút hành động ở đây */}
            <div className="text-center mt-4 pt-3 border-top">
              <CButton color="success" className="me-2 px-4 shadow-sm">
                ✅ Chấp nhận
              </CButton>
              <CButton color="danger" variant="outline" className="px-4 shadow-sm">
                ❌ Từ chối
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </div>
    </div>
  )
}

export default TeacherDetail