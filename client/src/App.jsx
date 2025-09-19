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
      </Routes>
    </Router>
  );
}

export default App;
