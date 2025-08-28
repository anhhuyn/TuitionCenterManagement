import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import db from '../models/index.js';

const temporaryUsers = {};

const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};
let handleRegister = async (userData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { email, password, fullName, phoneNumber } = userData;
            if (!validatePassword(password)) {
                return resolve({
                    errCode: 4,
                    message: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt."
                });
            }
            let existingUser = await db.User.findOne({
                where: { email: email },
            });
            if (existingUser) {
                resolve({
                    errCode: 1,
                    message: "Email này đã tồn tại trong hệ thống."
                });
                return;
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            temporaryUsers[email] = {
                otp: otp,
                data: { ...userData }, 
                createdAt: Date.now()
            };
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
                html: `Mã OTP của bạn là: <b>${otp}</b>. Vui lòng không chia sẻ mã này với bất kỳ ai.`
            };

            await transporter.sendMail(mailOptions);
            resolve({
                errCode: 0,
                message: "Mã OTP đã được gửi đến email của bạn."
            });

        } catch (e) {
            console.error("Lỗi khi đăng ký:", e);
            reject(e);
        }
    });
};
let handleVerifyOTP = async (email, otp) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!temporaryUsers[email]) {
                resolve({
                    errCode: 2,
                    message: "Mã OTP không hợp lệ hoặc đã hết hạn."
                });
                return;
            }
            if (temporaryUsers[email].otp !== otp) {
                resolve({
                    errCode: 3,
                    message: "Mã OTP không chính xác. Vui lòng thử lại."
                });
                return;
            }
            const userData = temporaryUsers[email].data;
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            await db.User.create({
                email: userData.email,
                password: hashedPassword,
                fullName: userData.fullName,
                phoneNumber: userData.phoneNumber,
                roleId: 'R2',
            });
            delete temporaryUsers[email];
            resolve({
                errCode: 0,
                message: "Đăng ký tài khoản thành công!"
            });
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