import React, { useState, useEffect } from "react";
import { Input, Button, notification } from "antd";
import { verifyEmailChangeOtpApi } from '../../util/api';
import './OtpModal.css';
import SubmitButton from "../button/SubmitButton";

const OtpModal = ({ email, onVerifySuccess, onClose }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(300);
  const [loading, setLoading] = useState(false);

  // Countdown logic (giữ nguyên như hiện tại)
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

    setLoading(true);

    try {
      const res = await verifyEmailChangeOtpApi(code);
      notification.success({
        message: "Xác thực thành công",
        description: res.data?.message || "Bạn đã cập nhật email thành công!",
      });

      onVerifySuccess();
    } catch (error) {
      notification.error({
        message: "Xác thực thất bại",
        description: error.response?.data?.message || "OTP không hợp lệ!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-modal-overlay">
      <div className="otp-modal-box">
        <h1>Xác thực OTP</h1>
        <p className="otp-modal-description">
          Vui lòng nhập mã OTP 6 số đã được gửi đến email:{" "}
          <span className="otp-modal-email">{email}</span>
          <br />
          Mã OTP có hiệu lực trong 5 phút.
        </p>
        <p className="otp-timer">
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
              disabled={timeLeft <= 0 || loading}
            />
          ))}
        </div>
        <SubmitButton
          onClick={handleVerify}
          loading={loading}
        >
          Xác nhận
        </SubmitButton>
        <Button
          style={{ marginTop: 8 }}
          onClick={onClose}
          disabled={loading}
        >
          Hủy
        </Button>
      </div>
    </div>
  );
};

export default OtpModal;
