import React, { useState, useEffect } from "react";
import { Input, Button, notification } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOtpApi, verifyRegisterOtpApi } from "../util/api";
import "../styles/OtpPage.css"; 

const OtpPage = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút = 300 giây
  const navigate = useNavigate();
  const location = useLocation();

  const { email, mode } = location.state || {}; // lấy email từ trang ForgotPassword

  // đếm ngược
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleVerify = async () => {
    if (timeLeft <= 0) {
      notification.error({
        message: "Lỗi",
        description: "Mã OTP đã hết hạn, vui lòng yêu cầu gửi lại.",
      });
      return;
    }

    const code = otp.join("");
    if (code.length !== 6) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng nhập đủ 6 số OTP.",
      });
      return;
    }

     try {
      let res;
      if (mode === "forgot") {
        res = await verifyOtpApi(email, code);
      } else if (mode === "register") {
        res = await verifyRegisterOtpApi(email, code);
      }

      if (res?.message) {
        notification.success({
          message: "Xác thực thành công",
          description: res.message,
        });

        if (mode === "forgot") {
          navigate("/reset-password", { state: { email, otp: code } });
        } else {
          navigate("/login");
        }
      }
    } catch (err) {
      notification.error({
        message: "Xác thực thất bại",
        description: err?.response?.data?.message || "OTP không hợp lệ!",
      });
    }
  };


  return (
    <div className="otp-wrapper">
      <div className="otp-box">
        <h1>Xác thực OTP</h1>

        <p style={{ color: "red" }}>
          Vui lòng nhập mã OTP 6 số đã được gửi đến email của bạn. 
          Mã OTP có hiệu lực trong 5 phút.
        </p>

        <p style={{ color: "red", marginBottom: "15px" }}>
          Thời gian còn lại: <b>{formatTime(timeLeft)}</b>
        </p>

        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <Input
              key={index}
              id={`otp-${index}`}
              value={digit}
              maxLength={1}
              onChange={(e) => handleChange(e.target.value, index)}
              disabled={timeLeft <= 0}
            />
          ))}
        </div>

        <Button className="otp-btn" type="primary" onClick={handleVerify}>
          Xác nhận
        </Button>

        <div className="forgot-link" style={{ marginTop: "15px" }}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate(mode === "forgot" ? "/forgot-password" : "/register");

            }}
          >
            ← Quay lại nhập email
          </a>
        </div>
      </div>
    </div>
  );
};

export default OtpPage;
