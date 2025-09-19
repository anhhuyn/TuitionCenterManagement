import express from "express";
import loginController from '../controllers/loginController.js';
import forgotPasswordController from "../controllers/forgotPasswordController.js";
import registerController from '../controllers/registerController.js'; 
import verifyToken from "../middleware/authMiddleware.js"; 
import userController from '../controllers/userController.js';
import upload from '../middleware/uploadMiddleware.js';
import employeeController from "../controllers/employeeController.js"; 
import subjectController from '../controllers/subjectController.js';
let router = express.Router();

router.post('/login', loginController.handleLogin);
router.post('/register', registerController.handleRegister);
router.post("/verify-otp", registerController.handleVerifyOTP);
router.post("/forgot-password", forgotPasswordController.requestOTP);
router.post("/reset-password", forgotPasswordController.resetPassword);
router.post("/forgot-password/verify-otp", forgotPasswordController.verifyOTPCode);
router.get('/profile', verifyToken, userController.getUser);
router.post('/profile/update', verifyToken, userController.updateProfile);
router.post('/profile/verify-email-otp', verifyToken, userController.verifyEmailChangeOtp);
router.put('/profile/image', verifyToken, upload.single('image'), userController.updateImageProfile);
router.get('/subjects', subjectController.getSubjects);

router.get("/employees", employeeController.handleGetAllTeachers);

// Thêm nhân viên mới (có upload ảnh)
router.post("/employees", upload.single("image"), employeeController.handleCreateNewEmployee);

// Cập nhật thông tin nhân viên (có upload ảnh)
router.put("/employees/:id", upload.single("image"), (req, res) => {
  // Đảm bảo req.body tồn tại
  if (!req.body) req.body = {};
  req.body.id = req.params.id;
  return employeeController.handleUpdateEmployee(req, res);
});

// Xóa nhân viên
router.delete("/employees/:id", employeeController.handleDeleteEmployee);

router.get("/auth/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
