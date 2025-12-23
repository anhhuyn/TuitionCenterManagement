import React, { useState } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CSpinner,
  CAlert,
} from "@coreui/react";
import { createTeacherPayments } from "../../util/api";

const TeacherPaymentCreate = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await createTeacherPayments({ month, year, notes });
      
      // LOGIC XỬ LÝ THÀNH CÔNG (Status 2xx)
      // Cố gắng lấy errCode từ res hoặc res.data
      const errCode = res.errCode !== undefined ? res.errCode : res.data?.errCode;
      
      if (errCode === 0 || errCode === undefined) { 
        // Nếu API trả về list trực tiếp hoặc errCode=0
        setMessage({
          type: "success",
          text: res.message || `Tạo bảng lương tháng ${month}/${year} thành công!`,
        });
        setNotes("");
      } 
    } catch (err) {
      console.error("❌ Lỗi API:", err);
      
      // LOGIC XỬ LÝ LỖI (Status 4xx, 5xx sẽ nhảy vào đây)
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data; // Dữ liệu backend trả về trong lỗi

        if (status === 409 || (data && data.errCode === 409)) {
          // ✅ Xử lý trường hợp "Đã tồn tại" -> Hiện màu Vàng
          setMessage({
            type: "warning",
            text: data.message || `Bảng lương tháng ${month}/${year} đã được tạo trước đó!`,
          });
        } else {
          // ❌ Các lỗi khác -> Hiện màu Đỏ
          setMessage({
            type: "danger",
            text: data?.message || "Lỗi server! Vui lòng thử lại.",
          });
        }
      } else {
        setMessage({
          type: "danger",
          text: "Không thể kết nối tới server!",
        });
      }
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };



  return (
    <CCard>
      <CCardHeader className="bg-warning text-white">
        Tạo bảng lương giáo viên
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleCreate}>
          <CFormSelect
            label="Tháng"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </CFormSelect>

          <CFormSelect
            label="Năm"
            value={year}
            className="mt-2"
            onChange={(e) => setYear(e.target.value)}
          >
            {Array.from({ length: 5 }, (_, i) => {
              const y = new Date().getFullYear() - i;
              return (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              );
            })}
          </CFormSelect>

          <CFormInput
            label="Ghi chú"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2"
          />

          <CButton
            type="submit"
            color="primary"
            className="mt-3"
            disabled={loading}
          >
            {loading ? <CSpinner size="sm" /> : "Tạo bảng lương"}
          </CButton>
        </CForm>

        {message && (
          <CAlert color={message.type} className="mt-3 text-center fw-bold">
            {message.text}
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  );
};

export default TeacherPaymentCreate;
