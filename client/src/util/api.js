import axios from "./axios.customize";
import { loginSuccess, setLoading } from '../store/authSlice';

// Đăng ký (gửi OTP về email)
const registerApi = (data) => {
  const URL_API = "/v1/api/register";
  // Truyền toàn bộ đối tượng data vào body của request
  return axios.post(URL_API, data);
};

// Xác thực OTP
const verifyRegisterOtpApi = (email, otp) => {
  const URL_API = "/v1/api/verify-otp";
  return axios.post(URL_API, { email, otp });
};

// Đăng nhập
const loginApi = (email, password) => {
  const URL_API = "/v1/api/login";
  return axios.post(URL_API, { email, password });
};

// Lấy thông tin user
const getUserApi = () => {
  return axios.get("/v1/api/profile"); 
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
  dispatch(setLoading(true)); 

  try {
    const res = await axios.get("/v1/api/auth/me", { withCredentials: true });
    console.log("Response from /auth/me:", res);

    // res là data rồi, không phải res.data
    if (res && res.user) {
      dispatch(loginSuccess(res.user));
    } else {
      dispatch(setLoading(false)); 
    }
  } catch (error) {
    console.error(error);
    dispatch(setLoading(false)); 
  }
};

const updateProfileApi = (formData) => {
  const URL_API = "/v1/api/profile/update";
  return axios.post(URL_API, formData);
};

const verifyEmailChangeOtpApi = (otp) => {
  // Gọi endpoint verify otp cho email đổi mới
  return axios.post("/v1/api/profile/verify-email-otp", { otp });
};

const updateImageApi = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  return axios.put("/v1/api/profile/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
const getSubjectsApi = async ({ page = 1, limit = 15, status = null } = {}) => {
  const params = { page, limit };
  if (status) params.status = status; 
  const res = await axios.get("/v1/api/subjects", { params });
  return res;
};

export { updateImageApi ,verifyEmailChangeOtpApi, updateProfileApi,registerApi, verifyRegisterOtpApi, loginApi, getUserApi, getAuthMe, fetchUserFromToken, forgotPasswordApi, verifyOtpApi, resetPasswordApi, getSubjectsApi};
