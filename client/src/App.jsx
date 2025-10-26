// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchUserFromToken } from "./util/api";

import Login from "./pages/login.jsx";
import HomePage from "./pages/homePage.jsx";
import ForgotPasswordPage from "./pages/forgotPasswordPage";
import OtpPage from "./pages/otpPage";
import ResetPasswordPage from "./pages/resetPasswordPage";
import CustomerTable from "./pages/CustomerTable";
import Profile from "./pages/profilePage.jsx";
import { useColorModes } from '@coreui/react';
import Layout from "./components/layout/Layout";
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



function App() {
  const dispatch = useDispatch();
  const { colorMode } = useColorModes('coreui-free-react-admin-template-theme');

  useEffect(() => {
    fetchUserFromToken(dispatch);
  }, [dispatch]);

  useEffect(() => {
    const body = document.body;
    body.classList.remove('light-mode', 'dark-mode', 'auto-mode');
    body.classList.add(`${colorMode}-mode`);
  }, [colorMode]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/admin/home" element={<HomePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/profile" element={<Profile />} />
      {/* học viên */}
        <Route
          path="/admin/hocvien"
          element={
            <Layout>
              <CustomerTable />
            </Layout>
          }
        />

        {/* nhân viên */}
        <Route
          path="/admin/nhanvien"
          element={
            <Layout>
              <TeacherManagement />
            </Layout>
          }
        />
        <Route
          path="/admin/classlist"
          element={
            <Layout>
              <ClassList />
            </Layout>
          }
        />
        <Route
          path="/admin/class/:id"
          element={
            <Layout>
              <ClassDetailPage />
            </Layout>
          }
        />
        <Route
          path="/admin/assignment/:assignmentId"
          element={
            <Layout>
              <AssignmentDetail />
            </Layout>
          }
        />
        <Route
          path="/admin/teacher-payments"
          element={
            <Layout>
              <TeacherPaymentList />
            </Layout>
          }
        />
        <Route
          path="/admin/teacher-payments/:id"
          element={
            <Layout>
              <TeacherDetail />
            </Layout>
          }
        />
        <Route
          path="/admin/teacher-payments/create"
          element={
            <Layout>
              <ManageTeacherSubject />
            </Layout>
          }
        />
          <Route 
          path="/admin/teacher-payments/edit/:id" 
          element={
            <Layout>
              <ManageTeacherSubject />
            </Layout>
          } 
        />



      {/* 🧾 Lương tổng hàng tháng (Main Payments) */}
        <Route
          path="/admin/teacher-main-payments"
          element={
            <Layout>
              <TeacherMainPaymentList />
            </Layout>
          }
        />
        <Route
          path="/admin/teacher-main-payments/create"
          element={
            <Layout>
              <TeacherMainPaymentCreate />
            </Layout>
          }
        />
        <Route
          path="/admin/teacher-main-payments/:id"
          element={
            <Layout>
              <TeacherMainPaymentDetail />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
