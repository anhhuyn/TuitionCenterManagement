import React from "react";
import { Form, Input, Button, notification } from "antd";
import { useNavigate } from "react-router-dom";
import { forgotPasswordApi } from "../util/api";
import "../styles/LoginRegister.css";
import { useLocation } from "react-router-dom";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const mode = location.state?.mode || "forgot";

  // Dựa vào mode để đặt tiêu đề và mô tả
  const title = mode === "change" ? "Change Password" : "Forgot Password";
  const description =
    mode === "change"
      ? "Enter your email to change your password."
      : "Enter your email to receive password reset instructions.";

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
            <p>{description}</p>
          </div>
        </div>

        {/* Form quên mật khẩu */}
        <div className="form-box login">
          <div className="form-content">
            <Form layout="vertical" onFinish={onFinish}>
              <h1>{title}</h1>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "Invalid email address!" },
                ]}
              >
                <Input placeholder="Enter your email" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                className="btn-primary"
                block
              >
                Submit
              </Button>
            </Form>
            {mode !== "change" && (
              <div className="forgot-link">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/login");
                  }}
                >
                   ← Back to Login
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
