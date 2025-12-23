// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/layout/Layout";
import BookCard from "../components/card/BookCard";
import {
  CRow,
  CCol,
} from "@coreui/react";
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

  // Màu pastel giống ClassList
  const colors = ["#EDE9FE", "#DBEAFE", "#EBFCEF", "#FFFDE7", "#FFF5F5", "#FFE8CC",];

  // Danh sách card
  const cards = [
    {
      title: "Danh sách lớp học",
      path: "/admin/classlist",
      image:
        "https://unica.vn/upload/landingpage/1675045107_tong-hop-ten-cac-mon-hoc-bang-tieng-anh-day-du-nhat-ban-nen-biet_thumb.jpg",
    },
    {
      title: "Danh sách học viên",
      path: "/admin/hocvien",
      image:
        "https://thuvienvector.vn/wp-content/uploads/2025/03/anh-hoc-sinh-png.jpg",
    },
    {
      title: "Danh sách giáo viên",
      path: "/admin/nhanvien",
      image:
        "https://dayhoc.page/wp-content/uploads/2023/11/teaching-1160x680.webp",
    },
    {
      title: "Thỏa thuận giáo viên",
      path: "/admin/teacher-payments",
      image:
        "https://www.shutterstock.com/image-vector/company-contract-greeting-successful-agreement-600nw-1588511884.jpg",
    },
    {
      title: "Bảng lương",
      path: "/admin/teacher-main-payments",
      image:
        "https://base.vn/wp-content/uploads/2025/04/cach-tinh-luong.webp",
    },
    {
      title: "Danh sách học phí",
      path: "/admin/student-tuitions",
      image:
        "https://cdn.vietnambiz.vn/2019/9/1/howtopaychinesesuppliersbybanktransfertt-1567312994119669667236.jpg",
    },
  ];

  return (
    <Layout>
      {/* === Greeting & Cards === */}
      <div className="home-content">
        <h1 className="home-greeting">Xin chào! {user.fullName}</h1>
        <h6>DANH MỤC QUẢN LÝ</h6>
        <p>Chọn một danh mục bên dưới để truy cập nhanh các tính năng quản lý.</p>

        <CRow className="g-4" xs={{ cols: 1 }} sm={{ cols: 2 }} md={{ cols: 3 }}>
          {cards.map((card, i) => (
            <CCol key={i} className="d-flex justify-content-center">
              <BookCard
                title={card.title}
                path={card.path}
                color={colors[i % colors.length]} // Thêm màu pastel luân phiên
                image={card.image}
              />
            </CCol>
          ))}
        </CRow>
      </div>

      {/* === Footer === */}
      <footer className="home-footer">
        <h4>StudyHard</h4>
        <p>Nâng tầm tri thức, mở rộng tương lai cùng StudyHard.</p>
      </footer>
    </Layout>
  );
};

export default HomePage;
