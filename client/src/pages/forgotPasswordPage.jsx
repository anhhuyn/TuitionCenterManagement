import React from "react";
import { Form, Input, Button, notification } from "antd";
import { useNavigate } from "react-router-dom";
import { forgotPasswordApi } from "../util/api";
import "../styles/LoginRegister.css";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const email = values.email;

    try {
      const res = await forgotPasswordApi(email);

      if (res?.success) {
        notification.success({
          message: "Yêu cầu thành công",
          description: res.message,
        });
        // Truyền cả email và mode để dễ phân biệt ở trang OTP
        navigate("/otp", { state: { email, mode: "forgot" } });
      } else {
        notification.error({
          message: "Lỗi",
          description: res?.message || "Email không tồn tại!",
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
    <div className="login-page">
      <div className="container">{/* KHÔNG cần active ở forgot-password */}
        {/* Panel bên trái */}
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Welcome!</h1>
            <p>Nhập email để nhận hướng dẫn đặt lại mật khẩu.</p>
          </div>
        </div>

        {/* Form quên mật khẩu */}
        <div className="form-box login">
          <div className="form-content">
            <Form layout="vertical" onFinish={onFinish}>
              <h1>Quên mật khẩu</h1>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input placeholder="Nhập email của bạn" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                className="btn-primary"
                block
              >
                Gửi yêu cầu
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
    </div>
  );
};

export default ForgotPasswordPage;
