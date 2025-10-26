import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/layout/Layout";
import {
  CCard,
  CCardBody,
  CCardTitle,
  CRow,
  CCol,
  CButton
} from "@coreui/react";
import {
  FiUsers,
  FiBook,
  FiUser,
  FiFileText,
  FiDollarSign,
  FiPlusCircle,
  FiAward,
  FiCheckCircle
} from "react-icons/fi";
import "../styles/HomePage.css";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:8088/v1/api/auth/me", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  if (!user) return null;

  const cards = [
    {
      title: "Danh sách lớp học",
      icon: <FiBook size={40} />,
      path: "/admin/classlist",
      color: "#007bff",
    },
    {
      title: "Danh sách học viên",
      icon: <FiUsers size={40} />,
      path: "/admin/hocvien",
      color: "#17a2b8",
    },
    {
      title: "Danh sách giáo viên",
      icon: <FiUser size={40} />,
      path: "/admin/nhanvien",
      color: "#28a745",
    },
    {
      title: "Thỏa thuận giáo viên",
      icon: <FiFileText size={40} />,
      path: "/admin/teacher-payments",
      color: "#ffc107",
    },
    {
      title: "Bảng lương chính thức",
      icon: <FiDollarSign size={40} />,
      path: "/admin/teacher-main-payments",
      color: "#dc3545",
    },
    {
      title: "Tạo bảng lương",
      icon: <FiPlusCircle size={40} />,
      path: "/admin/teacher-main-payments/create",
      color: "#6f42c1",
    },
  ];

  return (
    <Layout>
      {/* === Hero Section === */}
      <div
        style={{
          padding: "80px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          background: "linear-gradient(120deg, #f6f9ff, #e9f3ff)",
          borderRadius: "20px",
          marginBottom: "60px",
        }}
      >
        <div style={{ maxWidth: "550px" }}>
          <h5 style={{ color: "#007bff", fontWeight: "600", letterSpacing: "1px" }}>
            KHÁM PHÁ TRI THỨC MỚI MỖI NGÀY
          </h5>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "600",
              margin: "20px 0",
              color: "#1a1a1a",
              lineHeight: "1.3",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            Học tập, phát triển <br /> và chinh phục tương lai
          </h1>
          <p style={{ color: "#555", marginBottom: "30px" }}>
            Cùng nhau tham gia vào nền tảng học tập hiện đại giúp bạn
            nâng cao kỹ năng, kiến thức và sẵn sàng cho tương lai!
          </p>
          <CButton
            color="primary"
            size="lg"
            style={{ borderRadius: "30px", padding: "10px 30px" }}
            onClick={() => navigate("/admin/classlist")}
          >
            Bắt đầu học ngay
          </CButton>
        </div>

        <img
          src="https://img.freepik.com/free-photo/front-view-stacked-books-graduation-cap-ladders-education-day_23-2149241014.jpg?semt=ais_hybrid&w=740&q=80"
          alt="Learning illustration"
          style={{ width: "280px", maxWidth: "100%", marginTop: "30px" }}
        />
      </div>

      {/* === Greeting & Cards (phần cũ giữ nguyên) === */}
      <div style={{ padding: "40px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
          Hi! {user.fullName}
        </h1>
        <p style={{ textAlign: "center", marginBottom: "40px", color: "#555" }}>
          Chọn một danh mục bên dưới để truy cập nhanh các tính năng quản lý.
        </p>

        <CRow className="g-4" xs={{ cols: 1 }} sm={{ cols: 2 }} md={{ cols: 3 }}>
          {cards.map((card, index) => (
            <CCol key={index}>
              <CCard
                className="shadow-sm hover-shadow-lg"
                style={{
                  textAlign: "center",
                  borderRadius: "20px",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                  //borderTop: `5px solid ${card.color}`,
                }}
                onClick={() => navigate(card.path)}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
              >
                <CCardBody>
                  <div style={{ color: card.color, marginBottom: "15px" }}>
                    {card.icon}
                  </div>
                  <CCardTitle style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    {card.title}
                  </CCardTitle>
                  <CButton
                    color="light"
                    variant="outline"
                    style={{
                      marginTop: "15px",
                      borderColor: card.color,
                      color: card.color,
                    }}
                    onClick={() => navigate(card.path)}
                  >
                    Đi tới
                  </CButton>
                </CCardBody>
              </CCard>
            </CCol>
          ))}
        </CRow>
      </div>

      {/* === Services Section === */}
      <div style={{ textAlign: "center", margin: "80px 0" }}>
        <h6 style={{ color: "#007bff", letterSpacing: "1px" }}>DỊCH VỤ</h6>
        <h2 style={{ fontWeight: "700", marginBottom: "40px" }}>Chúng tôi mang đến</h2>

        <CRow className="g-4" xs={{ cols: 1 }} sm={{ cols: 2 }} md={{ cols: 4 }}>
          {[
            {
              icon: <FiBook size={40} color="#007bff" />,
              title: "Khóa học chất lượng",
              text: "Giảng viên hàng đầu và nội dung thực tiễn.",
            },
            {
              icon: <FiUsers size={40} color="#17a2b8" />,
              title: "Cộng đồng học viên",
              text: "Học hỏi và chia sẻ cùng hàng nghìn học viên khác.",
            },
            {
              icon: <FiAward size={40} color="#28a745" />,
              title: "Chứng chỉ uy tín",
              text: "Ghi nhận thành tích và kỹ năng học tập của bạn.",
            },
            {
              icon: <FiCheckCircle size={40} color="#ffc107" />,
              title: "Hỗ trợ 24/7",
              text: "Đội ngũ tư vấn luôn sẵn sàng đồng hành cùng bạn.",
            },
          ].map((item, i) => (
            <CCol key={i}>
              <CCard
                className="shadow-sm"
                style={{
                  borderRadius: "15px",
                  textAlign: "center",
                  padding: "20px",
                  transition: "transform 0.2s ease",
                  height: "100%", // thêm dòng này
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <CCardBody>
                  <div style={{ marginBottom: "15px" }}>{item.icon}</div>
                  <CCardTitle style={{ fontWeight: "bold", marginBottom: "10px" }}>
                    {item.title}
                  </CCardTitle>
                  <p style={{ color: "#555" }}>{item.text}</p>
                </CCardBody>
              </CCard>
            </CCol>
          ))}
        </CRow>
      </div>

      {/* === Testimonials Section === */}
      <div style={{ textAlign: "center", marginBottom: "100px" }}>
        <h6 style={{ color: "#007bff", letterSpacing: "1px" }}>CẢM NHẬN HỌC VIÊN</h6>
        <h2 style={{ fontWeight: "700", marginBottom: "40px" }}>
          Học viên nói gì về chúng tôi
        </h2>

        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            background: "#f8f9fa",
            padding: "30px",
            borderRadius: "15px",
          }}
        >
          <p style={{ fontStyle: "italic", color: "#444" }}>
            "Nền tảng này thực sự thay đổi cách mình học. Các khóa học rất dễ hiểu, nội dung phong phú và giúp mình áp dụng kiến thức ngay vào công việc hàng ngày."
          </p>
          <p style={{ marginTop: "20px", fontWeight: "600" }}>— Nguyễn Thị Lan, Học viên</p>
        </div>
      </div>

      {/* === Footer === */}
      <footer
        style={{
          textAlign: "center",
          padding: "40px 20px",
          background: "#f1f5ff",
          borderRadius: "20px",
        }}
      >
        <h4 style={{ fontWeight: "700", marginBottom: "15px" }}>StudyHard</h4>
        <p style={{ color: "#555" }}>
          Nâng tầm tri thức, mở rộng tương lai cùng StudyHard.
        </p>
        <p style={{ color: "#999", fontSize: "0.9rem", marginTop: "10px" }}>
        </p>
      </footer>
    </Layout>
  );
};

export default HomePage;
