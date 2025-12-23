import React, { useState, useEffect } from "react";
import { Form, Input, Button, notification, Select } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginApi, registerApi } from "../util/api";
import { loginSuccess } from "../store/authSlice";
import "../styles/LoginRegister.css";

const { Option } = Select;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // State toggle
  const [isActive, setIsActive] = useState(false);

  // Đồng bộ state với pathname (nếu đi bằng route)
  useEffect(() => {
    setIsActive(location.pathname === "/register");
  }, [location.pathname]);

  // Hàm set cookie
  const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${cname}=${cvalue};${expires};path=/`;
  };

  // Login
  const onLogin = async (values) => {
    try {
      const res = await loginApi(values.email, values.password);

      if (res?.token) {
        setCookie("token", res.token, 1); // Lưu cookie 1 ngày
        dispatch(loginSuccess(res.user));
        const userRole = res.user?.roleId;


        notification.success({
          message: "Đăng nhập thành công",
          description: `Xin chào ${res.user?.fullName ?? "người dùng"}!`,
        });

        if (userRole === "R0" || "R1") {
          // Role cho Admin
          navigate("/admin/home");
        }
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

  // Register
  const onRegister = async (values) => {
    try {
      const { email, password, fullName, role } = values;
      const res = await registerApi({ email, password, fullName, role });

      if (res?.message) {
        notification.success({
          message: "Đăng ký thành công bước 1",
          description: res.message,
        });
        navigate("/otp", { state: { email: values.email, mode: "register" } });
      }
    } catch (err) {
      notification.error({
        message: "Đăng ký thất bại",
        description: err?.response?.data?.message || "Có lỗi xảy ra!",
      });
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className={`container ${isActive ? "active" : ""}`}>
          {/* Login Form */}
          <div className="form-box login">
            <div className="form-content">
              <Form layout="vertical" onFinish={onLogin}>
                <h1>Login</h1>
                <Form.Item
                  name="email"
                  rules={[{ required: true, message: "Please input your email!" }]}
                >
                  <Input id="login-email" placeholder="Email" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: "Please input your password!" }]}
                >
                  <Input.Password id="login-password" placeholder="Password" />
                </Form.Item>
                <div className="forgot-link">
                  <a
                    onClick={() => navigate("/forgot-password", { state: { mode: "forgot" } })}
                    style={{ cursor: "pointer" }}
                  >
                    Forgot Password?
                  </a>
                </div>
                <Button type="primary" htmlType="submit" className="btn-primary">
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

          {/* Register Form */}
          <div className="form-box register">
            <div className="form-content">
              <Form layout="vertical" onFinish={onRegister}>
                <h1>Registration</h1>
                <Form.Item
                  name="fullName"
                  rules={[{ required: true, message: "Please input your full name!" }]}
                >
                  <Input placeholder="Full Name" />
                </Form.Item>
                <Form.Item
                  name="email"
                  rules={[{ required: true, type: "email", message: "Please input a valid email!" }]}
                >
                  <Input id="register-email" placeholder="Email" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: "Please input your password!" }]}
                >
                  <Input.Password id="register-password" placeholder="Password" />
                </Form.Item>
                <Form.Item
                  name="role"
                  rules={[{ required: true, message: "Please select a role!" }]}
                >
                  <Select placeholder="Select Role">
                    <Option value="Giáo viên">Teacher</Option>
                    <Option value="Học sinh">Student</Option>
                  </Select>
                </Form.Item>
                <Button type="primary" htmlType="submit" className="btn-primary">
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
              <h1>Welcome!</h1>
              <p>Don't have an account?</p>
              <button
                className="btn-outline"
                onClick={() => {
                  navigate("/register");
                  setIsActive(true);
                }}
              >
                Register
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Welcome Back!</h1>
              <p>Already have an account?</p>
              <button
                className="btn-outline"
                onClick={() => {
                  navigate("/login");
                  setIsActive(false);
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
