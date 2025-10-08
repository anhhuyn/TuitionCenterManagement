import studentService from "../services/studentService.js";

const getStudentsByGrade = async (req, res) => {
  try {
    const { grade } = req.params;

    if (!grade) {
      return res.status(400).json({ message: "Thiếu grade" });
    }

    const students = await studentService.getStudentsByGrade(grade);

    return res.status(200).json({
      message: "Lấy danh sách học sinh theo khối thành công",
      data: students,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Có lỗi xảy ra khi lấy danh sách học sinh theo khối",
      error: error.message,
    });
  }
};

export default {
  getStudentsByGrade
};
