import registerService from "../services/registerService.js";
let getRegisterPage = (req, res) => {
    return res.render("register");
};
let handleRegister = async (req, res) => {
    const { email, password, fullName, phoneNumber } = req.body;
    try {
        const response = await registerService.handleRegister({ email, password, fullName, phoneNumber });
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
let getOTPPage = (req, res) => {
    const { email } = req.query;
    return res.render("otp", { email });
};

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