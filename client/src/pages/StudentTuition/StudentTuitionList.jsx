import React, { useState, useEffect } from "react";
import {
  CCard, CCardHeader, CCardBody, CRow, CCol, CFormSelect, 
  CSpinner, CTable, CTableHead, CTableRow, CTableHeaderCell, 
  CTableBody, CTableDataCell, CBadge, CFormInput, CInputGroup, CInputGroupText
} from "@coreui/react";
import CIcon from "@coreui/icons-react"; 
import { cilSearch, cilUser, cilMoney } from "@coreui/icons"; 
import { getStudentTuitionsByMonth } from "../../util/api"; // Đảm bảo import đúng đường dẫn api
import { useNavigate } from "react-router-dom";

const StudentTuitionList = () => {
  // --- State quản lý thời gian ---
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // --- State quản lý bộ lọc ---
  const [filterName, setFilterName] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // --- State debounce (Giá trị trễ của tên) ---
  const [debouncedName, setDebouncedName] = useState(filterName);

  // --- State dữ liệu ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // 1. Kỹ thuật Debounce: Chờ người dùng dừng gõ 600ms rồi mới update debouncedName
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedName(filterName);
    }, 600);

    return () => clearTimeout(timer);
  }, [filterName]);

  // 2. Tự động gọi API khi bất kỳ điều kiện lọc nào thay đổi
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lưu ý: Dùng debouncedName thay vì filterName để gọi API
        const res = await getStudentTuitionsByMonth(month, year, debouncedName, filterGrade, filterStatus);
        
        let listData = [];
        if (res && res.errCode === 0) {
          listData = res.data || [];
        } else if (res && res.data && Array.isArray(res.data)) {
          listData = res.data;
        } else if (Array.isArray(res)) {
            listData = res;
        }
        
        setData(listData);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Dependency array: API sẽ chạy lại khi 1 trong các biến này thay đổi
  }, [month, year, debouncedName, filterGrade, filterStatus]);

  // Hàm format tiền tệ
  const formatCurrency = (amount) => {
    return amount ? amount.toLocaleString("vi-VN") + " ₫" : "0 ₫";
  };

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader className="text-white fw-bold bg-primary d-flex align-items-center">
        <CIcon icon={cilMoney} className="me-2"/> Quản Lý Thu Học Phí
      </CCardHeader>
      <CCardBody>
        {/* --- KHU VỰC BỘ LỌC --- */}
        <CRow className="mb-4 g-3">
          {/* Tên học sinh */}
          <CCol md={4}>
             <label className="form-label fw-bold text-secondary">Tìm tên học sinh</label>
             <CInputGroup>
                <CInputGroupText className="bg-light"><CIcon icon={cilSearch}/></CInputGroupText>
                <CFormInput 
                    placeholder="Nhập tên học sinh..." 
                    value={filterName} 
                    // Sự kiện onChange cập nhật filterName -> kích hoạt debounce -> kích hoạt API
                    onChange={(e) => setFilterName(e.target.value)} 
                />
             </CInputGroup>
          </CCol>

          {/* Khối */}
          <CCol md={2}>
             <label className="form-label fw-bold text-secondary">Khối</label>
             <CFormSelect value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
               <option value="">-- Tất cả --</option>
               {[6, 7, 8, 9, 10, 11, 12].map(g => <option key={g} value={g}>Khối {g}</option>)}
             </CFormSelect>
          </CCol>

          {/* Trạng thái */}
          <CCol md={3}>
             <label className="form-label fw-bold text-secondary">Trạng thái đóng tiền</label>
             <CFormSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
               <option value="">-- Tất cả --</option>
               <option value="unpaid">Chưa đóng</option>
               <option value="partial">Nợ một phần</option>
               <option value="paid">Đã hoàn thành</option>
             </CFormSelect>
          </CCol>

          {/* Tháng */}
          <CCol md={1}>
             <label className="form-label fw-bold text-secondary">Tháng</label>
             <CFormSelect value={month} onChange={(e) => setMonth(e.target.value)}>
               {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
             </CFormSelect>
          </CCol>
          
          {/* Năm */}
          <CCol md={2}>
             <label className="form-label fw-bold text-secondary">Năm</label>
             <CFormSelect value={year} onChange={(e) => setYear(e.target.value)}>
                {Array.from({ length: 5 }, (_, i) => {
                   const y = new Date().getFullYear() - i + 1; 
                   return <option key={y} value={y}>{y}</option>;
                })}
             </CFormSelect>
          </CCol>
        </CRow>

        {/* --- BẢNG DỮ LIỆU --- */}
        <div className="table-responsive">
            <CTable striped hover bordered className="align-middle">
                <CTableHead color="light">
                <CTableRow className="text-center" style={{whiteSpace: 'nowrap'}}>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell className="text-start">Học sinh</CTableHeaderCell>
                    <CTableHeaderCell>Khối</CTableHeaderCell>
                    <CTableHeaderCell>Tổng phải thu</CTableHeaderCell>
                    <CTableHeaderCell>Đã đóng</CTableHeaderCell>
                    <CTableHeaderCell>Còn lại (Nợ)</CTableHeaderCell>
                    <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                    <CTableHeaderCell>Hành động</CTableHeaderCell>
                </CTableRow>
                </CTableHead>
                <CTableBody>
                {loading ? (
                    <CTableRow>
                        <CTableDataCell colSpan="8" className="text-center py-5">
                            <CSpinner color="primary" variant="grow"/>
                            <div className="mt-2 text-primary">Đang tải dữ liệu...</div>
                        </CTableDataCell>
                    </CTableRow>
                ) : data.length > 0 ? (
                    data.map((item, index) => (
                    <CTableRow key={item.tuitionId || index}>
                        <CTableDataCell className="text-center">{index + 1}</CTableDataCell>
                        <CTableDataCell>
                        <div className="fw-bold text-primary">{item.fullName}</div>
                        <small className="text-muted"><CIcon icon={cilUser} size="sm"/> {item.phoneNumber || "Chưa có SĐT"}</small>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">{item.grade}</CTableDataCell>
                        
                        {/* Cột tiền */}
                        <CTableDataCell className="text-end fw-bold">
                        {formatCurrency(item.totalAmount)}
                        </CTableDataCell>
                        <CTableDataCell className="text-end text-success">
                        {formatCurrency(item.paidAmount)}
                        </CTableDataCell>
                        <CTableDataCell className={item.remainingAmount > 0 ? "text-end text-danger fw-bold" : "text-end text-muted"}>
                        {formatCurrency(item.remainingAmount)}
                        </CTableDataCell>

                        {/* Cột trạng thái */}
                        <CTableDataCell className="text-center">
                        {item.status === "paid" && <CBadge color="success" shape="rounded-pill">Đã xong</CBadge>}
                        {item.status === "partial" && <CBadge color="warning" shape="rounded-pill">Nợ 1 phần</CBadge>}
                        {item.status === "unpaid" && <CBadge color="danger" shape="rounded-pill">Chưa đóng</CBadge>}
                        </CTableDataCell>

                        {/* Cột hành động */}
                        <CTableDataCell className="text-center">
                            {/* Nút bấm giữ nguyên logic link của bạn */}
                            <button 
                                className="btn btn-sm btn-outline-info"
                                title="Xem chi tiết & Thanh toán"
                                onClick={() => 
                                    navigate(`/admin/student-tuition-detail/${item.studentId}?month=${month}&year=${year}`)
                                }
                            >
                                Chi tiết
                            </button>
                        </CTableDataCell>
                    </CTableRow>
                    ))
                ) : (
                    <CTableRow>
                        <CTableDataCell colSpan="8" className="text-center p-4 text-muted">
                            <CIcon icon={cilSearch} size="3xl" className="mb-2 text-secondary"/>
                            <div>Không tìm thấy dữ liệu học phí phù hợp.</div>
                        </CTableDataCell>
                    </CTableRow>
                )}
                </CTableBody>
            </CTable>
        </div>
      </CCardBody>
    </CCard>
  );
};

export default StudentTuitionList;