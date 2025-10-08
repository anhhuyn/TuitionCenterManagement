import subjectScheduleService from "../services/subjectScheduleService.js";

// Controller tạo lịch học và sinh session
const createSubjectSchedule = async (req, res) => {
  try {
    const { subjectId, dayOfWeek, startTime, endTime, roomId, startDate, endDate } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!subjectId || dayOfWeek === undefined || !startTime || !endTime || !roomId || !startDate) {
      return res.status(400).json({ message: "Thiếu thông tin lịch học hoặc startDate" });
    }

    // Tạo lịch học và sinh session tự động
    const { schedule, sessions } = await subjectScheduleService.createSubjectSchedule({
      subjectId,
      dayOfWeek,
      startTime,
      endTime,
      roomId,
      startDate,
      endDate,
    });

    return res.status(201).json({
      message: "Tạo lịch học và sinh sessions thành công",
      schedule,
      sessions,
    });
  } catch (error) {
    console.error("Error in createSubjectSchedule:", error);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi tạo lịch học",
      error: error.message,
    });
  }
};

// Controller lấy tất cả session theo subjectId
const getScheduleBySubjectId = async (req, res) => {
  try {
    const { subjectId } = req.params;

    if (!subjectId) {
      return res.status(400).json({ message: "Thiếu subjectId" });
    }

    const sessions = await subjectScheduleService.getScheduleBySubjectId(subjectId);

    return res.status(200).json({
      message: "Lấy thời khóa biểu thành công",
      sessions,
    });
  } catch (error) {
    console.error("Error in getScheduleBySubjectId:", error);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi lấy thời khóa biểu",
      error: error.message,
    });
  }
};

const addManualSession = async (req, res) => {
  try {
    const { subjectId, scheduleId, sessionDate, startTime, endTime, roomId, status } = req.body;

    if (!subjectId || !sessionDate || !startTime || !endTime) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const session = await subjectScheduleService.addManualSession({
      subjectId,
      scheduleId,
      sessionDate,
      startTime,
      endTime,
      roomId,
      status,
    });

    return res.status(201).json({
      message: "Tạo session thành công",
      session,
    });
  } catch (error) {
    console.error("Error in addManualSession:", error);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi tạo session",
      error: error.message,
    });
  }
};

const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: "Thiếu sessionId" });
    }

    const result = await subjectScheduleService.deleteSession(sessionId);

    return res.status(200).json({
      message: "Xoá buổi học thành công",
      result,
    });
  } catch (error) {
    console.error("Error in deleteSession:", error);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi xoá buổi học",
      error: error.message,
    });
  }
};

const updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params; // lấy sessionId từ params
    const { sessionDate, startTime, endTime, roomId, status } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Thiếu sessionId để chỉnh sửa" });
    }

    // Gọi service updateSession
    const updatedSession = await subjectScheduleService.updateSession({
      sessionId,
      sessionDate,
      startTime,
      endTime,
      roomId,
      status,
    });

    return res.status(200).json({
      message: "Cập nhật buổi học thành công",
      session: updatedSession,
    });
  } catch (error) {
    console.error("Error in updateSession:", error);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi cập nhật buổi học",
      error: error.message,
    });
  }
};

const getSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ message: "Thiếu sessionId" });

    const session = await subjectScheduleService.getSessionById(sessionId);

    return res.status(200).json({ session });
  } catch (error) {
    console.error(error);
    if (error.message === "Session không tồn tại") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export default {
  createSubjectSchedule,
  getScheduleBySubjectId,
  addManualSession,
  deleteSession,
  updateSession,
  getSessionById,
};
