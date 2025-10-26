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
    console.log("📦 API response:", res);

    if (res.errCode === 0) {
      // ✅ Thành công
      setMessage({
        type: "success",
        text: `Tạo bảng lương tháng ${month}/${year} thành công!`,
      });
      setNotes("");
    } else if (res.errCode === 409) {
      // ⚠️ Trùng bảng lương
      setMessage({
        type: "warning",
        text: res.message || `Bảng lương tháng ${month}/${year} đã được tạo trước đó!`,
      });
    } else {
      // ❌ Lỗi khác
      setMessage({
        type: "danger",
        text: res.message || "Không thể tạo bảng lương! Vui lòng thử lại sau.",
      });
    }
  } catch (err) {
    console.error("❌ Lỗi khi gọi API tạo bảng lương:", err);

    if (err.response) {
      setMessage({
        type: "danger",
        text: err.response.data?.message || "Lỗi server!",
      });
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
