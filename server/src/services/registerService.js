import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import db from '../models/index.js';

const temporaryUsers = {};

// Ánh xạ vai trò từ tên tiếng Việt sang roleId tương ứng
const roleMapping = {
    'Giáo viên': 'R1',
    'Học sinh': 'R2',
};

// Hàm validate mật khẩu theo quy tắc
const validatePassword = (password) => {
    // Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

// Hàm xử lý đăng ký người dùng
let handleRegister = async (userData) => {
    const { email, password, fullName, role } = userData;

    // Kiểm tra các trường bắt buộc
    if (!email || !password || !fullName || !role) {
        return { errCode: 5, message: "Vui lòng điền đầy đủ thông tin: email, mật khẩu, họ tên và vai trò." };
    }

    // Kiểm tra định dạng mật khẩu
    if (!validatePassword(password)) {
        return { errCode: 4, message: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt." };
    }

    // Kiểm tra vai trò hợp lệ
    if (!roleMapping[role]) {
        return { errCode: 6, message: "Vai trò không hợp lệ. Vui lòng chọn 'Giáo viên' hoặc 'Học sinh'." };
    }

    // Kiểm tra email đã tồn tại chưa
    let existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
        return { errCode: 1, message: "Email này đã tồn tại." };
    }

    // Tạo mã OTP ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu thông tin tạm thời của người dùng cùng với mã OTP và roleId
    temporaryUsers[email] = {
        otp,
        data: {
            ...userData,
            roleId: roleMapping[role], // Lưu roleId đã ánh xạ
        },
        createdAt: Date.now(),
    };

    // Cấu hình Nodemailer để gửi email
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Mã OTP xác thực đăng ký',
        html: `Mã OTP của bạn là: <b>${otp}</b>. Vui lòng sử dụng mã này để hoàn tất đăng ký.`,
    };

    // Gửi email
    try {
        await transporter.sendMail(mailOptions);
        return { errCode: 0, message: "Mã OTP đã được gửi đến email của bạn." };
    } catch (error) {
        console.error("Lỗi gửi email:", error);
        return { errCode: 500, message: "Có lỗi xảy ra khi gửi email." };
    }
};

let handleVerifyOTP = async (email, otp) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra thông tin người dùng tạm thời
      const tempUser = temporaryUsers[email];
      if (!tempUser || (Date.now() - tempUser.createdAt) > 300000) {
        resolve({ errCode: 2, message: "Mã OTP không hợp lệ hoặc đã hết hạn." });
        return;
      }

      // Kiểm tra mã OTP
      if (tempUser.otp !== otp) {
        resolve({ errCode: 3, message: "Mã OTP không chính xác. Vui lòng thử lại." });
        return;
      }

      // Lấy dữ liệu gốc
      const { password, roleId, ...userData } = tempUser.data;

      // Băm mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo user
      const newUser = await db.User.create({
        ...userData,
        roleId,
        password: hashedPassword,
      });

      // Tạo thêm record Teacher/Student theo roleId
      if (roleId === 'R1') {
        await db.Teacher.create({
          userId: newUser.id,
          dateOfBirth: null,
          addressId: null,
          specialty: null,
        });
      } else if (roleId === 'R2') {
        await db.Student.create({
          userId: newUser.id,
          dateOfBirth: null,
          grade: null,
          schoolName: null,
          addressId: null,
        });
      }

      // Xóa tạm
      delete temporaryUsers[email];

      resolve({ errCode: 0, message: "Đăng ký tài khoản thành công!" });

    } catch (e) {
      console.error("Lỗi khi xác thực OTP:", e);
      reject(e);
    }
  });
};


export default {
    handleRegister,
    handleVerifyOTP,
};
