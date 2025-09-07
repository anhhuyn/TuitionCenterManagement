import registerService from "../services/registerService.js";

// Render trang đăng ký
let getRegisterPage = (req, res) => {
    return res.render("register");
};

// Xử lý yêu cầu đăng ký người dùng
let handleRegister = async (req, res) => {
    // Lấy tất cả thông tin cần thiết từ body của request
    const { email, password, fullName, role } = req.body;
    
    try {
        // Gọi service để xử lý, truyền đầy đủ các thông tin họ tên và vai trò
        const response = await registerService.handleRegister({ email, password, fullName, role });
        
        if (response.errCode === 0) {
            return res.status(200).json({
                message: response.message,
                email: email
            });
        } else {
            return res.status(400).json({
                message: response.message
            });
        }
    } catch (error) {
        console.error("Lỗi server khi đăng ký:", error);
        return res.status(500).json({
            message: "Có lỗi xảy ra từ phía máy chủ!"
        });
    }
};

// Render trang nhập mã OTP
let getOTPPage = (req, res) => {
    const { email } = req.query;
    return res.render("otp", { email });
};

// Xử lý xác thực mã OTP
let handleVerifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const response = await registerService.handleVerifyOTP(email, otp);
        if (response.errCode === 0) {
            return res.status(200).json({
                message: response.message
            });
        } else {
            return res.status(400).json({
                message: response.message
            });
        }
    } catch (error) {
        console.error("Lỗi server khi xác thực OTP:", error);
        return res.status(500).json({
            message: "Có lỗi xảy ra từ phía máy chủ!"
        });
    }
};

export default {
    getRegisterPage,
    handleRegister,
    getOTPPage,
    handleVerifyOTP
};
