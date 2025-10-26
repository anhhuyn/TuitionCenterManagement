import React, { useState } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CFormSelect,
  CButton,
  CSpinner,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from "@coreui/react";
import { getTeacherPaymentsByMonth } from "../../util/api";
import { useNavigate } from "react-router-dom";

const TeacherPaymentList = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFetchData = async () => {
    try {
      setLoading(true);
      const res = await getTeacherPaymentsByMonth(month, year);
        if (res && res.errCode === 0) {
        setData(res.data || []);
        } else {
        setData([]);
        }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lương:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleCreatePayments = async () => {
  try {
    setLoading(true);
    await createTeacherPaymentsAPI({ month, year });
    await handleFetchData(); // reload bảng lương mới
  } catch (err) {
    console.error("Tạo bảng lương thất bại:", err);
  } finally {
    setLoading(false);
  }
};

  return (
    <CCard className="shadow-sm">
      <CCardHeader className="bg-success text-white">
        💰 Danh sách lương giáo viên
      </CCardHeader>
      <CCardBody>
        <CRow className="mb-3">
          <CCol md={3}>
            <CFormSelect value={month} onChange={(e) => setMonth(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol md={3}>
            <CFormSelect value={year} onChange={(e) => setYear(e.target.value)}>
              {Array.from({ length: 5 }, (_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                );
              })}
            </CFormSelect>
          </CCol>
          <CCol md={3}>
            <CButton color="primary" onClick={handleFetchData} disabled={loading}>
              {loading ? <CSpinner size="sm" /> : "Xem bảng lương"}
            </CButton>
          </CCol>
        </CRow>

        {data.length > 0 && (
          <CTable striped hover responsive bordered>
            <CTableHead className="table-success">
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Họ tên</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>SĐT</CTableHeaderCell>
                <CTableHeaderCell>Tổng tiền (VNĐ)</CTableHeaderCell>
                <CTableHeaderCell>Chi tiết</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {data.map((t, index) => (
                <CTableRow key={t.teacherId}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{t.fullName}</CTableDataCell>
                  <CTableDataCell>{t.email}</CTableDataCell>
                  <CTableDataCell>{t.phoneNumber}</CTableDataCell>
                  <CTableDataCell>
                    {t.totalAmount.toLocaleString("vi-VN")} ₫
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="info"
                      size="sm"
                      onClick={() =>
                        navigate(`/admin/teacher-main-payments/${t.teacherId}?month=${month}&year=${year}`)
                      }
                    >
                      Xem chi tiết
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  );
};

export default TeacherPaymentList;
