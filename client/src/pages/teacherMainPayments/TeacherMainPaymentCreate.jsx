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
      if (res.data.errCode === 0) {
        setMessage({
          type: "success",
          text: res.data.message,
        });
      }
    } catch (err) {
      setMessage({ type: "danger", text: "Tạo bảng lương thất bại!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CCard>
      <CCardHeader className="bg-warning text-white">
        🧾 Tạo bảng lương giáo viên
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

          <CButton type="submit" color="primary" className="mt-3" disabled={loading}>
            {loading ? <CSpinner size="sm" /> : "Tạo bảng lương"}
          </CButton>
        </CForm>

        {message && (
          <CAlert color={message.type} className="mt-3">
            {message.text}
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  );
};

export default TeacherPaymentCreate;
