import db from "../models/index.js";
import { sendOtpForEmailChange, checkOTP } from "./otpService.js";
import fs from 'fs';
import path from 'path';

let pendingEmailUpdates = {};

const getUserById = async (userId) => {
  const user = await db.User.findByPk(userId, {
    attributes: [
      "id", "email", "fullName", "image",
      "roleId", "phoneNumber", "gender"
    ]
  });

  if (!user) throw new Error("Không tìm thấy người dùng");
  return user;
};

const updateUserProfile = async (userId, data) => {
  const { fullName, phoneNumber, gender, roleId, email } = data;
  const user = await db.User.findByPk(userId);
  if (!user) throw new Error("Không tìm thấy người dùng");

  await user.update({ fullName, phoneNumber, gender, roleId });

  if (email && email !== user.email) {
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("Email đã tồn tại trong hệ thống.");
    }

    await sendOtpForEmailChange(email);
    pendingEmailUpdates[userId] = email;

    return { requireOtp: true, message: "OTP đã được gửi tới email mới." };
  }

  return { message: "Thông tin đã được cập nhật.", user };
};

const verifyEmailOtp = async (userId, otp) => {
  const email = pendingEmailUpdates[userId];
  if (!email) throw new Error("Không có email đang chờ xác minh.");

  await checkOTP(email, otp);

  const user = await db.User.findByPk(userId);
  await user.update({ email });

  delete pendingEmailUpdates[userId];
  return { message: "Email đã được cập nhật thành công." };
};

const updateUserImage = async (userId, imageUrl) => {
  const user = await db.User.findByPk(userId);
  if (!user) throw new Error("Không tìm thấy người dùng");

  // Xóa ảnh cũ nếu có
  if (user.image) {
    // Chuyển URL thành đường dẫn tuyệt đối
    const oldImagePath = path.join(process.cwd(), 'public', user.image); // Hoặc user.image bắt đầu với 'uploads/...'

    if (fs.existsSync(oldImagePath)) {
      try {
        fs.unlinkSync(oldImagePath);
      } catch (err) {
        console.error("Lỗi khi xóa ảnh cũ:", err);
      }
    }
  }

  // Cập nhật image với URL mới
  await user.update({ image: imageUrl });

  return {
    message: "Ảnh đại diện đã được cập nhật.",
    image: imageUrl
  };
};

export default {
  getUserById,
  updateUserProfile,
  verifyEmailOtp,
  updateUserImage
};
