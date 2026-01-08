import React, { useState, useEffect } from "react";
import {
  CCard, CCardHeader, CCardBody, CRow, CCol, CFormSelect, CFormInput,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CBadge, CInputGroup, CInputGroupText, CSpinner
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilFilter, cilMoney, cilUser } from "@coreui/icons";
import { getTeacherPaymentsByMonth } from "../../util/api"; // Đảm bảo đường dẫn đúng
import { useNavigate } from "react-router-dom";

const TeacherPaymentList = () => {
  // State quản lý thời gian
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // State quản lý bộ lọc
  const [searchName, setSearchName] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); 
  
  // State debounce
  const [debouncedName, setDebouncedName] = useState(searchName);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Xử lý Debounce: Chỉ update debouncedName khi dừng gõ 600ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedName(searchName);
    }, 600);

    return () => clearTimeout(timer);
  }, [searchName]);

  // 2. Gọi API: Chạy khi debouncedName hoặc các filter khác thay đổi
  useEffect(() => { // <--- ĐÃ SỬA LỖI seEffect THÀNH useEffect
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi API với debouncedName (giá trị đã được làm trễ)
        const res = await getTeacherPaymentsByMonth(month, year, debouncedName, filterStatus);
        
        let listPayment = [];
        if (res && res.errCode === 0) {
          listPayment = res.data || [];
        } else if (res && Array.isArray(res.data)) {
          listPayment = res.data;
        } else if (Array.isArray(res)) {
          listPayment = res;
        }
        setData(listPayment);
      } catch (error) {
        console.error("❌ Lỗi:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedName, filterStatus, month, year]);

  // Helper functions giữ nguyên
  const formatCurrency = (amount) => amount ? amount.toLocaleString("vi-VN") + " ₫" : "0 ₫";
  
  const getStatusBadge = (status) => {
    switch (status) {
      case "paid": return "success";
      case "partial": return "warning";
      case "unpaid": return "danger";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "paid": return "Đã thanh toán";
      case "partial": return "Thanh toán 1 phần";
      case "unpaid": return "Chưa thanh toán";
      default: return "Khác";
    }
  };

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader className="text-white fw-bold d-flex align-items-center justify-content-between" style={{ backgroundColor: "#7494ec" }}>
        <span><CIcon icon={cilMoney} className="me-2" /> QUẢN LÝ LƯƠNG GIÁO VIÊN</span>
      </CCardHeader>
      
      <CCardBody>
        {/* --- BỘ LỌC --- */}
        <CRow className="g-3 mb-4">
          <CCol md={4}> 
            <label className="form-label fw-bold text-secondary">Tìm tên giáo viên</label>
            <CInputGroup>
              <CInputGroupText className="bg-light"><CIcon icon={cilUser} /></CInputGroupText>
              <CFormInput 
                placeholder="Nhập tên..." 
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </CInputGroup>
          </CCol>

          <CCol md={3}>
            <label className="form-label fw-bold text-secondary">Trạng thái</label>
            <CFormSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">-- Tất cả --</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="partial">Thanh toán 1 phần</option>
              <option value="paid">Đã hoàn tất</option>
            </CFormSelect>
          </CCol>

          <CCol md={2}>
            <label className="form-label fw-bold text-secondary">Tháng</label>
            <CFormSelect value={month} onChange={(e) => setMonth(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}
            </CFormSelect>
          </CCol>

          <CCol md={3}>
            <label className="form-label fw-bold text-secondary">Năm</label>
            <CFormSelect value={year} onChange={(e) => setYear(e.target.value)}>
              {Array.from({ length: 5 }, (_, i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </CFormSelect>
          </CCol>
        </CRow>

        {/* --- BẢNG DỮ LIỆU --- */}
        <div className="table-responsive">
          <CTable striped hover bordered className="align-middle">
            <CTableHead className="text-center" style={{ backgroundColor: "#e8edfd", whiteSpace: "nowrap" }}>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell className="text-start">Giáo viên</CTableHeaderCell>
                <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                <CTableHeaderCell>Tổng lương</CTableHeaderCell>
                <CTableHeaderCell>Đã trả</CTableHeaderCell>
                <CTableHeaderCell>Còn lại (Nợ)</CTableHeaderCell>
                <CTableHeaderCell>Thao tác</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            
            <CTableBody>
              {/* Hiệu ứng Loading ngay trong bảng */}
              {loading ? (
                <CTableRow>
                  <CTableDataCell colSpan="7" className="text-center py-5">
                    <CSpinner color="primary" variant="grow"/>
                    <div className="mt-2 text-primary">Đang tải dữ liệu...</div>
                  </CTableDataCell>
                </CTableRow>
              ) : data.length > 0 ? (
                data.map((t, index) => {
                  const total = t.amount || 0;
                  const paid = t.paidAmount || 0;
                  const remaining = total - paid;
                  
                  return (
                    <CTableRow key={t.id} className="text-center">
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell className="text-start">
                        <div className="fw-bold text-primary">{t.teacher?.userInfo?.fullName}</div>
                        <div className="small text-muted">{t.teacher?.userInfo?.phoneNumber}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={getStatusBadge(t.status)} shape="rounded-pill">{getStatusLabel(t.status)}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="fw-bold">{formatCurrency(total)}</CTableDataCell>
                      <CTableDataCell className="text-success">{formatCurrency(paid)}</CTableDataCell>
                      <CTableDataCell className={remaining > 0 ? "text-danger fw-bold" : "text-muted"}>
                        {formatCurrency(remaining)}
                      </CTableDataCell>
                      <CTableDataCell>
                        {/* Lưu ý: Bạn cần update lại đường dẫn này cho khớp với router của bạn */}
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/admin/teacher-main-payments/${t.teacher?.id}?month=${month}&year=${year}`)}
                        >
                          Xem chi tiết
                        </button>
                      </CTableDataCell>
                    </CTableRow>
                  );
                })
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="7" className="text-center py-4 text-muted">
                    <CIcon icon={cilFilter} size="3xl" className="mb-2" />
                    <p>Không tìm thấy bảng lương nào phù hợp.</p>
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

export default TeacherPaymentList;