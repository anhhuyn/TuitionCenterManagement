import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CButton,
  CSpinner,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const TeacherPaymentList = () => {
  const [teacherSubjects, setTeacherSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:8088/v1/api/teacher-subjects')
      setTeacherSubjects(res.data)
    } catch (error) {
      console.error('❌ Lỗi khi tải dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Hàm tạo mới
  const handleCreateNew = () => {
    navigate('/admin/teacher-payments/create')
  }

  // ✅ Hàm chỉnh sửa
  const handleEdit = (id) => {
    navigate(`/admin/teacher-payments/edit/${id}`)
  }

  // 🗑️ Hàm xóa thỏa thuận
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa thỏa thuận này không?')
    if (!confirmDelete) return

    try {
      await axios.delete(`http://localhost:8088/v1/api/teacher-subjects/${id}`)
      alert('🗑️ Xóa thỏa thuận thành công!')
      // Cập nhật lại danh sách sau khi xóa
      setTeacherSubjects((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error('❌ Lỗi khi xóa thỏa thuận:', error)
      alert('Xóa thất bại. Vui lòng thử lại.')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p>Đang tải dữ liệu...</p>
      </div>
    )
  }

  return (
    <div className="teacher-payment-container">
      {/* Tiêu đề và nút thêm */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary mb-0">👩‍🏫 Danh sách giáo viên & môn dạy</h2>
        <CButton color="success" onClick={handleCreateNew}>
          ➕ Thêm Thỏa Thuận Mới
        </CButton>
      </div>

      <CRow>
        {teacherSubjects.length === 0 ? (
          <p className="text-center text-muted">Không có dữ liệu</p>
        ) : (
          teacherSubjects.map((item) => (
            <CCol xs={12} sm={6} md={4} lg={3} key={item.id} className="mb-4">
              <CCard
                className="shadow-sm border-0 position-relative"
                style={{
                  borderRadius: '18px',
                  background: 'linear-gradient(180deg, #ffffff, #f7f9ff)',
                }}
              >
                {/* 🗑️ Nút Delete ở góc phải */}
                <CButton
                  color="danger"
                  size="sm"
                  variant="ghost"
                  className="position-absolute"
                  style={{
                    top: '10px',
                    right: '10px',
                    zIndex: 10,
                    borderRadius: '50%',
                  }}
                  onClick={() => handleDelete(item.id)}
                >
                  <CIcon icon={cilTrash} size="lg" />
                </CButton>

                <CCardHeader
                  className="fw-semibold"
                  style={{
                    background: '#5B72F2',
                    color: '#fff',
                    fontSize: '1rem',
                    padding: '0.8rem',
                    borderTopLeftRadius: '18px',
                    borderTopRightRadius: '18px',
                  }}
                >
                  {item.subjectName || 'Không rõ'} – Lớp {item.grade || '?'}
                </CCardHeader>

                <CCardBody className="py-4 px-3">
                  <div className="d-flex flex-column align-items-center">
                    <img
                      src={item.teacherAvatar || '/default-avatar.png'}
                      alt={item.teacherName}
                      className="rounded-circle shadow-sm mb-3"
                      style={{
                        width: '90px',
                        height: '90px',
                        objectFit: 'cover',
                        border: '3px solid #fff',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                      }}
                      onError={(e) => (e.target.src = '/default-avatar.png')}
                    />

                    <h6 className="fw-bold text-dark mb-1">{item.teacherName || 'Chưa rõ'}</h6>
                    <p className="text-muted small mb-3">{item.email || '—'}</p>

                    <div
                      className="info-box text-start p-3 w-100 mb-3"
                      style={{
                        background: '#eef1ff',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        lineHeight: '1.6',
                      }}
                    >
                      <p className="mb-2">
                        <strong className="text-secondary">Chuyên môn:</strong>{' '}
                        <span className="text-dark">{item.specialty || '—'}</span>
                      </p>
                      <p className="mb-2">
                        <strong className="text-secondary">Môn dạy:</strong>{' '}
                        <span className="text-dark">{item.subjectName || '—'}</span>
                      </p>
                      <p className="mb-0">
                        <strong className="text-secondary">Lớp:</strong>{' '}
                        <span className="text-dark">{item.grade || '—'}</span>
                      </p>
                    </div>

                    <div className="d-flex gap-2">
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/teacher-payments/${item.id}`)}
                      >
                        Xem chi tiết
                      </CButton>

                      <CButton
                        color="warning"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item.id)}
                      >
                        ✏️ Sửa
                      </CButton>
                    </div>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          ))
        )}
      </CRow>
    </div>
  )
}

export default TeacherPaymentList
