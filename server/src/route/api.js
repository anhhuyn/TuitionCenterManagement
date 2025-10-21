import express from "express";
import loginController from '../controllers/loginController.js';
import forgotPasswordController from "../controllers/forgotPasswordController.js";
import registerController from '../controllers/registerController.js'; 
import verifyToken from "../middleware/authMiddleware.js"; 
import userController from '../controllers/userController.js';
import upload from '../middleware/uploadMiddleware.js';
import uploadMaterial from '../middleware/uploadMaterial.js';
import employeeController from "../controllers/employeeController.js"; 
import subjectController from '../controllers/subjectController.js';
import studentSubjectController from "../controllers/studentSubjectController.js";
import studentController from "../controllers/studentController.js";
import subjectScheduleController from "../controllers/subjectScheduleController.js";
import roomController from "../controllers/roomController.js";
import attendanceController from '../controllers/attendanceController.js';
import materialController from '../controllers/materialController.js';
import multer from 'multer';
import assignmentController from '../controllers/assignmentController.js';
import uploadAssignment from '../middleware/uploadAssignment.js';

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
router.post('/subjects', subjectController.createSubject);
router.get('/subjects/:id', subjectController.getSubjectById);
router.put('/subjects/:id', subjectController.updateSubject);

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

router.get("/teachers/basic", employeeController.handleGetTeacherBasicList);

// Lấy danh sách học sinh theo môn học
router.get("/subject-students/:subjectId", studentSubjectController.getStudentsBySubjectId);
// Thêm học sinh vào môn học
router.post("/subject-students", studentSubjectController.addStudentToSubject);
router.delete("/subject-students", studentSubjectController.removeStudentFromSubject);
// Lấy danh sách học sinh theo khối
router.get("/students/by-grade/:grade", studentController.getStudentsByGrade);

// Tạo lịch học cho môn học + sinh session tự động
router.post("/subject-schedules", subjectScheduleController.createSubjectSchedule);
// Lấy lịch học theo subjectId
router.get("/schedule/:subjectId", subjectScheduleController.getScheduleBySubjectId);

// Lấy toàn bộ phòng học
router.get("/rooms", roomController.getAllRooms);

// Thêm 1 buổi học
router.post('/manual-session', subjectScheduleController.addManualSession);

// Route xoá session
router.delete("/session/:sessionId", subjectScheduleController.deleteSession);

// Chỉnh sửa 1 buổi học (session) theo sessionId
router.put("/session/:sessionId", subjectScheduleController.updateSession);

router.get("/session/:sessionId", subjectScheduleController.getSessionById);

router.get('/subject/:subjectId/attendance', attendanceController.getAttendanceBySubject);


// Cập nhật trạng thái điểm danh (status)
router.put('/attendance/status', attendanceController.markAttendanceStatus);

// Cập nhật ghi chú điểm danh (note)
router.put('/attendance/note', attendanceController.updateAttendanceNote);

// Tài liệu
router.get('/materials/subject/:subjectId', materialController.getMaterialsBySubject);
router.post('/materials', (req, res, next) => {
  uploadMaterial.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File không được vượt quá 10MB' });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, materialController.uploadMaterial);

router.put('/materials/:materialId/file', uploadMaterial.single('file'), materialController.updateMaterialFile);
router.delete('/materials/:materialId', materialController.deleteMaterial);

// Assignment
router.get('/assignments/subject/:subjectId', assignmentController.getAssignmentsBySubject); // Lấy tất cả bài tập theo môn học

router.post('/assignments', uploadAssignment.single('file'), assignmentController.uploadAssignment); // Tạo mới assignment

router.put('/assignments/:assignmentId', uploadAssignment.single('file'), assignmentController.updateAssignment); //  Cập nhật bài tập

router.delete('/assignments/:assignmentId', assignmentController.deleteAssignment); //  Xóa bài tập


router.get("/auth/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
