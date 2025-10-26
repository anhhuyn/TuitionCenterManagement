// src/App.js
import React, { useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useColorModes } from "@coreui/react";

// 🧩 Layout & Components
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// 🧩 Pages
import Login from "./pages/login.jsx";
import HomePage from "./pages/homePage.jsx";
import ForgotPasswordPage from "./pages/forgotPasswordPage";
import OtpPage from "./pages/otpPage";
import ResetPasswordPage from "./pages/resetPasswordPage";
import CustomerTable from "./pages/CustomerTable";
import Profile from "./pages/profilePage.jsx";
import TeacherManagement from "./pages/employeesPage.jsx";
import ClassList from "./pages/ClassList";
import ClassDetailPage from "./pages/classDetailViews/ClassDetailPage";
import AssignmentDetail from "./pages/classDetailViews/AssignmentDetail";
import TeacherPaymentList from "./pages/teacherPayment/TeacherPaymentList.jsx";
import TeacherDetail from "./pages/teacherPayment/TeacherDetail.jsx";
import ManageTeacherSubject from "./pages/teacherPayment/ManageTeacherSubject.jsx";
import TeacherMainPaymentList from "./pages/teacherMainPayments/TeacherMainPaymentList.jsx";
import TeacherMainPaymentDetail from "./pages/teacherMainPayments/TeacherMainPaymentDetail.jsx";
import TeacherMainPaymentCreate from "./pages/teacherMainPayments/TeacherMainPaymentCreate.jsx";

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { colorMode } = useColorModes("coreui-free-react-admin-template-theme");

  const user = useSelector((state) => state.auth?.user);
  const isLoggedIn = !!user || !!localStorage.getItem("token");

  // Các trang không cần token
  const authPages = [
    "/login",
    "/register",
    "/forgot-password",
    "/otp",
    "/reset-password",
  ];

  // Kiểm tra token khi đổi route (chỉ khi không ở trang auth)
  useEffect(() => {
    const verifyUser = async () => {
      if (authPages.includes(location.pathname)) return;

      try {
        const res = await axios.get("http://localhost:8088/v1/api/auth/me", {
          withCredentials: true,
        });

        if (res.data?.user) {
          dispatch({ type: "auth/setUser", payload: res.data.user });
        }
      } catch (err) {
        console.error("Token không hợp lệ hoặc hết hạn:", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    verifyUser();
  }, [location.pathname]);

  // Áp dụng theme màu
  useEffect(() => {
    const body = document.body;
    body.classList.remove("light-mode", "dark-mode", "auto-mode");
    body.classList.add(`${colorMode}-mode`);
  }, [colorMode]);

  return (
    <Routes>
      {/* --- Auth routes --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/otp" element={<OtpPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* --- Main admin pages (được bảo vệ) --- */}
      <Route
        path="/admin/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* --- Học viên --- */}
      <Route
        path="/admin/hocvien"
        element={
          <ProtectedRoute>
            <Layout>
              <CustomerTable />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* --- Nhân viên --- */}
      <Route
        path="/admin/nhanvien"
        element={
          <ProtectedRoute>
            <Layout>
              <TeacherManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* --- Lớp học --- */}
      <Route
        path="/admin/classlist"
        element={
          <ProtectedRoute>
            <Layout>
              <ClassList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/class/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ClassDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assignment/:assignmentId"
        element={
          <ProtectedRoute>
            <Layout>
              <AssignmentDetail />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* --- Thanh toán giáo viên --- */}
      <Route
        path="/admin/teacher-payments"
        element={
          <ProtectedRoute>
            <Layout>
              <TeacherPaymentList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teacher-payments/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <TeacherDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teacher-payments/create"
        element={
          <ProtectedRoute>
            <Layout>
              <ManageTeacherSubject />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teacher-payments/edit/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ManageTeacherSubject />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* --- Lương tổng hàng tháng --- */}
      <Route
        path="/admin/teacher-main-payments"
        element={
          <ProtectedRoute>
            <Layout>
              <TeacherMainPaymentList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teacher-main-payments/create"
        element={
          <ProtectedRoute>
            <Layout>
              <TeacherMainPaymentCreate />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teacher-main-payments/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <TeacherMainPaymentDetail />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* --- Route gốc --- */}
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <Navigate to="/admin/home" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* --- Route không tồn tại --- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppWrapper;
