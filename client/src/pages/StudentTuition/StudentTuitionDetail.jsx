import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow, 
  CTableHeaderCell, CTableBody, CTableDataCell, CSpinner, CButton, 
  CBadge, CRow, CCol, CCallout, CTooltip
} from "@coreui/react";
// Import Icons (Đảm bảo bạn đã cài @coreui/icons-react và @coreui/icons)
import CIcon from "@coreui/icons-react";
import { cilPencil, cilMoney } from "@coreui/icons";

// Import API
import { 
    getStudentTuitionDetail, 
    payStudentTuition, 
    updateTuitionDetailApi // <--- Import hàm mới
} from "../../util/api";

import Swal from "sweetalert2";

const StudentTuitionDetail = () => {
  const { id } = useParams(); 
  const [params] = useSearchParams();
  const month = parseInt(params.get("month"));
  const year = parseInt(params.get("year"));
  
  const [tuitionData, setTuitionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- 1. Lấy dữ liệu chi tiết ---
  useEffect(() => {
    fetchDetail();
  }, [id, month, year]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await getStudentTuitionDetail(id, month, year);
      let data = null;
      if (res && res.errCode === 0) data = res.data; 
      else if (res && res.data) data = res.data;

      if (Array.isArray(data) && data.length > 0) data = data[0];
      setTuitionData(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi", "Không thể tải dữ liệu hóa đơn", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Tính toán hiển thị ---
  const totalAmount = tuitionData?.totalAmount || 0;
  const paidAmount = tuitionData?.paidAmount || 0;
  const remainingAmount = totalAmount - paidAmount;

  // --- 2. Xử lý Sửa chi tiết (Update Detail) ---
const handleEditDetail = async (item) => {
    const { value: formValues } = await Swal.fire({
      title: `Sửa: ${item.subject?.name}`,
      html: `
        <div class="text-start mb-3">
            <label class="small fw-bold">Số buổi thực tế:</label>
            <input id="swal-sessions" type="number" class="form-control" value="${item.attendedSessions}">
        </div>
        <div class="text-start mb-3">
            <label class="small fw-bold text-primary">Thành tiền:</label>
            <input id="swal-money" type="number" class="form-control" value="${item.totalMoney}">
            <small class="text-muted fst-italic d-block mt-1">
               💡 Mẹo: Xóa trắng ô tiền hoặc để nguyên giá cũ khi đổi số buổi => Hệ thống tự tính lại.
            </small>
        </div>
        <div class="text-start">
            <label class="small fw-bold">Ghi chú:</label>
            <input id="swal-note" type="text" class="form-control" placeholder="Lý do sửa..." value="${item.note || ''}">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      cancelButtonText: 'Hủy',
      preConfirm: () => {
        const newSessions = document.getElementById('swal-sessions').value;
        const inputMoney = document.getElementById('swal-money').value;
        const note = document.getElementById('swal-note').value;

        // --- LOGIC QUAN TRỌNG ĐỂ KÍCH HOẠT AUTO-CALC Ở BACKEND ---
        let finalMoney = inputMoney;

        // Nếu người dùng thay đổi số buổi VÀ (ô tiền bị xóa trắng HOẶC tiền vẫn y hệt giá cũ)
        // Thì gán finalMoney = null để Backend tự tính lại
        if (String(newSessions) !== String(item.attendedSessions)) {
            if (!inputMoney || String(inputMoney) === String(item.totalMoney)) {
                finalMoney = null; 
            }
        }

        // Nếu người dùng xóa trắng ô tiền dù không đổi số buổi -> cũng để null cho backend tính lại
        if (!inputMoney) {
             finalMoney = null;
        }

        return {
          detailId: item.id,
          attendedSessions: newSessions,
          totalMoney: finalMoney, // Gửi null nếu muốn auto, gửi số nếu muốn ghi đè
          note: note
        }
      }
    });

    if (formValues) {
        try {
            Swal.showLoading();
            const res = await updateTuitionDetailApi(formValues);
            Swal.close();
            
            if (res && res.errCode === 0) {
                await Swal.fire("Thành công", "Đã cập nhật chi tiết!", "success");
                // Cập nhật lại state với dữ liệu mới trả về từ server
                if (res.data) setTuitionData(res.data);
                else fetchDetail(); // Fallback nếu server không trả data
            } else {
                Swal.fire("Lỗi", res.message || "Cập nhật thất bại", "error");
            }
        } catch (e) {
            console.error(e);
            Swal.fire("Lỗi", "Lỗi kết nối server", "error");
        }
    }
  };

  // --- 3. Xử lý Thanh toán môn cụ thể (Pay specific subject) ---
  const handlePayForSubject = async (item) => {
     // Đây là lối tắt: Tự động điền số tiền của môn đó vào ô thanh toán
     // Backend vẫn dùng API thanh toán chung (cộng dồn vào paidAmount)
     const amountToPay = item.totalMoney;
     
     const { value: inputAmount } = await Swal.fire({
        title: `Thanh toán: ${item.subject?.name}`,
        html: `
            <p>Đóng tiền riêng cho môn này.</p>
            <label>Số tiền:</label>
        `,
        input: 'number',
        inputValue: amountToPay,
        showCancelButton: true,
        confirmButtonText: 'Xác nhận đóng',
        confirmButtonColor: "#2eb85c",
        inputValidator: (value) => {
            if (!value || value <= 0) return 'Số tiền phải lớn hơn 0';
            if (value > remainingAmount) return 'Số tiền vượt quá tổng nợ còn lại!';
        }
     });

     if (inputAmount) {
         processPayment(inputAmount);
     }
  };

  // --- 4. Xử lý Thanh toán tổng (Chung cho cả nút to và nút nhỏ) ---
  const handleGeneralPayment = async () => {
    if (remainingAmount <= 0) {
      Swal.fire("Thông báo", "Hóa đơn này đã hoàn tất!", "info");
      return;
    }

    const { value: inputAmount } = await Swal.fire({
      title: "Thu học phí",
      html: `
        <p>Còn nợ: <b style="color:red">${remainingAmount.toLocaleString("vi-VN")} ₫</b></p>
        <label>Nhập số tiền khách đóng:</label>
      `,
      input: "number",
      inputValue: remainingAmount,
      showCancelButton: true,
      confirmButtonText: "Xác nhận thu",
      confirmButtonColor: "#2eb85c",
      inputValidator: (value) => {
          if (!value || value <= 0) return 'Số tiền phải lớn hơn 0';
          if (value > remainingAmount) return 'Số tiền vượt quá tổng nợ còn lại!';
      }
    });

    if (inputAmount) {
        processPayment(inputAmount);
    }
  };

  // Hàm gọi API thanh toán chung
  const processPayment = async (amount) => {
      try {
        Swal.showLoading();
        // QUAN TRỌNG: Dùng tuitionData.id (ID hóa đơn cha)
        const res = await payStudentTuition(tuitionData.id, amount);
        Swal.close();

        if (res && res.errCode === 0) {
          await Swal.fire("Thành công", "Giao dịch thành công!", "success");
          if (res.data) setTuitionData(res.data);
        } else {
          Swal.fire("Lỗi", res.message || "Thanh toán thất bại", "error");
        }
      } catch (error) {
        console.error(error);
        Swal.fire("Lỗi", "Lỗi kết nối đến server", "error");
      }
  }

  if (loading) return <div className="text-center mt-5"><CSpinner color="primary"/></div>;
  if (!tuitionData) return <div className="text-center mt-5 text-danger">Không tìm thấy dữ liệu hóa đơn.</div>;

  return (
    <CCard>
      {/* --- Header --- */}
      <CCardHeader className="text-white fw-bold bg-primary d-flex justify-content-between align-items-center">
        <span>Chi Tiết Học Phí - Tháng {month}/{year}</span>
        <div>
           {tuitionData.status === "paid" && <CBadge color="success" shape="rounded-pill">Đã hoàn tất</CBadge>}
           {tuitionData.status === "partial" && <CBadge color="warning" shape="rounded-pill">Nợ một phần</CBadge>}
           {tuitionData.status === "unpaid" && <CBadge color="danger" shape="rounded-pill">Chưa đóng</CBadge>}
        </div>
      </CCardHeader>

      <CCardBody>
        {/* --- Thông tin chung --- */}
        <h5 className="mb-3">Học sinh: {tuitionData?.student?.userInfo?.fullName || tuitionData?.fullName}</h5>

        {/* --- Bảng chi tiết môn học (Đã nâng cấp) --- */}
        <CTable striped bordered hover responsive className="mb-4 align-middle">
          <CTableHead color="light">
            <CTableRow>
              <CTableHeaderCell>Môn học</CTableHeaderCell>
              <CTableHeaderCell className="text-center">Số buổi</CTableHeaderCell>
              <CTableHeaderCell className="text-center">Tổng giờ</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Đơn giá</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Thành tiền</CTableHeaderCell>
              <CTableHeaderCell className="text-center" style={{width: '120px'}}>Thao tác</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {tuitionData.details?.map((item, index) => (
              <CTableRow key={index}>
                <CTableDataCell>
                    <div className="fw-bold">{item.subject?.name}</div>
                    {/* Hiển thị Note nếu có */}
                    {item.note && (
                        <div className="text-danger small fst-italic mt-1">
                            * {item.note}
                        </div>
                    )}
                </CTableDataCell>
                <CTableDataCell className="text-center">{item.attendedSessions}</CTableDataCell>
                <CTableDataCell className="text-center">{item.totalHours}</CTableDataCell>
                <CTableDataCell className="text-end">{item.hourlyRate?.toLocaleString("vi-VN")}</CTableDataCell>
                
                {/* Highlight tiền màu xanh đậm */}
                <CTableDataCell className="text-end fw-bold text-primary">
                    {item.totalMoney?.toLocaleString("vi-VN")} ₫
                </CTableDataCell>

                {/* --- Cột Thao tác Mới --- */}
                <CTableDataCell className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                        {/* Nút Sửa */}
                        <CTooltip content="Sửa buổi/tiền/ghi chú">
                            <CButton color="warning" size="sm" variant="ghost" onClick={() => handleEditDetail(item)}>
                                <CIcon icon={cilPencil} />
                            </CButton>
                        </CTooltip>

                        {/* Nút Thanh toán môn này (Chỉ hiện nếu chưa trả hết) */}
                        {tuitionData.status !== 'paid' && (
                            <CTooltip content="Thanh toán riêng môn này">
                                <CButton color="success" size="sm" variant="ghost" onClick={() => handlePayForSubject(item)}>
                                    <CIcon icon={cilMoney} />
                                </CButton>
                            </CTooltip>
                        )}
                    </div>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        {/* --- Khu vực Tổng kết tiền --- */}
        <CCallout color={remainingAmount <= 0 ? "success" : "warning"} className="bg-light">
            <CRow className="text-center">
                <CCol md={4}>
                    <div className="text-muted small text-uppercase fw-bold">Tổng phải thu</div>
                    <div className="fs-4 text-primary fw-bold">{totalAmount.toLocaleString("vi-VN")} ₫</div>
                </CCol>
                <CCol md={4} className="border-start border-end">
                    <div className="text-muted small text-uppercase fw-bold">Đã thanh toán</div>
                    <div className="fs-4 text-success fw-bold">{paidAmount.toLocaleString("vi-VN")} ₫</div>
                </CCol>
                <CCol md={4}>
                    <div className="text-muted small text-uppercase fw-bold">Còn phải đóng</div>
                    <div className={`fs-4 fw-bold ${remainingAmount > 0 ? "text-danger" : "text-muted"}`}>
                        {remainingAmount.toLocaleString("vi-VN")} ₫
                    </div>
                </CCol>
            </CRow>
        </CCallout>

        {/* --- Nút bấm quay lại / Thanh toán tổng --- */}
        <div className="d-flex justify-content-between mt-4">
          <CButton color="secondary" variant="outline" onClick={() => navigate(-1)}>
            ← Quay lại
          </CButton>
          
          {remainingAmount > 0 && (
            <CButton color="success" size="lg" className="text-white px-4" onClick={handleGeneralPayment}>
               Thanh toán tổng ($)
            </CButton>
          )}
        </div>
      </CCardBody>
    </CCard>
  );
};

export default StudentTuitionDetail;