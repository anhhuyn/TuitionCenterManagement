import db from "../models/index.js";
import { Op } from "sequelize";

/**
 * 🧩 Tạo mới thỏa thuận lương cho giáo viên theo môn
 */
const createTeacherSubject = async (data) => {
  const { teacherId, subjectId, salaryRate } = data;

  if (!teacherId || !subjectId || !salaryRate) {
    throw new Error("Thiếu dữ liệu bắt buộc (teacherId, subjectId, salaryRate)");
  }

  // 1. ✅ KIỂM TRA TRÙNG LẶP:
  const existingRecord = await db.TeacherSubject.findOne({
    where: {
      teacherId: teacherId,
      subjectId: subjectId,
    },
  });

  if (existingRecord) {
    // Nếu tìm thấy, ném ra lỗi
    throw new Error("Thỏa thuận đã tồn tại! Giáo viên này đã được phân công dạy môn học này.");
  }

  // 2. Tạo mới nếu không trùng lặp
  const record = await db.TeacherSubject.create({
    teacherId,
    subjectId,
    salaryRate,
  });

  return record;
};

const updateTeacherSubject = async (id, newData) => {
    const record = await db.TeacherSubject.findByPk(id);
    if (!record) throw new Error("Không tìm thấy thỏa thuận");

    const { teacherId, subjectId } = newData;

    // 1. KIỂM TRA TRÙNG LẶP NẾU NGƯỜI DÙNG CẬP NHẬT CÁC KHÓA NGOẠI (teacherId, subjectId)
    // Chỉ cần kiểm tra nếu người dùng truyền lên teacherId HOẶC subjectId.
    if (teacherId || subjectId) {
        // Giá trị mới hoặc giữ nguyên giá trị cũ
        const newTeacherId = teacherId ? Number(teacherId) : record.teacherId;
        const newSubjectId = subjectId ? Number(subjectId) : record.subjectId;

        // Nếu cặp mới khác cặp cũ, và người dùng đã cố gắng thay đổi khóa
        if (newTeacherId !== record.teacherId || newSubjectId !== record.subjectId) {
            const existingRecord = await db.TeacherSubject.findOne({
                where: {
                    teacherId: newTeacherId,
                    subjectId: newSubjectId,
                    // Loại trừ chính bản ghi đang được cập nhật
                    id: { [Op.ne]: id }, 
                },
            });

            if (existingRecord) {
                throw new Error("Cặp Giáo viên - Môn học này đã tồn tại trong thỏa thuận khác. Vui lòng chọn cặp khác.");
            }
        }
    }

    // 2. Cập nhật bản ghi
    await record.update(newData);
    return record;
};

/**
 * 🧩 Xóa thỏa thuận theo ID
 */
/**
 * 🧩 Xóa thỏa thuận theo ID
 */
const deleteTeacherSubject = async (id) => {
  if (!id || isNaN(Number(id))) {
    throw new Error("ID không hợp lệ.");
  }

  const record = await db.TeacherSubject.findByPk(id);

  if (!record) {
    throw new Error("Không tìm thấy thỏa thuận cần xóa.");
  }

  try {
    await record.destroy();
    return { 
      message: "Xóa thỏa thuận lương thành công.",
      deletedId: id 
    };
  } catch (error) {
    console.error("❌ Lỗi khi xóa thỏa thuận:", error);
    throw new Error("Đã xảy ra lỗi khi xóa thỏa thuận lương.");
  }
};

/**
 * 🧩 Lấy danh sách tất cả thỏa thuận lương
 * Cho phép trùng tên giáo viên (vì 1 gv có thể dạy nhiều môn)
 */
const getAllTeacherSubjects = async () => {
  const list = await db.TeacherSubject.findAll({
    include: [
      {
        model: db.Teacher,
        include: [
          {
            model: db.User,
            as: "userInfo",
            attributes: ["fullName", "email", "image"], // ✅ thêm avatar
          },
        ],
        attributes: ["id", "dateOfBirth", "specialty"],
      },
      {
        model: db.Subject,
        attributes: ["id", "name", "grade"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return list.map((ts) => ({
    id: ts.id,
    teacherId: ts.teacherId,
    teacherName: ts.Teacher?.userInfo?.fullName || "Không rõ",
    email: ts.Teacher?.userInfo?.email || "",
    dateOfBirth: ts.Teacher?.dateOfBirth,
    specialty: ts.Teacher?.specialty,
    subjectName: ts.Subject?.name,
    grade: ts.Subject?.grade,
    salaryRate: `${Number(ts.salaryRate).toLocaleString("vi-VN")} VNĐ/giờ`,
    createdAt: new Date(ts.createdAt).toLocaleString("vi-VN"),
    // ✅ thêm ảnh giáo viên (nếu có)
    teacherAvatar: ts.Teacher?.userInfo?.image
        ? `${process.env.BASE_URL || "http://localhost:8088"}${ts.Teacher.userInfo.image.startsWith('/') ? '' : '/'}${ts.Teacher.userInfo.image}`
        : null,

  }));
};

/**
 * 🧩 Lấy chi tiết 1 thỏa thuận theo ID
 */
const getTeacherSubjectById = async (id) => {
  const record = await db.TeacherSubject.findByPk(id, {
    include: [
      {
        model: db.Teacher,
        include: [
          {
            model: db.User,
            as: "userInfo",
            attributes: ["fullName", "email", "image"],
          },
        ],
        attributes: ["dateOfBirth", "specialty"],
      },
      {
        model: db.Subject,
        attributes: ["name", "grade"],
      },
    ],
  });

  if (!record) throw new Error("Không tìm thấy thỏa thuận");

  // ✅ Dùng record thay vì ts (ts không tồn tại trong hàm)
  const baseUrl = process.env.BASE_URL || "http://localhost:8088";

  return {
    id: record.id,
    teacherId: record.teacherId,
    subjectId: record.subjectId,
    teacherName: record.Teacher?.userInfo?.fullName || "Không rõ",
    email: record.Teacher?.userInfo?.email || "",
    dateOfBirth: record.Teacher?.dateOfBirth || null,
    specialty: record.Teacher?.specialty || "",
    subjectName: record.Subject?.name || "",
    grade: record.Subject?.grade || "",
    salaryRate: `${Number(record.salaryRate).toLocaleString("vi-VN")} VNĐ/giờ`,
    createdAt: new Date(record.createdAt).toLocaleString("vi-VN"),
    teacherAvatar: record.Teacher?.userInfo?.image
      ? `${baseUrl}${record.Teacher.userInfo.image.startsWith("/") ? "" : "/"}${record.Teacher.userInfo.image}`
      : null,
  };
};


export default {
  createTeacherSubject,
  updateTeacherSubject,
  deleteTeacherSubject,
  getAllTeacherSubjects,
  getTeacherSubjectById,
};
