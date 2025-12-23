import React, { useState, useEffect } from "react";
import {
  CCard, CCardHeader, CCardBody, CRow, CCol, CFormSelect, CButton, 
  CSpinner, CTable, CTableHead, CTableRow, CTableHeaderCell, 
  CTableBody, CTableDataCell, CBadge, CFormInput, CInputGroup
} from "@coreui/react";
import CIcon from "@coreui/icons-react"; // Nếu có dùng icon
import { cilSearch } from "@coreui/icons"; // Nếu có dùng icon
import { getStudentTuitionsByMonth } from "../../util/api";
import { useNavigate } from "react-router-dom";

const StudentTuitionList = () => {
  // --- State quản lý thời gian ---
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // --- State quản lý bộ lọc ---
  const [filterName, setFilterName] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // --- State dữ liệu ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Hàm format tiền tệ
  const formatCurrency = (amount) => {
    return amount ? amount.toLocaleString("vi-VN") + " ₫" : "0 ₫";
  };

  const handleFetchData = async () => {
    setLoading(true);
    try {
      // Gọi API với đầy đủ tham số lọc
      const res = await getStudentTuitionsByMonth(month, year, filterName, filterGrade, filterStatus);
      
      let listData = [];
      if (res.errCode === 0) {
        listData = res.data || [];
      } else if (res.data && Array.isArray(res.data)) {
        listData = res.data; // Fallback tùy cấu trúc response
      }
      
      setData(listData);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Tự động tải lại khi đổi Tháng hoặc Năm (Optional)
  useEffect(() => {
    handleFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  return (
    <CCard>
      <CCardHeader className="text-white fw-bold bg-primary">
        Quản Lý Thu Học Phí
      </CCardHeader>
      <CCardBody>
        {/* --- KHU VỰC BỘ LỌC --- */}
        <CRow className="mb-4 g-3">
          <CCol md={2}>
             <label className="form-label">Tháng</label>
             <CFormSelect value={month} onChange={(e) => setMonth(e.target.value)}>
               {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}
             </CFormSelect>
          </CCol>
          <CCol md={2}>
             <label className="form-label">Năm</label>
             <CFormSelect value={year} onChange={(e) => setYear(e.target.value)}>
                {Array.from({ length: 5 }, (_, i) => {
                   const y = new Date().getFullYear() - i + 1; // Lấy cả năm sau
                   return <option key={y} value={y}>{y}</option>;
                })}
             </CFormSelect>
          </CCol>
          <CCol md={3}>
             <label className="form-label">Tìm tên học sinh</label>
             <CFormInput 
                placeholder="Nhập tên..." 
                value={filterName} 
                onChange={(e) => setFilterName(e.target.value)} 
             />
          </CCol>
          <CCol md={2}>
             <label className="form-label">Khối</label>
             <CFormSelect value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
               <option value="">Tất cả</option>
               {[6, 7, 8, 9, 10, 11, 12].map(g => <option key={g} value={g}>Khối {g}</option>)}
             </CFormSelect>
          </CCol>
          <CCol md={2}>
             <label className="form-label">Trạng thái</label>
             <CFormSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
               <option value="">Tất cả</option>
               <option value="unpaid">Chưa đóng</option>
               <option value="partial">Nợ một phần</option>
               <option value="paid">Đã xong</option>
             </CFormSelect>
          </CCol>
          <CCol md={1} className="d-flex align-items-end">
             <CButton color="primary" onClick={handleFetchData} disabled={loading} className="w-100">
               {loading ? <CSpinner size="sm" /> : "Tìm"}
             </CButton>
          </CCol>
        </CRow>

        {/* --- BẢNG DỮ LIỆU --- */}
        {data.length > 0 ? (
          <CTable striped hover bordered responsive className="align-middle">
            <CTableHead color="light">
              <CTableRow className="text-center">
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Học sinh</CTableHeaderCell>
                <CTableHeaderCell>Khối</CTableHeaderCell>
                <CTableHeaderCell>Tổng phải thu</CTableHeaderCell>
                <CTableHeaderCell>Đã đóng</CTableHeaderCell>
                <CTableHeaderCell>Còn lại</CTableHeaderCell>
                <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                <CTableHeaderCell>Hành động</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {data.map((item, index) => (
                <CTableRow key={item.tuitionId || index}>
                  <CTableDataCell className="text-center">{index + 1}</CTableDataCell>
                  <CTableDataCell>
                    <div className="fw-bold">{item.fullName}</div>
                    <small className="text-muted">{item.phoneNumber}</small>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">{item.grade}</CTableDataCell>
                  
                  {/* Cột tiền */}
                  <CTableDataCell className="text-end fw-bold text-primary">
                    {formatCurrency(item.totalAmount)}
                  </CTableDataCell>
                  <CTableDataCell className="text-end text-success">
                    {formatCurrency(item.paidAmount)}
                  </CTableDataCell>
                  <CTableDataCell className="text-end text-danger fw-bold">
                    {formatCurrency(item.remainingAmount)}
                  </CTableDataCell>

                  {/* Cột trạng thái */}
                  <CTableDataCell className="text-center">
                    {item.status === "paid" && <CBadge color="success">Đã xong</CBadge>}
                    {item.status === "partial" && <CBadge color="warning">Nợ 1 phần</CBadge>}
                    {item.status === "unpaid" && <CBadge color="danger">Chưa đóng</CBadge>}
                  </CTableDataCell>

                  {/* Cột hành động */}
                  <CTableDataCell className="text-center">
                    <CButton 
                      size="sm" 
                      color="info" 
                      className="text-white"
                      title="Xem chi tiết & Thanh toán"
                      onClick={() => 
                        // Truyền studentId, month, year theo đúng yêu cầu Controller Detail
                        navigate(`/admin/student-tuition-detail/${item.studentId}?month=${month}&year=${year}`)
                      }
                    >
                      Chi tiết
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        ) : (
          !loading && <div className="text-center p-4 text-muted">Không tìm thấy dữ liệu phù hợp.</div>
        )}
      </CCardBody>
    </CCard>
  );
};

export default StudentTuitionList;