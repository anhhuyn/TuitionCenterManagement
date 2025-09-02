import React from "react";
import { Form, Input, Button, notification } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPasswordApi } from "../util/api";
import "../styles/LoginRegister.css";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Nhận email + otp từ trang OTP (chuyển qua state khi navigate)
  const { email, otp } = location.state || {};

  const onFinish = async (values) => {
    const { newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      notification.error({
        message: "Lỗi",
        description: "Mật khẩu xác nhận không khớp!",
      });
      return;
    }

    try {
      const res = await resetPasswordApi(email, otp, newPassword);

      if (res?.success) {
        notification.success({
          message: "Đổi mật khẩu thành công",
          description: res.message,
        });
        navigate("/login");
      } else {
        notification.error({
          message: "Lỗi",
          description: res?.message || "Không thể đổi mật khẩu!",
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Đã xảy ra lỗi, vui lòng thử lại.",
      });
    }
  };

  return (
    <div className="container">
      {/* Bìa xanh bên trái */}
      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>Đặt mật khẩu mới</h1>
          <p>Nhập mật khẩu mới của bạn để hoàn tất quá trình.</p>
        </div>
      </div>

      {/* Form reset mật khẩu bên phải */}
      <div className="form-box login">
        <div className="form-content">
          <Form layout="vertical" onFinish={onFinish}>
            <h1>Đặt lại mật khẩu</h1>

            <Form.Item
              name="newPassword"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
            >
              <Input.Password placeholder="Mật khẩu mới" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[{ required: true, message: "Vui lòng nhập lại mật khẩu!" }]}
            >
              <Input.Password placeholder="Xác nhận mật khẩu mới" />
            </Form.Item>

            <Button type="primary" htmlType="submit" className="btn" block>
              Đặt lại mật khẩu
            </Button>
          </Form>

          <div className="forgot-link">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              ← Quay lại trang đăng nhập
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
