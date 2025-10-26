import * as teacherMainPaymentService from "../services/teacherMainPaymentService.js";
import db from "../models/index.js";
import { Op } from "sequelize";

/**
 * 📅 Lấy danh sách lương giáo viên theo tháng & năm
 * GET /api/teacher-payments?month=10&year=2025
 */
const handleGetTeacherSalaries = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        errCode: 1,
        message: "Thiếu tham số tháng hoặc năm!",
      });
    }

    const data = await teacherMainPaymentService.calculateTeacherSalaryByMonth(
      parseInt(month),
      parseInt(year)
    );

    return res.status(200).json({
      errCode: 0,
      message: "Lấy danh sách lương giáo viên thành công!",
      data,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách lương:", error);
    return res.status(500).json({
      errCode: 500,
      message: "Lỗi server khi lấy danh sách lương giáo viên!",
    });
  }
};

/**
 * 💾 Tạo bảng lương (lưu vào TeacherPayment)
 * POST /api/teacher-payments
 * Body: { month: 10, year: 2025, notes: "Lương tháng 10" }
 */
const handleCreateTeacherPayments = async (req, res) => {
  try {
    const { month, year, notes } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        errCode: 1,
        message: "Thiếu dữ liệu tháng hoặc năm!",
      });
    }

    const data = await teacherMainPaymentService.createTeacherPayments(
      parseInt(month),
      parseInt(year),
      notes || ""
    );

    return res.status(201).json({
      errCode: 0,
      message: `Tạo bảng lương tháng ${month}/${year} thành công!`,
      data,
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo bảng lương:", error);
    return res.status(500).json({
      errCode: 500,
      message: "Lỗi server khi tạo bảng lương giáo viên!",
    });
  }
};

/**
 * 🔍 Xem chi tiết lương 1 giáo viên trong tháng cụ thể
 * GET /api/teacher-payments/:teacherId?month=10&year=2025
 */
const handleGetTeacherSalaryDetail = async (req, res) => {
    try {
    const { teacherId } = req.params;
    const { month, year } = req.query;

    if (!teacherId || !month || !year) {
      return res.status(400).json({
        errCode: 1,
        message: "Thiếu teacherId, month hoặc year!",
      });
    }

    // ✅ Lấy trực tiếp từ TeacherPayment + TeacherPaymentDetail
    const teacherData = await teacherMainPaymentService.getTeacherSalaryDetail(
      parseInt(teacherId),
      parseInt(month),
      parseInt(year)
    );

    if (!teacherData) {
      return res.status(404).json({
        errCode: 2,
        message: "Không tìm thấy thông tin lương của giáo viên này!",
      });
    }

    return res.status(200).json({
      errCode: 0,
      message: "Lấy chi tiết lương giáo viên thành công!",
      data: teacherData,
    });
  } catch (error) {
    console.error("❌ Lỗi khi xem chi tiết lương:", error);
    return res.status(500).json({
      errCode: 500,
      message: "Lỗi server khi xem chi tiết lương giáo viên!",
    });
  }
};
const handlePayTeacherSalary = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { month, year } = req.body;

    const result = await teacherMainPaymentService.payTeacherSalary(
      parseInt(teacherId),
      parseInt(month),
      parseInt(year)
    );

    if (result.errCode === 1) return res.status(400).json(result);
    if (result.errCode === 2) return res.status(404).json(result);
    if (result.errCode === 3) return res.status(409).json(result);
    if (result.errCode === 500) return res.status(500).json(result);

    return res.status(200).json(result);
  } catch (err) {
    console.error("❌ Lỗi controller khi thanh toán:", err);
    return res.status(500).json({
      errCode: 500,
      message: "Lỗi controller khi thanh toán lương giáo viên!",
    });
  }
};

export default {
  handleGetTeacherSalaries,
  handleCreateTeacherPayments,
  handleGetTeacherSalaryDetail,
  handlePayTeacherSalary,

};
