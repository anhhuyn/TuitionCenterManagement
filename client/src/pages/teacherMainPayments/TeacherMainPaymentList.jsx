import React, { useState, useEffect } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CFormSelect,
  CFormInput,
  CButton,
  CSpinner,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CInputGroup,
  CInputGroupText,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilSearch, cilFilter, cilMoney, cilUser } from "@coreui/icons";
import { getTeacherPaymentsByMonth } from "../../util/api";
import { useNavigate } from "react-router-dom";

const TeacherPaymentList = () => {
  // State quản lý thời gian
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // State quản lý bộ lọc mới
  const [searchName, setSearchName] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // "" = All, "paid", "unpaid", "partial"

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Hàm gọi API (Cập nhật thêm tham số name và status)
  const handleFetchData = async () => {
    try {
      setLoading(true);
      
      // Lưu ý: Bạn cần chắc chắn hàm API getTeacherPaymentsByMonth trong file api.js 
      // đã chấp nhận thêm tham số (month, year, name, status) như Controller
      const res = await getTeacherPaymentsByMonth(month, year, searchName, filterStatus);
      
      console.log("📦 Dữ liệu từ API:", res);

      let listPayment = [];
      if (res.errCode === 0) {
        listPayment = res.data || [];
      } else if (res.data && Array.isArray(res.data)) {
        listPayment = res.data;
      } else if (Array.isArray(res)) {
        listPayment = res;
      }

      setData(listPayment);
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách lương:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Format tiền tệ
  const formatCurrency = (amount) => {
    return amount ? amount.toLocaleString("vi-VN") + " ₫" : "0 ₫";
  };

  // Helper: Lấy màu badge trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return "success"; // Xanh lá
      case "partial":
        return "warning"; // Vàng
      case "unpaid":
        return "danger";  // Đỏ
      default:
        return "secondary";
    }
  };

  // Helper: Dịch trạng thái sang tiếng Việt
  const getStatusLabel = (status) => {
    switch (status) {
      case "paid": return "Đã thanh toán";
      case "partial": return "Thanh toán 1 phần";
      case "unpaid": return "Chưa thanh toán";
      default: return "Không rõ";
    }
  };

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader
        className="text-white fw-bold d-flex align-items-center justify-content-between"
        style={{ backgroundColor: "#7494ec" }}
      >
        <span>
          <CIcon icon={cilMoney} className="me-2" />
          QUẢN LÝ LƯƠNG GIÁO VIÊN
        </span>
      </CCardHeader>
      
      <CCardBody>
        {/* --- KHU VỰC BỘ LỌC --- */}
        <CRow className="g-3 mb-4">
          {/* 1. Tìm theo tên */}
          <CCol md={3}>
            <label className="form-label fw-bold text-secondary">Tìm tên giáo viên</label>
            <CInputGroup>
              <CInputGroupText className="bg-light">
                <CIcon icon={cilUser} />
              </CInputGroupText>
              <CFormInput 
                placeholder="Nhập tên..." 
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </CInputGroup>
          </CCol>

          {/* 2. Lọc trạng thái */}
          <CCol md={3}>
            <label className="form-label fw-bold text-secondary">Trạng thái thanh toán</label>
            <CFormSelect
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">-- Tất cả --</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="partial">Thanh toán 1 phần</option>
              <option value="paid">Đã hoàn tất</option>
            </CFormSelect>
          </CCol>

          {/* 3. Chọn Tháng */}
          <CCol md={2}>
            <label className="form-label fw-bold text-secondary">Tháng</label>
            <CFormSelect value={month} onChange={(e) => setMonth(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </CFormSelect>
          </CCol>

          {/* 4. Chọn Năm */}
          <CCol md={2}>
            <label className="form-label fw-bold text-secondary">Năm</label>
            <CFormSelect value={year} onChange={(e) => setYear(e.target.value)}>
              {Array.from({ length: 5 }, (_, i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </CFormSelect>
          </CCol>

          {/* 5. Nút tìm kiếm */}
          <CCol md={2} className="d-flex align-items-end">
            <CButton
              className="w-100 text-white fw-bold"
              style={{ backgroundColor: "#7494ec", borderColor: "#7494ec" }}
              onClick={handleFetchData}
              disabled={loading}
            >
              {loading ? <CSpinner size="sm" /> : <><CIcon icon={cilSearch} className="me-1"/> Tìm kiếm</>}
            </CButton>
          </CCol>
        </CRow>

        {/* --- KHU VỰC BẢNG DỮ LIỆU --- */}
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
              {data.length > 0 ? (
                data.map((t, index) => {
                  // Tính toán hiển thị
                  const total = t.amount || 0;
                  const paid = t.paidAmount || 0;
                  const remaining = total - paid;
                  
                  return (
                    <CTableRow key={t.id} className="text-center">
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      
                      {/* Thông tin giáo viên */}
                      <CTableDataCell className="text-start">
                        <div className="fw-bold text-primary">{t.teacher?.userInfo?.fullName}</div>
                        <div className="small text-muted">{t.teacher?.userInfo?.phoneNumber}</div>
                      </CTableDataCell>
                      
                      {/* Trạng thái */}
                      <CTableDataCell>
                        <CBadge color={getStatusBadge(t.status)} shape="rounded-pill">
                          {getStatusLabel(t.status)}
                        </CBadge>
                      </CTableDataCell>
                      
                      {/* Tổng lương - In đậm */}
                      <CTableDataCell className="fw-bold">
                        {formatCurrency(total)}
                      </CTableDataCell>

                      {/* Đã trả - Màu xanh */}
                      <CTableDataCell className="text-success">
                        {formatCurrency(paid)}
                      </CTableDataCell>

                      {/* Còn lại - Màu đỏ nếu > 0 */}
                      <CTableDataCell className={remaining > 0 ? "text-danger fw-bold" : "text-muted"}>
                        {formatCurrency(remaining)}
                      </CTableDataCell>
                      
                      {/* Nút thao tác */}
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          variant="outline"
                          style={{ color: "#7494ec", borderColor: "#7494ec" }}
                          onClick={() =>
                            navigate(
                              `/admin/teacher-main-payments/${t.teacher?.id}?month=${month}&year=${year}`
                            )
                          }
                        >
                          Xem chi tiết
                        </CButton>
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