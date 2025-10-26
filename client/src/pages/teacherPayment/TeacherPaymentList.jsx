import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CSpinner,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { FiTrash2, FiPlus, FiEdit2, FiEye } from 'react-icons/fi'
import '../../styles/TeacherPaymentList.css'
import ConfirmModal from '../../components/modal/ConfirmModal' // ✅ thêm dòng này

const TeacherPaymentList = () => {
  const [teacherSubjects, setTeacherSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [subjectToDelete, setSubjectToDelete] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:8088/v1/api/teacher-subjects')
      setTeacherSubjects(res.data)
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  // Hàm tạo mới
  const handleCreateNew = () => {
    navigate('/admin/teacher-payments/create')
  }

  // Hàm chỉnh sửa
  const handleEdit = (id) => {
    navigate(`/admin/teacher-payments/edit/${id}`)
  }

  // ✅ Mở modal xác nhận xóa
  const confirmDelete = (id) => {
    setSubjectToDelete(id)
    setShowConfirmModal(true)
  }

  // ✅ Xóa sau khi người dùng xác nhận
  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return
    try {
      await axios.delete(`http://localhost:8088/v1/api/teacher-subjects/${subjectToDelete}`)
      setTeacherSubjects((prev) => prev.filter((item) => item.id !== subjectToDelete))
    } catch (error) {
      console.error('Lỗi khi xóa thỏa thuận:', error)
      alert('Xóa thất bại. Vui lòng thử lại.')
    } finally {
      setShowConfirmModal(false)
      setSubjectToDelete(null)
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
        <h2 className="fw-bold mb-0"></h2>
        <CButton
          color="success"
          onClick={handleCreateNew}
          className="d-flex align-items-center gap-2"
        >
          <FiPlus /> Thêm Thỏa Thuận Mới
        </CButton>
      </div>

      {/* GRID */}
      <div className="teacher-payment-grid">
        {teacherSubjects.length === 0 ? (
          <p className="text-center text-muted">Không có dữ liệu</p>
        ) : (
          teacherSubjects.map((item) => (
            <div key={item.id} className="teacher-card">
              <CCard className="shadow-sm border-0 position-relative">
                <CButton
                  color="danger"
                  size="sm"
                  variant="ghost"
                  className="delete-btn"
                  onClick={() => confirmDelete(item.id)} // ✅ mở modal thay vì xóa ngay
                >
                  <FiTrash2 />
                </CButton>

                <CCardHeader className="fw-semibold text-center">
                  {item.subjectName || 'Không rõ'} – Lớp {item.grade || '?'}
                </CCardHeader>

                <CCardBody className="py-4 px-3">
                  <div className="d-flex flex-column align-items-center">
                    <img
                      src={
                        item.teacherAvatar && item.teacherAvatar.trim() !== ''
                          ? item.teacherAvatar
                          : '/default-avatar.png'
                      }
                      alt={item.teacherName || 'Avatar'}
                      className="rounded-circle shadow-sm mb-3"
                      onError={(e) => {
                        if (e.target.src.indexOf('default-avatar.png') === -1) {
                          e.target.src = '/default-avatar.png'
                        }
                      }}
                      style={{
                        width: '90px',
                        height: '90px',
                        objectFit: 'cover',
                      }}
                    />

                    <h6 className="fw-bold text-dark mb-1">
                      {item.teacherName || 'Chưa rõ'}
                    </h6>
                    <p className="text-muted small mb-3">{item.email || '—'}</p>

                    <div className="info-box text-start w-100 mb-3">
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
                        className="d-flex align-items-center gap-1"
                        onClick={() => navigate(`/admin/teacher-payments/${item.id}`)}
                      >
                        <FiEye /> Xem chi tiết
                      </CButton>

                      <CButton
                        color="warning"
                        variant="outline"
                        size="sm"
                        className="d-flex align-items-center gap-1"
                        onClick={() => handleEdit(item.id)}
                      >
                        <FiEdit2 /> Chỉnh sửa
                      </CButton>
                    </div>
                  </div>
                </CCardBody>
              </CCard>
            </div>
          ))
        )}
      </div>

      {/* ✅ Modal xác nhận xóa */}
      {showConfirmModal && (
        <ConfirmModal
          title="Xác nhận xóa thỏa thuận"
          message="Bạn có chắc chắn muốn xóa thỏa thuận này không?"
          cancelText="Hủy"
          confirmText="Xóa"
          onCancel={() => {
            setShowConfirmModal(false)
            setSubjectToDelete(null)
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}

export default TeacherPaymentList
