import express from "express";
import loginController from '../controllers/loginController.js';
import forgotPasswordController from "../controllers/forgotPasswordController.js";
import registerController from '../controllers/registerController.js'; 
import verifyToken from "../middleware/authMiddleware.js"; 

let router = express.Router();

router.post('/login', loginController.handleLogin);
router.post('/register', registerController.handleRegister);
router.post("/forgot-password", forgotPasswordController.requestOTP);
router.post("/reset-password", forgotPasswordController.resetPassword);
router.post("/forgot-password/verify-otp", forgotPasswordController.verifyOTPCode);

router.get("/auth/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
