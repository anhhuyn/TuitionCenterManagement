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
import ConfirmModal from '../../components/modal/ConfirmModal' 

const TeacherPaymentList = () => {
  const [teacherSubjects, setTeacherSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [subjectToDelete, setSubjectToDelete] = useState(null)
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    grade: '',
    teacherName: '',
    subjectName: '',
  })

useEffect(() => {
  const delay = setTimeout(() => {
    fetchData()
  }, 500)

  return () => clearTimeout(delay)
}, [filters])

const fetchData = async (customFilters = filters) => {
  try {
    setLoading(true)

    const params = {}

    if (customFilters.grade) params.grade = customFilters.grade
    if (customFilters.teacherName) params.teacherName = customFilters.teacherName
    if (customFilters.subjectName) params.subjectName = customFilters.subjectName

    const res = await axios.get(
      'http://localhost:8088/v1/api/teacher-subjects',
      { params }
    )

    if (res.data && res.data.errCode === 0) {
      setTeacherSubjects(res.data.data)
    } else {
      setTeacherSubjects([])
    }
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu:', error)
    setTeacherSubjects([])
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

const handleConfirmDelete = async () => {
  if (!subjectToDelete) return
  try {
    const res = await axios.delete(`http://localhost:8088/v1/api/teacher-subjects/${subjectToDelete}`)
    
    // Check errCode từ backend
    if (res.data && res.data.errCode === 0) {
        setTeacherSubjects((prev) => prev.filter((item) => item.id !== subjectToDelete))
    } else {
        alert(res.data.message || "Xóa thất bại ở server!")
    }
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
{/* Header + Filter */}
<div className="mb-4">
  {/* Tiêu đề + nút thêm */}
  <div className="d-flex justify-content-between align-items-center mb-3">
    <h4 className="fw-bold mb-0">Danh sách thỏa thuận lương</h4>
    <CButton
      color="success"
      size="sm"
      onClick={handleCreateNew}
      className="d-flex align-items-center gap-2"
    >
      <FiPlus /> Thêm thỏa thuận mới
    </CButton>
  </div>

  {/* Filter */}
  <div className="bg-white rounded shadow-sm p-3">
    <div className="row align-items-center g-3">

      {/* Lớp */}
      <div className="col-md-2">
        <input
          type="number"
          className="form-control form-control-sm"
          placeholder="Lớp"
          value={filters.grade}
          onChange={(e) =>
            setFilters({ ...filters, grade: e.target.value })
          }
        />
      </div>

      {/* Giáo viên */}
      <div className="col-md-4">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Tên giáo viên"
          value={filters.teacherName}
          onChange={(e) =>
            setFilters({ ...filters, teacherName: e.target.value })
          }
        />
      </div>

      {/* Môn học */}
      <div className="col-md-4">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Tên môn học"
          value={filters.subjectName}
          onChange={(e) =>
            setFilters({ ...filters, subjectName: e.target.value })
          }
        />
      </div>

      {/* Action */}
<div className="col-md-2 d-flex justify-content-end gap-2">
  <CButton
    color="info"
    size="sm"
    shape="rounded-pill"
    className="px-3"
    onClick={() => fetchData()}
    disabled={!filters.grade && !filters.teacherName && !filters.subjectName}
  >
    Lọc
  </CButton>

  <CButton
    color="danger"
    size="sm"
    shape="rounded-pill"
    variant="outline"
    className="px-3"
    onClick={() => {
      const reset = { grade: '', teacherName: '', subjectName: '' }
      setFilters(reset)
      fetchData(reset)
    }}
  >
    Xóa
  </CButton>
</div>

    </div>
  </div>
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
