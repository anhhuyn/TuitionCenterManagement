import db from "../models/index.js";
import { Op, Sequelize } from "sequelize";
import dayjs from "dayjs";

/**
 * Tính lương giáo viên trong 1 tháng
 * @param {Number} month - Tháng cần tính lương (1-12)
 * @param {Number} year - Năm cần tính lương
 * @returns Danh sách giáo viên cùng tổng tiền và chi tiết từng môn
 */
export const calculateTeacherSalaryByMonth = async (month, year) => {
  try {
    // Xác định khoảng thời gian của tháng đó
    const startOfMonth = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const endOfMonth = dayjs(`${year}-${month}-01`).endOf("month").toDate();

    // Lấy toàn bộ giáo viên có môn giảng dạy
    const teachers = await db.Teacher.findAll({
      include: [
        {
          model: db.User,
          as: "userInfo",
          attributes: ["fullName", "email", "phoneNumber"],
          where: { roleId: "R1" },
        },
        {
          model: db.TeacherSubject,
          include: [
            {
              model: db.Subject,
              where: { status: "active" }, // chỉ môn đang hoạt động
              attributes: ["id", "name", "status"],
            },
          ],
        },
      ],
    });

    const result = [];

    for (const teacher of teachers) {
      const teacherData = {
        teacherId: teacher.id,
        fullName: teacher.userInfo?.fullName,
        email: teacher.userInfo?.email,
        phoneNumber: teacher.userInfo?.phoneNumber,
        subjects: [],
        totalAmount: 0,
      };

      // Duyệt qua từng môn giáo viên đó dạy
      for (const ts of teacher.TeacherSubjects) {
        const { subjectId, salaryRate } = ts;

        // Tìm các buổi học của môn đó trong tháng
        const sessions = await db.Session.findAll({
          where: {
            subjectId,
            status: "completed",
            sessionDate: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
          include: [
            {
              model: db.TeacherAttendance,
              where: {
                teacherId: teacher.id,
                status: "present",
              },
            },
          ],
        });

        let totalHours = 0;

        for (const s of sessions) {
          const start = dayjs(`${s.sessionDate} ${s.startTime}`);
          const end = dayjs(`${s.sessionDate} ${s.endTime}`);
          const duration = end.diff(start, "minute") / 60; // quy đổi ra giờ
          totalHours += duration;
        }

        const totalMoney = totalHours * parseFloat(salaryRate);

        teacherData.subjects.push({
          subjectId: ts.Subject.id,
          subjectName: ts.Subject.name,
          salaryRate,
          totalSessions: sessions.length,
          totalHours,
          totalMoney,
        });

        teacherData.totalAmount += totalMoney;
      }

      result.push(teacherData);
    }

    return result;
  } catch (error) {
    console.error("Lỗi khi tính lương giáo viên:", error);
    throw new Error("Không thể tính lương giáo viên");
  }
};

/**
 * Lưu lương giáo viên vào bảng TeacherPayment
 */
export const createTeacherPayments = async (month, year, notes = "") => {
  try {
    // 🔍 Kiểm tra xem tháng/năm đó đã có bảng lương chưa
    const existingPayments = await db.TeacherPayment.findAll({
      where: {
        notes: { [Op.like]: `%Lương tháng ${month}/${year}%` },
      },
    });

    if (existingPayments.length > 0) {
      return {
        errCode: 1,
        message: `Bảng lương cho tháng ${month}/${year} đã được tạo trước đó.`,
      };
    }

    // Tính lương
    const salaries = await calculateTeacherSalaryByMonth(month, year);
    const payments = [];

    // Tạo từng bảng lương
    for (const teacher of salaries) {
      const newPayment = await db.TeacherPayment.create({
        teacherId: teacher.teacherId,
        amount: teacher.totalAmount,
        paymentDate: new Date(),
        status: "unpaid",
        notes: `Lương tháng ${month}/${year}. ${notes}`,
      });

      // 💾 Thêm chi tiết lương theo môn
      for (const subj of teacher.subjects) {
        await db.TeacherPaymentDetail.create({
          paymentId: newPayment.id,
          subjectId: subj.subjectId,
          totalHours: subj.totalHours,
          totalSessions: subj.totalSessions,
          salaryRate: subj.salaryRate,
          totalMoney: subj.totalMoney,
        });
      }

      payments.push(newPayment);
    }

    return {
      errCode: 0,
      message: `✅ Tạo thành công bảng lương cho tháng ${month}/${year} (${payments.length} giáo viên).`,
      data: payments,
    };
  } catch (error) {
    console.error("Lỗi khi tạo bảng lương:", error);
    return {
      errCode: 2,
      message: "❌ Có lỗi xảy ra khi tạo bảng lương.",
      error: error.message,
    };
  }
};


export const payTeacherSalary = async (teacherId, month, year) => {
  try {
    if (!teacherId || !month || !year) {
      return { errCode: 1, message: "Thiếu teacherId, month hoặc year!" };
    }

    const payment = await db.TeacherPayment.findOne({
      where: {
        teacherId,
        notes: { [Op.like]: `%Lương tháng ${month}/${year}%` },
      },
    });

    if (!payment) {
      return { errCode: 2, message: "Không tìm thấy bảng lương!" };
    }

    if (payment.status === "paid") {
      return { errCode: 3, message: "Bảng lương đã được thanh toán!" };
    }

    payment.status = "paid";
    payment.paymentDate = new Date();
    await payment.save();

    return { errCode: 0, message: "Thanh toán thành công!", data: payment };
  } catch (error) {
    console.error("❌ Lỗi khi thanh toán lương:", error);
    return { errCode: 500, message: "Lỗi server khi thanh toán lương giáo viên!" };
  }
};

export const getTeacherSalaryDetail = async (teacherId, month, year) => {
  try {
    const payment = await db.TeacherPayment.findOne({
      where: {
        teacherId,
        notes: { [Op.like]: `%Lương tháng ${month}/${year}%` },
      },
      include: [
        {
          model: db.TeacherPaymentDetail,
          include: [
            {
              model: db.Subject,
              attributes: ["name"],
            },
          ],
        },
        {
          model: db.Teacher,
          include: [
            {
              model: db.User,
              as: "userInfo",
              attributes: ["fullName", "email", "phoneNumber"],
            },
          ],
        },
      ]
    });

    if (!payment) return null;

    // ✅ Gom nhóm theo subjectId trước
    const subjectMap = {};

    for (const d of payment.TeacherPaymentDetails) {
      const key = d.subjectId || "no-subject";
      if (!subjectMap[key]) {
        subjectMap[key] = {
          subjectId: d.subjectId,
          subjectName: d.Subject?.name || "Không có môn",
          salaryRate: d.salaryRate,
          totalSessions: d.totalSessions,
          totalHours: d.totalHours,
          totalMoney: d.totalMoney,
        };
      } else {
        subjectMap[key].totalSessions += d.totalSessions;
        subjectMap[key].totalHours += d.totalHours;
        subjectMap[key].totalMoney += d.totalMoney;
      }
    }

    // ✅ Trả kết quả 1 lần duy nhất
    return {
      teacherId: payment.teacherId,
      fullName: payment.Teacher.userInfo.fullName,
      email: payment.Teacher.userInfo.email,
      phoneNumber: payment.Teacher.userInfo.phoneNumber,
      status: payment.status,
      totalAmount: payment.amount,
      subjects: Object.values(subjectMap), // Danh sách môn sau khi gộp
    };
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết lương:", error);
    throw new Error("Không lấy được chi tiết lương giáo viên");
  }
};