import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CButton,
  CBadge,
} from "@coreui/react";
import { getTeacherSalaryDetail, payTeacherSalary } from "../../util/api";
import Swal from "sweetalert2";

const TeacherMainPaymentDetail = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const month = parseInt(params.get("month"));
  const year = parseInt(params.get("year"));
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getTeacherSalaryDetail(id, month, year);
        console.log("📦 API result:", res.data);
        setTeacher(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết lương:", err);
        setTeacher(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, month, year]);

  const handlePaySalary = async () => {
    if (!teacher) return;

    const confirm = await Swal.fire({
      title: "Xác nhận thanh toán?",
      text: `Thanh toán lương tháng ${month}/${year} cho ${teacher.fullName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Thanh toán",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#7494ec",
    });

    if (!confirm.isConfirmed) return;

    try {
      setPaying(true);
      const res = await payTeacherSalary(teacher.teacherId, month, year);
      console.log("🧾 Response:", res.data);

      if (
        res.data?.errCode === 0 ||
        res.data?.data?.status === "paid" ||
        res.data?.status === "paid"
      ) {
        Swal.fire({
          title: "Thành công!",
          text: "Đã thanh toán lương giáo viên!",
          icon: "success",
          confirmButtonColor: "#7494ec",
        });
        setTeacher({ ...teacher, status: "paid" });
      } else {
        Swal.fire("❌ Lỗi", res.data?.message || "Không thể thanh toán!", "error");
      }
    } catch (err) {
      console.error("❌ Lỗi khi thanh toán:", err);
      Swal.fire("Lỗi", "Không thể kết nối tới server!", "error");
    } finally {
      setPaying(false);
    }
  };

  if (loading)
    return (
      <div className="text-center my-4">
        <CSpinner color="primary" style={{ color: "#7494ec" }} />
      </div>
    );

  if (!teacher) return <p>Không tìm thấy dữ liệu lương.</p>;

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader
        className="text-white fw-bold d-flex justify-content-between align-items-center"
        style={{ backgroundColor: "#7494ec" }}
      >
        <div>
          Chi tiết lương {teacher.fullName} - Tháng {month}/{year}
        </div>
        <div>
          {teacher.status === "paid" ? (
            <CBadge
              className="p-2"
              style={{
                backgroundColor: "#28a745",
                color: "white",
              }}
            >
              Đã thanh toán
            </CBadge>
          ) : (
            <CBadge
              className="p-2"
              style={{
                backgroundColor: "#ffc107",
                color: "white",
              }}
            >
              Chưa thanh toán
            </CBadge>
          )}
        </div>
      </CCardHeader>

      <CCardBody>
        <p>
          <strong>Email:</strong> {teacher.email} <br />
          <strong>Số điện thoại:</strong> {teacher.phoneNumber}
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
            {teacher.subjects.map((s, i) => (
              <CTableRow key={i}>
                <CTableDataCell>{s.subjectName}</CTableDataCell>
                <CTableDataCell>{s.totalSessions}</CTableDataCell>
                <CTableDataCell>{s.totalHours.toFixed(1)}</CTableDataCell>
                <CTableDataCell>
                  {parseFloat(s.salaryRate).toLocaleString("vi-VN")} ₫
                </CTableDataCell>
                <CTableDataCell>
                  {s.totalMoney.toLocaleString("vi-VN")} ₫
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <h5 className="mt-3 text-end fw-bold" style={{ color: "#7494ec" }}>
          Tổng cộng: {teacher.totalAmount.toLocaleString("vi-VN")} ₫
        </h5>

        <div className="d-flex justify-content-between mt-3">
          <CButton
            style={{
              backgroundColor: "#ccc",
              borderColor: "#ccc",
              color: "#333",
            }}
            onClick={() => window.history.back()}
          >
            ← Quay lại
          </CButton>

          {teacher.status !== "paid" && (
            <CButton
              style={{
                backgroundColor: "#7494ec",
                borderColor: "#7494ec",
                color:"white"
              }}
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
