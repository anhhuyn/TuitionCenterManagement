import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";  
import db from "../models/index.js";  

// Biến tạm để lưu OTP theo email
const otpStore = {};

// B1: Hàm gửi OTP
const sendPasswordResetOTPEmail = async (email) => {
  // Kiểm tra user có tồn tại trong DB không
  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    throw new Error("Email không tồn tại trong hệ thống.");
  }

  // Tạo OTP 6 chữ số
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiry = Date.now() + 5 * 60 * 1000; // 5 phút

  // Lưu vào otpStore
  otpStore[email] = { otp, expiry };

  // Gửi email OTP
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD 
    }
  });

  await transporter.sendMail({
    from: '"Tuition Center" <nguyenthianhhuyen03@gmail.com>',
    to: email,
    subject: "Password Reset OTP",
    text: `Mã OTP để reset mật khẩu của bạn là: ${otp}. OTP có hiệu lực trong 5 phút.`
  });

  return { message: "OTP đã được gửi đến email của bạn." };
};

// B2: Hàm chỉ kiểm tra OTP hợp lệ
const checkOTP = async (email, otp) => {
  const record = otpStore[email];
  if (!record) throw new Error("Chưa có OTP cho email này.");

  if (record.otp !== otp) throw new Error("OTP không đúng.");
  if (Date.now() > record.expiry) throw new Error("OTP đã hết hạn.");

  return { message: "OTP hợp lệ." };
};

// B3: Hàm kiểm tra OTP + reset mật khẩu
const verifyOTPAndResetPassword = async (email, otp, newPassword) => {
  const record = otpStore[email];
  if (!record) throw new Error("Chưa có OTP cho email này.");

  if (record.otp !== otp || Date.now() > record.expiry) {
    throw new Error("OTP không hợp lệ hoặc đã hết hạn.");
  }

  // Kiểm tra user tồn tại
  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    throw new Error("Email không tồn tại trong hệ thống.");
  }

  // Hash mật khẩu trước khi lưu
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  // Xóa OTP sau khi dùng
  delete otpStore[email];

  return { message: "Mật khẩu đã được đặt lại thành công." };
};

// otpService.js
const sendOtpForEmailChange = async (email) => {
  // Không cần check email trong DB
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiry = Date.now() + 5 * 60 * 1000;

  otpStore[email] = { otp, expiry };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD 
    }
  });

  await transporter.sendMail({
    from: '"Tuition Center" <nguyenthianhhuyen03@gmail.com>',
    to: email,
    subject: "Email Change OTP",
    text: `Mã OTP để đổi email là: ${otp}. OTP có hiệu lực trong 5 phút.`
  });

  return { message: "OTP đã được gửi đến email mới." };
};


export { sendPasswordResetOTPEmail, checkOTP, verifyOTPAndResetPassword, sendOtpForEmailChange };
