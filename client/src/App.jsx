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

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    fetchUserFromToken(dispatch);
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </Router>
  );
}

export default App;
