import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CSpinner, CButton, CBadge,
} from "@coreui/react";
import { getTeacherSalaryDetail, payTeacherSalary } from "../../util/api";
import Swal from "sweetalert2";

const TeacherMainPaymentDetail = () => {
  const { id } = useParams(); // id ở đây là teacherId
  const [params] = useSearchParams();
  const month = parseInt(params.get("month"));
  const year = parseInt(params.get("year"));
  const [paymentData, setPaymentData] = useState(null); // Đổi tên biến cho rõ nghĩa
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getTeacherSalaryDetail(id, month, year);
        console.log("📦 Chi tiết lương API:", res);

        // Logic lấy data an toàn
        let data = (res && res.errCode === 0) ? res.data : (res?.data || null);
        
        // Nếu backend trả về mảng (lỗi logic backend), lấy phần tử đầu
        if (Array.isArray(data)) data = data[0];

        setPaymentData(data);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết lương:", err);
        setPaymentData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, month, year]);

  const handlePaySalary = async () => {
    if (!paymentData) return;

    const teacherName = paymentData.teacher?.userInfo?.fullName || "Giáo viên";

    const confirm = await Swal.fire({
      title: "Xác nhận thanh toán?",
      text: `Thanh toán lương tháng ${month}/${year} cho ${teacherName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Thanh toán",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#7494ec",
    });

    if (!confirm.isConfirmed) return;

    try {
      setPaying(true);
      // Gọi API Pay
      const res = await payTeacherSalary(paymentData.teacher.id, month, year);
      
      // Kiểm tra thành công (check cả errCode và status)
      const successData = (res && res.errCode === 0) ? res.data : res;
      
      if (successData?.status === "paid") {
        Swal.fire({
          title: "Thành công!",
          text: "Đã thanh toán lương giáo viên!",
          icon: "success",
          confirmButtonColor: "#7494ec",
        });
        // Cập nhật lại trạng thái UI ngay lập tức
        setPaymentData({ ...paymentData, status: "paid" });
      } else {
        Swal.fire("❌ Lỗi", res.message || "Không thể thanh toán!", "error");
      }
    } catch (err) {
      console.error("❌ Lỗi khi thanh toán:", err);
      // Check lỗi 400 từ backend
      const msg = err.response?.data?.message || "Lỗi kết nối!";
      Swal.fire("Lỗi", msg, "error");
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="text-center my-4"><CSpinner color="primary" /></div>;
  if (!paymentData) return <div className="text-center mt-5">Không tìm thấy dữ liệu lương.</div>;

  // Rút gọn biến cho dễ dùng trong JSX
  const teacherInfo = paymentData.teacher?.userInfo || {};
  const details = paymentData.paymentDetails || []; // Backend trả về paymentDetails

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader className="text-white fw-bold d-flex justify-content-between align-items-center" style={{ backgroundColor: "#7494ec" }}>
        <div>
          Chi tiết lương: {teacherInfo.fullName} - Tháng {month}/{year}
        </div>
        <div>
          {paymentData.status === "paid" ? (
            <CBadge className="p-2" color="success">Đã thanh toán</CBadge>
          ) : (
            <CBadge className="p-2" color="warning">Chưa thanh toán</CBadge>
          )}
        </div>
      </CCardHeader>

      <CCardBody>
        <p>
          <strong>Email:</strong> {teacherInfo.email} <br />
          <strong>Số điện thoại:</strong> {teacherInfo.phoneNumber}
        </p>

        <CTable striped bordered hover responsive>
          <CTableHead style={{ backgroundColor: "#e8edfd" }}>
            <CTableRow>
              <CTableHeaderCell>Môn học</CTableHeaderCell>
              <CTableHeaderCell>Số buổi</CTableHeaderCell>
              <CTableHeaderCell>Tổng giờ</CTableHeaderCell>
              <CTableHeaderCell>Đơn giá/giờ</CTableHeaderCell>
              <CTableHeaderCell>Thành tiền</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {details.map((item, i) => (
              <CTableRow key={i}>
                {/* Sửa: item.subject.name thay vì item.subjectName */}
                <CTableDataCell>{item.subject?.name}</CTableDataCell>
                <CTableDataCell>{item.totalSessions}</CTableDataCell>
                <CTableDataCell>{item.totalHours}</CTableDataCell>
                <CTableDataCell>
                  {item.salaryRate ? item.salaryRate.toLocaleString("vi-VN") : 0} ₫
                </CTableDataCell>
                <CTableDataCell>
                  {item.totalMoney ? item.totalMoney.toLocaleString("vi-VN") : 0} ₫
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <h5 className="mt-3 text-end fw-bold" style={{ color: "#7494ec" }}>
          Tổng cộng: {paymentData.amount ? paymentData.amount.toLocaleString("vi-VN") : 0} ₫
        </h5>

        <div className="d-flex justify-content-between mt-3">
          <CButton color="secondary" onClick={() => window.history.back()}>
            ← Quay lại
          </CButton>

          {paymentData.status !== "paid" && (
            <CButton
              style={{ backgroundColor: "#7494ec", borderColor: "#7494ec", color:"white" }}
              onClick={handlePaySalary}
              disabled={paying}
            >
              {paying ? "Đang thanh toán..." : "Thanh toán lương"}
            </CButton>
          )}
        </div>
      </CCardBody>
    </CCard>
  );
};

export default TeacherMainPaymentDetail;