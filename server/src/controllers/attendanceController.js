// controllers/attendanceController.js
import attendanceService from "../services/attendanceService.js";

const getAttendanceBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    if (!subjectId) {
      return res.status(400).json({ message: "Thiếu subjectId" });
    }

    const data = await attendanceService.getAttendanceBySubject(subjectId);
    return res.status(200).json({
      message: "Lấy danh sách học sinh và điểm danh thành công",
      data
    });

  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server khi lấy điểm danh",
      error: error.message
    });
  }
};

// Chấm điểm danh (status)
const markAttendanceStatus = async (req, res) => {
  try {
    const { sessionId, studentId, status } = req.body;
    if (!sessionId || !studentId) {
      return res.status(400).json({ message: "Thiếu sessionId hoặc studentId" });
    }

    const result = await attendanceService.markAttendanceStatus({ sessionId, studentId, status });
    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server khi lưu trạng thái điểm danh",
      error: error.message
    });
  }
};


// Ghi chú điểm danh (note)
const updateAttendanceNote = async (req, res) => {
  try {
    const { sessionId, studentId, note } = req.body;
    if (!sessionId || !studentId) {
      return res.status(400).json({ message: "Thiếu sessionId hoặc studentId" });
    }

    const result = await attendanceService.updateAttendanceNote({ sessionId, studentId, note });
    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server khi lưu ghi chú",
      error: error.message
    });
  }
};

export default {
  getAttendanceBySubject,
  markAttendanceStatus,
  updateAttendanceNote
};
