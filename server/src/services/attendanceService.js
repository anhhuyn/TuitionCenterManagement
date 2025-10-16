// services/attendanceService.js
import db from "../models/index.js";
const { Student, Session, AttendanceStudent, Subject, User, StudentSubject } = db;

const getAttendanceBySubject = async (subjectId) => {
  try {
    // 1. Get sessions of the subject
    const sessions = await Session.findAll({
      where: { subjectId },
      order: [['sessionDate', 'ASC']],
      attributes: ['id', 'sessionDate', 'startTime', 'endTime']
    });

    // 2. Get students of the subject via StudentSubject
    const studentSubjects = await StudentSubject.findAll({
      where: { subjectId },
      include: [
        {
          model: Student,
          include: [{
            model: User,
            as: 'userInfo',
            attributes: ['fullName']
          }]
        }
      ]
    });

    const students = [];

    for (const ss of studentSubjects) {
      const student = ss.Student;
      const attendances = await AttendanceStudent.findAll({
        where: {
          studentId: student.id,
          sessionId: sessions.map(s => s.id)
        },
        attributes: ['sessionId', 'status', 'note']
      });

      students.push({
        studentId: student.id,
        fullName: student.userInfo?.fullName || "Chưa có tên",
        attendances
      });
    }

    return {
      subjectId,
      sessions: sessions.map(s => ({
        sessionId: s.id,
        date: s.sessionDate,
        startTime: s.startTime,
        endTime: s.endTime
      })),
      students
    };

  } catch (error) {
    throw new Error("Lỗi khi lấy danh sách điểm danh: " + error.message);
  }
};

// Cập nhật hoặc thêm mới trạng thái điểm danh
const markAttendanceStatus = async ({ sessionId, studentId, status }) => {
  try {
    if (!sessionId || !studentId) throw new Error("Thiếu sessionId hoặc studentId");

    const existing = await AttendanceStudent.findOne({
      where: { sessionId, studentId }
    });

    if (existing) {
      await existing.update({ status });
      return { message: "Cập nhật trạng thái điểm danh thành công", type: "updated" };
    } else {
      await AttendanceStudent.create({ sessionId, studentId, status });
      return { message: "Thêm mới trạng thái điểm danh thành công", type: "created" };
    }

  } catch (error) {
    throw new Error("Lỗi khi lưu trạng thái điểm danh: " + error.message);
  }
};


// Cập nhật hoặc thêm mới ghi chú điểm danh
const updateAttendanceNote = async ({ sessionId, studentId, note }) => {
  try {
    if (!sessionId || !studentId) throw new Error("Thiếu sessionId hoặc studentId");

    const existing = await AttendanceStudent.findOne({
      where: { sessionId, studentId }
    });

    if (existing) {
      await existing.update({ note });
      return { message: "Cập nhật ghi chú thành công", type: "updated" };
    } else {
      await AttendanceStudent.create({ sessionId, studentId, note });
      return { message: "Thêm mới ghi chú thành công", type: "created" };
    }

  } catch (error) {
    throw new Error("Lỗi khi lưu ghi chú: " + error.message);
  }
};

export default {
  getAttendanceBySubject,
  markAttendanceStatus,
  updateAttendanceNote
};
