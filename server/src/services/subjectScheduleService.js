import db from "../models/index.js";
import { Op } from "sequelize";
/**
 * Sinh ra các buổi học (Session) dựa trên startDate → endDate
 * Bỏ qua các session đã bắt đầu nếu là hôm nay
 * Không tạo trùng cùng scheduleId, sessionDate và startTime
 * @param {Object} schedule - SubjectSchedule instance
 */
const generateSessionsForSchedule = async (schedule) => {
  if (!schedule.startDate) throw new Error("Schedule must have startDate");

  const sessionsToCreate = [];
  const now = new Date(); // thời gian hiện tại

  // Format startTime & endTime chuẩn HH:MM:SS
  const formatTime = (timeStr) => timeStr.length === 5 ? timeStr + ":00" : timeStr;
  const startTimeStr = formatTime(schedule.startTime);
  const endTimeStr = formatTime(schedule.endTime);

  const start = new Date(schedule.startDate);
  const end = schedule.endDate ? new Date(schedule.endDate) : new Date(start);
  let currentDate = new Date(start);

  while (currentDate <= end) {
    // Kiểm tra ngày trong tuần có trùng với dayOfWeek
    if (currentDate.getDay() === schedule.dayOfWeek) {
      const sessionDateStr = currentDate.toISOString().split("T")[0];

      // Tạo datetime đầy đủ cho session
      const [hour, minute] = startTimeStr.split(":");
      const sessionDateTime = new Date(currentDate);
      sessionDateTime.setHours(hour, minute, 0, 0);

      // Bỏ qua nếu session hôm nay đã bắt đầu
      if (sessionDateTime <= now) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Kiểm tra session đã tồn tại chưa
      const exists = await db.Session.findOne({
        where: {
          subjectId: schedule.subjectId,
          sessionDate: sessionDateStr,
          startTime: startTimeStr
        }
      });

      if (!exists) {
        sessionsToCreate.push({
          subjectId: schedule.subjectId,
          scheduleId: schedule.id,
          sessionDate: sessionDateStr,
          startTime: startTimeStr,
          endTime: endTimeStr,
          roomId: schedule.roomId,
          status: "scheduled",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (sessionsToCreate.length > 0) {
    await db.Session.bulkCreate(sessionsToCreate);
  }

  return sessionsToCreate;
};

/**
 * Tạo lịch học mới và sinh session
 */
const createSubjectSchedule = async ({ subjectId, dayOfWeek, startTime, endTime, roomId, startDate, endDate }) => {
  // Format startTime chuẩn HH:MM:SS
  const formatTime = (timeStr) => timeStr.length === 5 ? timeStr + ":00" : timeStr;
  const startTimeStr = formatTime(startTime);

  // Kiểm tra schedule đã tồn tại chưa (cùng subjectId, dayOfWeek, startTime, roomId)
  let schedule = await db.SubjectSchedule.findOne({
    where: {
      subjectId,
      dayOfWeek,
      startTime: startTimeStr,
      roomId
    }
  });

  // Nếu chưa tồn tại thì tạo mới
  if (!schedule) {
    schedule = await db.SubjectSchedule.create({
      subjectId,
      dayOfWeek,
      startTime: startTimeStr,
      endTime,
      roomId,
      startDate,
      endDate,
    });
  }

  // Sinh session tự động
  const sessions = await generateSessionsForSchedule(schedule);

  return { schedule, sessions };
};

/**
 * Lấy tất cả session theo subjectId để hiển thị thời khóa biểu
 */
const getScheduleBySubjectId = async (subjectId) => {
  if (!subjectId) throw new Error("subjectId is required");

  const sessions = await db.Session.findAll({
    where: { subjectId },
    include: [
      { model: db.Room, attributes: ['name'] },
      { model: db.SubjectSchedule, attributes: ['dayOfWeek', 'startTime', 'endTime'] }
    ],
    order: [
      ['sessionDate', 'ASC'],
      ['startTime', 'ASC']
    ]
  });

  return sessions;
};

/**
 * Tạo một session thủ công
 */
const addManualSession = async ({ subjectId, scheduleId, sessionDate, startTime, endTime, roomId, status }) => {
  if (!subjectId || !sessionDate || !startTime || !endTime) {
    throw new Error("Thiếu thông tin bắt buộc để tạo session");
  }

  // Format time nếu cần
  const formatTime = (timeStr) => (timeStr.length === 5 ? timeStr + ":00" : timeStr);
  const startTimeStr = formatTime(startTime);
  const endTimeStr = formatTime(endTime);

  // ===== KIỂM TRA HỢP LỆ VỀ THỜI GIAN =====
  const today = new Date();
  const sessionDateTime = new Date(`${sessionDate}T${startTimeStr}`);
  const endDateTime = new Date(`${sessionDate}T${endTimeStr}`);

  // Nếu buổi học là hôm nay mà giờ bắt đầu < hiện tại → lỗi
  const isSameDay =
    sessionDateTime.getFullYear() === today.getFullYear() &&
    sessionDateTime.getMonth() === today.getMonth() &&
    sessionDateTime.getDate() === today.getDate();

  if (isSameDay && sessionDateTime <= today) {
    throw new Error("Giờ bắt đầu không hợp lệ (đã trôi qua so với hiện tại)");
  }

  // Nếu giờ kết thúc nhỏ hơn giờ bắt đầu → lỗi
  if (endDateTime <= sessionDateTime) {
    throw new Error("Giờ kết thúc phải sau giờ bắt đầu");
  }

  // ===== KIỂM TRA TRÙNG LẶP / CHỒNG GIỜ =====

  // 1️. Kiểm tra trùng giờ cùng phòng
  const overlappingRoom = await db.Session.findOne({
    where: {
      sessionDate,
      roomId,
      [Op.or]: [
        {
          startTime: { [Op.between]: [startTimeStr, endTimeStr] },
        },
        {
          endTime: { [Op.between]: [startTimeStr, endTimeStr] },
        },
      ],
    },
  });

  if (overlappingRoom) {
    throw new Error(
      `Phòng này đã có buổi khác (${overlappingRoom.startTime} - ${overlappingRoom.endTime}) trong cùng ngày`
    );
  }

  // 2️. Kiểm tra trùng giờ cùng lớp (subject)
  const overlappingSubject = await db.Session.findOne({
    where: {
      sessionDate,
      subjectId,
      [Op.or]: [
        {
          startTime: { [Op.between]: [startTimeStr, endTimeStr] },
        },
        {
          endTime: { [Op.between]: [startTimeStr, endTimeStr] },
        },
      ],
    },
  });

  if (overlappingSubject) {
    throw new Error(
      `Lớp học này đã có buổi khác (${overlappingSubject.startTime} - ${overlappingSubject.endTime}) vào cùng ngày`
    );
  }

  // =====  TẠO MỚI BUỔI HỌC =====
  const newSession = await db.Session.create({
    subjectId,
    scheduleId: scheduleId || null,
    sessionDate,
    startTime: startTimeStr,
    endTime: endTimeStr,
    roomId: roomId || null,
    status: status || "scheduled",
  });

  return newSession;
};

/**
 * Xoá một buổi học theo sessionId
 */
const deleteSession = async (sessionId) => {
  if (!sessionId) {
    throw new Error("Thiếu sessionId để xoá");
  }

  const session = await db.Session.findByPk(sessionId);

  if (!session) {
    throw new Error("Buổi học không tồn tại");
  }

  await session.destroy();

  return { message: "Đã xoá buổi học thành công", id: sessionId };
};

/**
 * Chỉnh sửa thông tin một buổi học (session)
 * @param {Object} params - Các thông tin cần chỉnh sửa
 * @param {string} params.sessionId - ID buổi học cần chỉnh sửa (bắt buộc)
 * @param {string} [params.sessionDate] - Ngày buổi học (YYYY-MM-DD)
 * @param {string} [params.startTime] - Giờ bắt đầu (HH:MM hoặc HH:MM:SS)
 * @param {string} [params.endTime] - Giờ kết thúc (HH:MM hoặc HH:MM:SS)
 * @param {number} [params.roomId] - ID phòng học
 * @param {string} [params.status] - Trạng thái (scheduled, completed, canceled)
 */
const updateSession = async ({
  sessionId,
  sessionDate,
  startTime,
  endTime,
  roomId,
  status,
}) => {
  if (!sessionId) throw new Error("Thiếu sessionId để chỉnh sửa");

  const session = await db.Session.findByPk(sessionId);
  if (!session) throw new Error("Buổi học không tồn tại");

  // Chuẩn hóa định dạng giờ HH:MM → HH:MM:SS
  const formatTime = (timeStr) =>
    timeStr && timeStr.length === 5 ? timeStr + ":00" : timeStr;

  // Dữ liệu mới (nếu không truyền thì giữ nguyên)
  const newSessionDate = sessionDate || session.sessionDate;
  const newStartTime = formatTime(startTime || session.startTime);
  const newEndTime = formatTime(endTime || session.endTime);
  const newRoomId = roomId !== undefined ? roomId : session.roomId;
  const newStatus = status || session.status;

  // === KIỂM TRA HỢP LỆ CƠ BẢN ===
  const today = new Date();
  const sessionDateTime = new Date(`${newSessionDate}T${newStartTime}`);
  const endDateTime = new Date(`${newSessionDate}T${newEndTime}`);

  if (endDateTime <= sessionDateTime) {
    throw new Error("Giờ kết thúc phải sau giờ bắt đầu");
  }

  // === PHÂN BIỆT BUỔI HỌC QUÁ KHỨ & TƯƠNG LAI ===
  const isPastSession = sessionDateTime < today;

  // 🔸 Nếu buổi học trong tương lai → vẫn cần kiểm tra trùng giờ
  if (!isPastSession) {
    // Kiểm tra trùng giờ cùng phòng (ngoại trừ chính nó)
    const overlappingRoom = await db.Session.findOne({
      where: {
        id: { [Op.ne]: sessionId },
        sessionDate: newSessionDate,
        roomId: newRoomId,
        [Op.or]: [
          { startTime: { [Op.between]: [newStartTime, newEndTime] } },
          { endTime: { [Op.between]: [newStartTime, newEndTime] } },
        ],
      },
    });

    if (overlappingRoom) {
      throw new Error(
        `Phòng này đã có buổi khác (${overlappingRoom.startTime} - ${overlappingRoom.endTime}) trong cùng ngày`
      );
    }

    // Kiểm tra trùng giờ cùng lớp (subject)
    const overlappingSubject = await db.Session.findOne({
      where: {
        id: { [Op.ne]: sessionId },
        sessionDate: newSessionDate,
        subjectId: session.subjectId,
        [Op.or]: [
          { startTime: { [Op.between]: [newStartTime, newEndTime] } },
          { endTime: { [Op.between]: [newStartTime, newEndTime] } },
        ],
      },
    });

    if (overlappingSubject) {
      throw new Error(
        `Lớp học này đã có buổi khác (${overlappingSubject.startTime} - ${overlappingSubject.endTime}) vào cùng ngày`
      );
    }
  } else {
    console.warn(
      "Cảnh báo: Buổi học đã trôi qua — bỏ qua kiểm tra trùng giờ, nhưng vẫn kiểm tra logic giờ học."
    );
  }

  // === CẬP NHẬT DỮ LIỆU ===
  session.sessionDate = newSessionDate;
  session.startTime = newStartTime;
  session.endTime = newEndTime;
  session.roomId = newRoomId;
  session.status = newStatus;

  await session.save();

  return session;
};

const getSessionById = async (sessionId) => {
  const session = await db.Session.findByPk(sessionId, {
    include: [
      { model: db.Room, attributes: ['name'] },
      { model: db.SubjectSchedule, attributes: ['dayOfWeek', 'startTime', 'endTime'] }
    ]
  });
  if (!session) throw new Error("Session không tồn tại");
  return session;
};

export default {
  getSessionById,
  updateSession,
  deleteSession,
  createSubjectSchedule,
  getScheduleBySubjectId,
  addManualSession
};
