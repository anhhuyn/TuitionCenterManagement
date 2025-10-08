// studentSubjectController.js
import studentSubjectService from "../services/studentSubjectService.js";

const getStudentsBySubjectId = async (req, res) => {
  try {
    const { subjectId } = req.params;

    if (!subjectId) {
      return res.status(400).json({ message: "Thiếu subjectId" });
    }

    const students = await studentSubjectService.getStudentsBySubjectId(subjectId);

    return res.status(200).json({
      message: "Lấy danh sách học sinh theo môn học thành công",
      data: students,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Có lỗi xảy ra khi lấy danh sách học sinh",
      error: error.message,
    });
  }
};

const removeStudentFromSubject = async (req, res) => {
  try {
    const { studentId, subjectId } = req.body;

    if (!studentId || !subjectId) {
      return res.status(400).json({ message: "Thiếu studentId hoặc subjectId" });
    }

    const result = await studentSubjectService.removeStudentFromSubject(studentId, subjectId);

    return res.status(200).json({
      message: result.message || "Xóa học sinh khỏi môn học thành công",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Có lỗi xảy ra khi xóa học sinh khỏi môn học",
      error: error.message,
    });
  }
};

const addStudentToSubject = async (req, res) => {
  try {
    const { studentId, subjectId } = req.body;

    if (!studentId || !subjectId) {
      return res.status(400).json({ message: "Thiếu studentId hoặc subjectId" });
    }

    const result = await studentSubjectService.addStudentToSubject(studentId, subjectId);

    return res.status(201).json({
      message: "Thêm học sinh vào môn học thành công",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Có lỗi xảy ra khi thêm học sinh vào môn học",
      error: error.message,
    });
  }
};

export default {
  getStudentsBySubjectId,
  removeStudentFromSubject,
  addStudentToSubject, 
};