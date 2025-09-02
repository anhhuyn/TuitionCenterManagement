import axios from "./axios.customize";

// Đăng ký
const createUserApi = (name, email, password) => {
  const URL_API = "/v1/api/register";
  return axios.post(URL_API, { name, email, password });
};

// Đăng nhập
const loginApi = (email, password) => {
  const URL_API = "/v1/api/login";
  return axios.post(URL_API, { email, password });
};

// Lấy thông tin user
const getUserApi = () => {
  const URL_API = "/v1/api/user";
  return axios.get(URL_API);
};

// Lấy thông tin người dùng qua token
const getAuthMe = () => {
  return axios.get("/v1/api/auth/me");
};

//Quên mật khẩu
const forgotPasswordApi = (email) => {
  return axios.post("/v1/api/forgot-password", { email });
};

const verifyOtpApi = (email, otp) => {
  return axios.post("/v1/api/forgot-password/verify-otp", { email, otp });
};

const resetPasswordApi = (email, otp, newPassword) => {
  return axios.post("/v1/api/reset-password", { email, otp, newPassword });
};


export { createUserApi, loginApi, getUserApi, getAuthMe, forgotPasswordApi, verifyOtpApi, resetPasswordApi};
