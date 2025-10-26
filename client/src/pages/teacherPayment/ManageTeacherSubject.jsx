import React, { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CCardHeader, CButton, CForm, CFormInput,
  CFormLabel, CFormSelect, CAlert, CSpinner, CRow, CCol,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom' // ✅ Import useParams
// Giữ nguyên các hàm API
import { 
    createTeacherSubjectApi, 
    getTeacherBasicListApi, 
    getSubjectsApi,
    updateTeacherSubjectApi, 
    getTeacherSubjectByIdApi 
} from '../../util/api' 

// ✅ Đổi tên component thành ManageTeacherSubject
const ManageTeacherSubject = () => {
  const navigate = useNavigate()
  // 🎯 Lấy ID từ URL (Nếu có ID -> Chế độ chỉnh sửa)
  const { id } = useParams() 
  const isEditMode = !!id; // Biến cờ: true nếu là chỉnh sửa, false nếu là tạo mới

  // 1. STATE MANAGEMENT
  const [formData, setFormData] = useState({
    teacherId: '',
    subjectId: '',
    salaryRate: '',
  })
  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false) // Trạng thái Submit
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [dataLoading, setDataLoading] = useState(true) // Tải dependencies (GV, MH)
  // 🎯 State mới: Tải dữ liệu cũ ban đầu khi ở chế độ chỉnh sửa
  const [initialDataLoading, setInitialDataLoading] = useState(isEditMode) 

  // Tiêu đề Form
  const formTitle = isEditMode 
    ? '✍️ Chỉnh Sửa Thỏa Thuận Lương' 
    : '➕ Tạo Thỏa Thuận Lương Giáo Viên Mới';


useEffect(() => {
  const loadDependenciesAndData = async () => {
    setDataLoading(true); // Bắt đầu tải dependencies
    setInitialDataLoading(isEditMode); // Bắt đầu tải dữ liệu cũ nếu là chế độ Edit
    setError(null);

    try {
      const [teachersRes, subjectsRes] = await Promise.all([
        getTeacherBasicListApi(),
        getSubjectsApi()
      ]);

      setTeachers(teachersRes.data || []);
      
      const subjectData = subjectsRes.data;
      let rawSubjects = (subjectData && Array.isArray(subjectData.rows))
          ? subjectData.rows
          : Array.isArray(subjectData) ? subjectData : [];

      const normalizedSubjects = rawSubjects.map(s => ({
          id: s.id,
          name: s.name || s.subjectName || 'Không tên',
          grade: s.grade || s.classGrade || 'Không lớp',
      }));
      setSubjects(normalizedSubjects.filter(s => s.id));
      
      console.log('✅ Teachers loaded:', teachersRes.data);
      console.log('✅ Subjects loaded:', subjectsRes.data);

      if (isEditMode) {
        const initialData = await getTeacherSubjectByIdApi(id);
      if (!initialData ) {
          throw new Error('Không tìm thấy dữ liệu thỏa thuận hoặc dữ liệu bị thiếu trường.');
        }
        let rawSalaryRate = initialData.salaryRate;
        let cleanSalaryRate = '';

        // 2. 🎯 LOGIC MỚI: Trích xuất số từ chuỗi định dạng
        if (typeof rawSalaryRate === 'string') {
          // Loại bỏ mọi ký tự không phải số. 
          // Ví dụ: "50.000 VNĐ/giờ" -> "50000"
          cleanSalaryRate = rawSalaryRate.replace(/[^0-9]/g, '');
        } else if (typeof rawSalaryRate === 'number') {
          // Trường hợp BE đôi khi trả về số, dù đã format cho list
          cleanSalaryRate = String(rawSalaryRate);
        } else {
          cleanSalaryRate = '';
        }

        setFormData({
          teacherId: String(initialData.teacherId),
          subjectId: String(initialData.subjectId),
          // Đảm bảo giá trị cuối cùng là chuỗi số đơn giản
          salaryRate: cleanSalaryRate, 
        });
        
      }
      
    } catch (err) {
      console.error('❌ Lỗi tải dữ liệu:', err)
      
      let errorMsg = 'Lỗi tải dữ liệu. Vui lòng kiểm tra ID và kết nối API.';

      // ✅ Tối ưu hóa xử lý lỗi dựa trên Response từ Axios (Nếu API Utility đã throw)
      if (err.response && err.response.status === 404) {
          errorMsg = `Không tìm thấy thỏa thuận lương cho ID: ${id}.`;
      }
      else if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
      }
      // Trường hợp lỗi BE ném ra thông báo (ví dụ: 'Dữ liệu thỏa thuận bị thiếu...')
      else if (err.message) {
          errorMsg = err.message;
      }
      
      setError(errorMsg);
      
      if (isEditMode && errorMsg.includes('Không tìm thấy thỏa thuận')) {
          setTimeout(() => navigate('/admin/teacher-payments'), 3000);
      }
    } finally {
        setDataLoading(false);
        if (isEditMode) {
            setInitialDataLoading(false);
        }
    }
  }
  loadDependenciesAndData()
}, [id, isEditMode, navigate])

  // 3. FORM HANDLERS
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError(null) 
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation 
    if (!formData.teacherId || !formData.subjectId || !formData.salaryRate) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.')
      return
    }
    const rate = Number(formData.salaryRate);
    if (isNaN(rate) || rate <= 0 || rate > 999999999) { 
      setError('Mức lương phải là số nguyên dương hợp lệ.')
      return
    }

    setLoading(true)
    try {
      const dataToSend = {
        teacherId: Number(formData.teacherId),
        subjectId: Number(formData.subjectId),
        salaryRate: rate,
      }
      if (isEditMode) {
        // GỌI API CẬP NHẬT
        await updateTeacherSubjectApi(id, dataToSend); 
      } else {
        await createTeacherSubjectApi(dataToSend); 
      }

      setSuccess(isEditMode ? 'Cập nhật thỏa thuận thành công! Đang chuyển hướng...' : 'Tạo thỏa thuận thành công! Đang chuyển hướng...');
      setTimeout(() => {
        navigate('/admin/teacher-payments') 
      }, 1500)
    } catch (err) {
      const defaultMessage = isEditMode ? 'Cập nhật thất bại do lỗi hệ thống.' : 'Tạo thỏa thuận thất bại do lỗi hệ thống.';
      const errorMessage = err.response?.data?.message || defaultMessage;
      
      if (errorMessage.includes('Thỏa thuận đã tồn tại')) {
         setError('Thỏa thuận đã tồn tại! Giáo viên này đã được phân công dạy môn học này.');
      } else {
         setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  // 4. RENDER UI
  // Sử dụng isLoading để quản lý trạng thái tải (data deps + initial data)
  const isLoading = dataLoading || initialDataLoading;
// Thêm console.log ngay trước khi return để xem state cuối cùng
console.log('Final formData:', formData);
console.log('isEditMode:', isEditMode);


  return (
    <CRow className="justify-content-center">
      <CCol md={8} lg={6}>
        <CCard className="shadow-sm border-0">
          <CCardHeader className="bg-primary text-white">
          <h4 className="mb-0">{formTitle}</h4>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {success && <CAlert color="success">{success}</CAlert>}

            {dataLoading ? (
             <div className="text-center py-5">
                <CSpinner color="primary" /> {isEditMode ? 'Đang tải dữ liệu cũ...' : 'Đang tải dữ liệu cơ bản...'}
              </div>
            ) : (
              <CForm onSubmit={handleSubmit}>
                <CRow className="g-3">
                  {/* 1. CHỌN GIÁO VIÊN */}
                  <CCol xs={12}>
                    <CFormLabel htmlFor="teacherId">
                      👨‍🏫 Giáo viên <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect
                      id="teacherId"
                      name="teacherId"
                      value={formData.teacherId}
                      onChange={handleChange}
                      // 🎯 VÔ HIỆU HÓA khi chỉnh sửa
                      disabled={loading || isEditMode}
                      required
                    >
                      <option value="">Chọn Giáo viên</option>
    {teachers.map((t) => (
        // ✅ Đảm bảo value là CHUỖI
        <option key={t.id} value={String(t.id)}> 
            {t.fullName} ({t.email}) 
        </option>
                      ))}
                    </CFormSelect>
                    {isEditMode && <div className="form-text">Không thể thay đổi giáo viên hoặc môn học khi chỉnh sửa.</div>}
                  </CCol>

                  {/* 2. CHỌN MÔN HỌC & LỚP */}
                  <CCol md={6} xs={12}>
                    <CFormLabel htmlFor="subjectId">
                      📚 Môn học <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect
                      id="subjectId"
                      name="subjectId"
                      value={formData.subjectId}
                      onChange={handleChange}
                      // 🎯 VÔ HIỆU HÓA khi chỉnh sửa
                      disabled={loading || isEditMode}   
                      required
                    >
                     <option value="">Chọn Môn học & Lớp</option>
    {subjects.map((s) => (
        // ✅ Đảm bảo value là CHUỖI
        <option key={s.id} value={String(s.id)}> 
            {s.name} (Lớp {s.grade})
        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  {/* 3. MỨC LƯƠNG THEO GIỜ */}
                  <CCol md={6} xs={12}>
                    <CFormLabel htmlFor="salaryRate">
                      💵 Mức Lương theo giờ (VNĐ) <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      id="salaryRate"
                      name="salaryRate"
                      type="number"
                      value={formData.salaryRate}
                      onChange={handleChange}
                      placeholder="Ví dụ: 50000"
                      disabled={loading}
                      required
                    />
                  </CCol>

                  {/* 4. HAI NÚT HÀNH ĐỘNG */}
                  <CCol xs={12} className="mt-4 d-flex justify-content-between">
                    <CButton 
                      color="secondary" 
                      onClick={() => navigate('/admin/teacher-payments')} 
                      disabled={loading}
                    >
                      Quay lại
                    </CButton>
                    <CButton color="primary" type="submit" disabled={loading}>
                      {loading ? (
                        <CSpinner size="sm" component="span" aria-hidden="true" className="me-1" />
                      ) : (
                        isEditMode ? 'Lưu Cập Nhật' : 'Tạo Thỏa Thuận' // Thay đổi văn bản nút
                      )}
                    </CButton>
                  </CCol>
                </CRow>
              </CForm>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ManageTeacherSubject