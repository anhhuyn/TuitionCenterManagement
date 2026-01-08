import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  CCard, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CSpinner, CButton, CBadge, CRow, CCol, CProgress, CProgressBar,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, 
  CFormLabel, CFormInput, CFormTextarea // <-- ĐÃ SỬA: CFormControl thành CFormInput
} from "@coreui/react";
import { getTeacherSalaryDetail, payTeacherSalary, updateTeacherPaymentDetail } from "../../util/api";
import Swal from "sweetalert2";
import CIcon from "@coreui/icons-react";
import { cilMoney, cilCheckCircle, cilWarning, cilPencil, cilSave } from "@coreui/icons";

const TeacherMainPaymentDetail = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const month = parseInt(params.get("month"));
  const year = parseInt(params.get("year"));
  
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // --- State cho Modal Edit ---
  const [editVisible, setEditVisible] = useState(false);
  const [editData, setEditData] = useState({
      detailId: null,
      subjectName: '',
      totalSessions: 0,
      bonus: 0,
      note: ''
  });
  const [savingDetail, setSavingDetail] = useState(false);

  // --- Hàm lấy dữ liệu ---
  const fetchDetail = async () => {
    try {
      const res = await getTeacherSalaryDetail(id, month, year);
      let data = (res && res.errCode === 0) ? res.data : (res?.data || null);
      if (Array.isArray(data)) data = data[0];
      setPaymentData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDetail();
  }, [id, month, year]);

  // --- Xử lý Thanh toán ---
  const handlePaySalary = async () => {
    if (!paymentData) return;
    const remaining = (Number(paymentData.amount) || 0) - (Number(paymentData.paidAmount) || 0);

    if (remaining <= 0) {
        Swal.fire("Thông báo", "Lương này đã được thanh toán đủ!", "info");
        return;
    }

    const { value: inputMoney, isConfirmed } = await Swal.fire({
      title: `<span style="color:#4F46E5">Thanh toán lương</span>`,
      html: `
        <div class="text-start">
            <p>Còn nợ: <b class="text-danger fs-5">${remaining.toLocaleString('vi-VN')} ₫</b></p>
            <label class="form-label fw-bold">Nhập số tiền chi trả:</label>
        </div>
      `,
      input: 'number',
      inputValue: remaining,
      showCancelButton: true,
      confirmButtonText: "Thanh toán",
      confirmButtonColor: "#4F46E5",
      inputValidator: (value) => {
        if (!value || Number(value) <= 0) return 'Số tiền không hợp lệ!';
        if (Number(value) > remaining) return 'Vượt quá số nợ!';
      }
    });

    if (isConfirmed && inputMoney) {
        try {
            setPaying(true);
            const res = await payTeacherSalary(paymentData.id, Number(inputMoney));
            if (res && res.errCode === 0) {
                Swal.fire("Thành công", "Giao dịch hoàn tất", "success");
                fetchDetail();
            } else {
                Swal.fire("Lỗi", res.message, "error");
            }
        } catch (e) {
            Swal.fire("Lỗi", "Lỗi kết nối", "error");
        } finally {
            setPaying(false);
        }
    }
  };

  // --- Xử lý Mở Modal Edit ---
  const handleOpenEdit = (item) => {
      setEditData({
          detailId: item.id,
          subjectName: item.subject?.name,
          totalSessions: item.totalSessions || 0,
          bonus: item.bonus || 0,
          note: item.note || ''
      });
      setEditVisible(true);
  };

  // --- Xử lý Lưu chi tiết ---
  const handleSaveDetail = async () => {
      try {
          setSavingDetail(true);
          const payload = {
              detailId: editData.detailId,
              totalSessions: Number(editData.totalSessions),
              bonus: Number(editData.bonus),
              note: editData.note
          };
          
          const res = await updateTeacherPaymentDetail(payload);

          if (res && res.errCode === 0) {
              setEditVisible(false);
              Swal.fire({
                  icon: 'success',
                  title: 'Cập nhật thành công',
                  text: 'Bảng lương đã được tính toán lại!',
                  timer: 1500,
                  showConfirmButton: false
              });
              fetchDetail();
          } else {
              Swal.fire("Lỗi", res.message || "Cập nhật thất bại", "error");
          }
      } catch (error) {
          Swal.fire("Lỗi", "Lỗi hệ thống", "error");
      } finally {
          setSavingDetail(false);
      }
  };

  // --- Styles ---
  const styles = {
    card: { border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", borderRadius: "12px", overflow: "hidden" },
    headerGradient: { background: "linear-gradient(135deg, #4F46E5 0%, #7494ec 100%)", color: "white", padding: "20px" },
    avatarCircle: { width: "50px", height: "50px", background: "#e0e7ff", color: "#4F46E5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "20px", marginRight: "15px" }
  };

  if (loading) return <div className="text-center my-5"><CSpinner color="primary" /></div>;
  if (!paymentData) return <div className="text-center mt-5 text-muted">Không tìm thấy dữ liệu.</div>;

  const teacherInfo = paymentData.teacher?.userInfo || {};
  const details = paymentData.paymentDetails || [];
  const total = Number(paymentData.amount) || 0;
  const paid = Number(paymentData.paidAmount) || 0;
  const remaining = total - paid;
  const percent = total > 0 ? Math.round((paid / total) * 100) : 0;
  const getInitials = (name) => name ? name.split(" ").slice(-2).map(n => n[0]).join("") : "GV";

  return (
    <div className="container-fluid p-0">
      {/* Header & Stats */}
      <CCard className="mb-4" style={styles.card}>
        <div style={styles.headerGradient}>
            <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <div style={styles.avatarCircle}>{getInitials(teacherInfo.fullName)}</div>
                    <div>
                        <h4 className="mb-0 fw-bold">{teacherInfo.fullName}</h4>
                        <div className="opacity-75" style={{fontSize: "14px"}}>{teacherInfo.email}</div>
                    </div>
                </div>
                <div className="text-end">
                    <div className="mb-1" style={{fontSize: "13px", opacity: 0.9}}>Kỳ lương</div>
                    <div className="fw-bold fs-5">Tháng {month} / {year}</div>
                </div>
            </div>
        </div>
        
        <CCardBody className="p-4 bg-light">
            <CRow className="g-4">
                <CCol md={4}>
                    <div className="shadow-sm h-100 p-3 rounded" style={{background: "#4F46E5", color: "white"}}>
                        <div className="text-uppercase opacity-75 small">Tổng lương</div>
                        <div className="fs-3 fw-bold">{total.toLocaleString('vi-VN')} ₫</div>
                    </div>
                </CCol>
                <CCol md={4}>
                    <div className="shadow-sm h-100 p-3 rounded" style={{background: "#10B981", color: "white"}}>
                         <div className="text-uppercase opacity-75 small">Đã thanh toán</div>
                         <div className="fs-3 fw-bold">{paid.toLocaleString('vi-VN')} ₫</div>
                    </div>
                </CCol>
                <CCol md={4}>
                    <div className="shadow-sm h-100 p-3 rounded" style={{background: "#F59E0B", color: "white"}}>
                         <div className="text-uppercase opacity-75 small">Còn nợ</div>
                         <div className="fs-3 fw-bold">{remaining.toLocaleString('vi-VN')} ₫</div>
                    </div>
                </CCol>
            </CRow>
             <div className="mt-4">
                <div className="d-flex justify-content-between mb-1 small fw-bold text-muted">
                    <span>Tiến độ thanh toán</span><span>{percent}%</span>
                </div>
                <CProgress height={8}><CProgressBar color={percent===100?"success":"primary"} value={percent} /></CProgress>
            </div>
        </CCardBody>
      </CCard>

      {/* Detail Table */}
      <CCard style={styles.card}>
        <CCardBody className="p-0">
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold text-dark">Chi tiết giảng dạy</h5>
                {paymentData.status === 'paid' ? <CBadge color="success">Đã hoàn tất</CBadge> : 
                 paymentData.status === 'partial' ? <CBadge color="info">Thanh toán 1 phần</CBadge> : 
                 <CBadge color="warning">Chưa thanh toán</CBadge>}
            </div>

            <CTable hover responsive className="mb-0 align-middle">
                <CTableHead className="bg-light text-secondary text-uppercase small">
                    <CTableRow>
                        <CTableHeaderCell className="ps-4 py-3">Môn học</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Số buổi</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Giờ</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Đơn giá</CTableHeaderCell>
                        <CTableHeaderCell className="text-end text-success">Thưởng</CTableHeaderCell> 
                        <CTableHeaderCell className="text-end">Thành tiền</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Sửa</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {details.map((item, i) => (
                        <CTableRow key={i}>
                            <CTableDataCell className="ps-4">
                                <div className="fw-semibold text-primary">{item.subject?.name}</div>
                                {item.note && <div className="text-muted small fst-italic">Note: {item.note}</div>}
                            </CTableDataCell>
                            <CTableDataCell className="text-center">{item.totalSessions}</CTableDataCell>
                            <CTableDataCell className="text-center">{Number(item.totalHours).toFixed(1)}</CTableDataCell>
                            <CTableDataCell className="text-end text-muted">{Number(item.salaryRate).toLocaleString('vi-VN')}</CTableDataCell>
                            <CTableDataCell className="text-end fw-bold text-success">
                                {item.bonus && item.bonus > 0 ? `+${Number(item.bonus).toLocaleString('vi-VN')}` : '-'}
                            </CTableDataCell>
                            <CTableDataCell className="text-end fw-bold">{Number(item.totalMoney).toLocaleString('vi-VN')} ₫</CTableDataCell>
                            <CTableDataCell className="text-center">
                                {paymentData.status !== 'paid' && (
                                    <CButton color="light" size="sm" className="text-primary shadow-sm" onClick={() => handleOpenEdit(item)}>
                                        <CIcon icon={cilPencil} size="sm"/>
                                    </CButton>
                                )}
                            </CTableDataCell>
                        </CTableRow>
                    ))}
                    <CTableRow className="bg-light fw-bold">
                        <CTableDataCell colSpan={5} className="text-end py-3 text-uppercase text-secondary">Tổng cộng</CTableDataCell>
                        <CTableDataCell className="text-end py-3 text-primary fs-6">{total.toLocaleString('vi-VN')} ₫</CTableDataCell>
                        <CTableDataCell></CTableDataCell>
                    </CTableRow>
                </CTableBody>
            </CTable>
        </CCardBody>
      </CCard>

      {/* Buttons */}
      <div className="d-flex justify-content-end mt-4 gap-2 pb-5">
         <CButton color="light" className="px-4 border fw-semibold" onClick={() => window.history.back()}>Quay lại</CButton>
         {remaining > 0 && (
             <CButton style={{background: "#4F46E5", border:"none"}} className="px-4 text-white fw-bold" onClick={handlePaySalary} disabled={paying}>
                {paying ? "Đang xử lý..." : "Thanh toán ngay"}
             </CButton>
         )}
      </div>

      {/* MODAL EDIT - ĐÃ SỬA CFormInput */}
      <CModal visible={editVisible} onClose={() => setEditVisible(false)} alignment="center">
        <CModalHeader>
            <CModalTitle>Chỉnh sửa chi tiết: <span className="text-primary">{editData.subjectName}</span></CModalTitle>
        </CModalHeader>
        <CModalBody>
            <div className="mb-3">
                <CFormLabel>Số buổi dạy</CFormLabel>
                <CFormInput // <-- ĐÃ SỬA TẠI ĐÂY
                    type="number" 
                    value={editData.totalSessions} 
                    onChange={(e) => setEditData({...editData, totalSessions: e.target.value})}
                />
                <div className="form-text text-muted">Hệ thống sẽ tự tính lại số giờ dạy dựa trên trung bình cũ.</div>
            </div>
            <div className="mb-3">
                <CFormLabel className="fw-bold text-success">Thưởng thêm (Bonus)</CFormLabel>
                <CFormInput // <-- ĐÃ SỬA TẠI ĐÂY
                    type="number" 
                    value={editData.bonus} 
                    onChange={(e) => setEditData({...editData, bonus: e.target.value})}
                />
            </div>
            <div className="mb-3">
                <CFormLabel>Ghi chú</CFormLabel>
                <CFormTextarea 
                    rows={3}
                    value={editData.note} 
                    onChange={(e) => setEditData({...editData, note: e.target.value})}
                ></CFormTextarea>
            </div>
        </CModalBody>
        <CModalFooter>
            
            <CButton color="primary" onClick={handleSaveDetail} disabled={savingDetail}>
                {savingDetail ? <CSpinner size="sm"/> : <><CIcon icon={cilSave} className="me-2"/> Lưu thay đổi</>}
            </CButton>
        </CModalFooter>
      </CModal>

    </div>
  );
};

export default TeacherMainPaymentDetail;