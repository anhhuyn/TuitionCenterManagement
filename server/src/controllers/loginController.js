import loginService from "../services/loginService.js";
import jwt from 'jsonwebtoken';

// Hàm xử lý login
let handleLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await loginService.handleUserLogin(email, password);
    if (user) {
      console.log("Đăng nhập thành công:", user);

      // Tạo JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          image: user.image,
          roleId: user.roleId
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Gửi token trong cookie (httpOnly để bảo mật, không cho client JS truy cập)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // 👈 sửa lại
        path: '/',
        maxAge: 60 * 60 * 1000 // 1 giờ (ms)
      });

      // Trả token về dưới dạng JSON
      return res.status(200).json({
        message: "Đăng nhập thành công!",
        token: token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          image: user.image,
          roleId: user.roleId,
          gender: user.gender,
          phoneNumber: user.phoneNumber,
        }
      });
    } else {
      console.log("Đăng nhập thất bại: Sai email hoặc mật khẩu");
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng!",
      });
    }
  } catch (error) {
    console.error("Lỗi server khi đăng nhập:", error);
    return res.status(500).json({
      message: "Có lỗi xảy ra từ phía máy chủ!",
    });
  }
};

// Hàm xử lý ĐĂNG XUẤT
let handleLogout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/',
    });

    return res.status(200).json({ message: "Đăng xuất thành công!" });
  } catch (error) {
    console.error("Lỗi khi logout:", error);
    return res.status(500).json({ message: "Không thể đăng xuất!" });
  }
};

export default {
  handleLogin,
  handleLogout
};
