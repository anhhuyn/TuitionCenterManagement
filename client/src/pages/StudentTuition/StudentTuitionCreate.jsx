import React, { useState } from "react";
import {
  CCard, CCardHeader, CCardBody,
  CForm, CFormInput, CFormSelect, CButton, CSpinner, CAlert
} from "@coreui/react";
import { createStudentTuitions } from "../../util/api"; // Chú ý đường dẫn import

const StudentTuitionCreate = () => {
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
      const res = await createStudentTuitions({ month, year, notes });
      
      const serverData = (res && res.errCode !== undefined) ? res : (res?.data || {});

      if (serverData.errCode === 0) {
        setMessage({ type: "success", text: serverData.message || "Tạo hóa đơn thành công!" });
        setNotes("");
      } else if (serverData.errCode === 409) {
        setMessage({ type: "warning", text: serverData.message || "Hóa đơn tháng này đã tồn tại!" });
      } else {
        setMessage({ type: "danger", text: serverData.message || "Lỗi tạo hóa đơn!" });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi kết nối server!";
      // Check 409 từ catch
      if (err.response?.status === 409) {
         setMessage({ type: "warning", text: msg });
      } else {
         setMessage({ type: "danger", text: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <CCard>
      <CCardHeader className="bg-warning text-white fw-bold">Tạo Hóa Đơn Học Phí</CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleCreate}>
          <div className="mb-3">
            <CFormSelect label="Tháng" value={month} onChange={(e) => setMonth(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}
            </CFormSelect>
          </div>
          <div className="mb-3">
            <CFormSelect label="Năm" value={year} onChange={(e) => setYear(e.target.value)}>
              {Array.from({ length: 5 }, (_, i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </CFormSelect>
          </div>
          <div className="mb-3">
            <CFormInput label="Ghi chú" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <CButton type="submit" color="primary" className="text-white" disabled={loading}>
            {loading ? <CSpinner size="sm" /> : "Tạo hóa đơn"}
          </CButton>
        </CForm>
        {message && <CAlert color={message.type} className="mt-3">{message.text}</CAlert>}
      </CCardBody>
    </CCard>
  );
};
export default StudentTuitionCreate;