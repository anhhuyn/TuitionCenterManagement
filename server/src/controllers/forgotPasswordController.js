import { 
  sendPasswordResetOTPEmail, 
  verifyOTPAndResetPassword, 
  checkOTP 
} from "../services/otpService.js";

// B1: gửi OTP về email
const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("Vui lòng nhập email.");

    const result = await sendPasswordResetOTPEmail(email);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// B2: xác thực OTP (chỉ check đúng/sai, chưa đổi mật khẩu)
const verifyOTPCode = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) throw new Error("Thiếu dữ liệu.");

    const result = await checkOTP(email, otp);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// B3: reset mật khẩu (check OTP lại 1 lần nữa + đổi mật khẩu)
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) throw new Error("Thiếu dữ liệu.");

    const result = await verifyOTPAndResetPassword(email, otp, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export default { requestOTP, verifyOTPCode, resetPassword };
