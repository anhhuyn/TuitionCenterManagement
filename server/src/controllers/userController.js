import userService from '../services/userService.js';

const getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const result = await userService.updateUserProfile(req.user.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const verifyEmailChangeOtp = async (req, res) => {
  try {
    const result = await userService.verifyEmailOtp(req.user.id, req.body.otp);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateImageProfile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn ảnh để tải lên." });
    }

    // Lấy tên file ảnh được multer lưu
    const fileName = req.file.filename;

    // Tạo URL ảnh để client có thể truy cập
    const imageUrl = `/uploads/avatars/${fileName}`;

    // Gửi URL ảnh để cập nhật vào DB
    const result = await userService.updateUserImage(req.user.id, imageUrl);

    // Trả về kết quả
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export default {
  getUser,
  updateProfile,
  verifyEmailChangeOtp,
  updateImageProfile
};
