import React, { useState } from "react";
import { Form, Input, Button, notification } from "antd";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../util/api";
import "../styles/LoginRegister.css"; 

const LoginPage = () => {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  // Hàm set cookie
  const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${cname}=${cvalue};${expires};path=/`;
  };

  // Hàm get cookie (nếu cần)
  const getCookie = (cname) => {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let c of ca) {
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return "";
  };

  // Xử lý login
  const onLogin = async (values) => {
    try {
      const res = await loginApi(values.email, values.password);
      if (res?.token) {
        // Lưu token vào cookie 1 ngày
        setCookie("token", res.token, 1);

        notification.success({
          message: "Đăng nhập thành công",
          description: `Xin chào ${res.user?.fullName ?? "người dùng"}!`,
        });
        navigate("/home");
      } else {
        notification.error({
          message: "Đăng nhập thất bại",
          description: res?.message ?? "Sai tài khoản hoặc mật khẩu",
        });
      }
    } catch (err) {
      notification.error({
        message: "Lỗi hệ thống",
        description: "Vui lòng thử lại sau.",
      });
    }
  };

  // Xử lý register
  const onRegister = (values) => {
    notification.success({
      message: "Đăng ký thành công",
      description: `Chào mừng ${values.username}!`,
    });
    setIsActive(false);
  };

  return (
    <div className={`container ${isActive ? "active" : ""}`}>
      {/* Form Login */}
      <div className="form-box login">
        <div className="form-content">
          <Form layout="vertical" onFinish={onLogin}>
            <h1>Login</h1>

            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>

            <div className="forgot-link">
              <a href="#">Forgot Password?</a>
            </div>

            <Button type="primary" htmlType="submit" className="btn">
              Login
            </Button>
          </Form>
          <p>or login with social platforms</p>
          <div className="social-icons">
            <a href="#"><i className="bx bxl-google"></i></a>
            <a href="#"><i className="bx bxl-facebook"></i></a>
            <a href="#"><i className="bx bxl-github"></i></a>
            <a href="#"><i className="bx bxl-linkedin"></i></a>
          </div>
        </div>
      </div>

      {/* Form Register */}
      <div className="form-box register">
        <div className="form-content">
          <Form layout="vertical" onFinish={onRegister}>
            <h1>Registration</h1>

            <Form.Item
              name="username"
              rules={[{ required: true, message: "Please input your username!" }]}
            >
              <Input placeholder="Username" />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, type: "email", message: "Please input valid email!" },
              ]}
            >
              <Input placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>

            <Button type="primary" htmlType="submit" className="btn">
              Register
            </Button>
          </Form>
          <p>or register with social platforms</p>
          <div className="social-icons">
            <a href="#"><i className="bx bxl-google"></i></a>
            <a href="#"><i className="bx bxl-facebook"></i></a>
            <a href="#"><i className="bx bxl-github"></i></a>
            <a href="#"><i className="bx bxl-linkedin"></i></a>
          </div>
        </div>
      </div>

      {/* Toggle Box */}
      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>Hello, Welcome!</h1>
          <p>Don't have an account?</p>
          <button className="btn register-btn" onClick={() => setIsActive(true)}>
            Register
          </button>
        </div>
        <div className="toggle-panel toggle-right">
          <h1>Welcome Back!</h1>
          <p>Already have an account?</p>
          <button className="btn login-btn" onClick={() => setIsActive(false)}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
