import axios from "./axios.customize";
import { loginSuccess, setLoading } from '../store/authSlice';

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

const fetchUserFromToken = async (dispatch) => {
  dispatch(setLoading(true)); // 🟢 Bắt đầu loading

  try {
    const res = await axios.get("/v1/api/auth/me", { withCredentials: true,});
    console.log("🔥 Response from /auth/me:", res.data);
    if (res.data && res.data.user) {
      dispatch(loginSuccess(res.data.user));
    } else {
      dispatch(setLoading(false)); // 🟡 Không có user
    }
  } catch (error) {
    console.error(error);
    dispatch(setLoading(false)); // 🔴 Gặp lỗi
  }
};


export { createUserApi, loginApi, getUserApi, getAuthMe, fetchUserFromToken, forgotPasswordApi, verifyOtpApi, resetPasswordApi };
