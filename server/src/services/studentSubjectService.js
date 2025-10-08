// studentSubjectService.js
import db from "../models/index.js";
const { StudentSubject, Student, User, Subject } = db;

const getStudentsBySubjectId = async (subjectId) => {
  try {
    const students = await StudentSubject.findAll({
      where: { subjectId },
      include: [
        {
          model: Student,
          attributes: ["id", "dateOfBirth", "schoolName"],
          include: [
            {
              model: User,
              as: "userInfo",
              attributes: ["id", "fullName", "gender"],
              where: { roleId: 'R2' } 
            },
          ],
        },
      ],
    });

    return students.map((s) => ({
      id: s.Student.id,
      fullName: s.Student.userInfo?.fullName || "Chưa có tên",
      gender: s.Student.userInfo?.gender,
      dateOfBirth: s.Student.dateOfBirth,
      schoolName: s.Student.schoolName,
    }));
  } catch (error) {
    throw new Error(error.message);
  }
};

const removeStudentFromSubject = async (studentId, subjectId) => {
  try {
    const result = await StudentSubject.destroy({
      where: {
        studentId,
        subjectId,
      },
    });

    if (result === 0) {
      throw new Error("Không tìm thấy học sinh trong môn học này.");
    }

    return { message: "Xóa học sinh khỏi môn học thành công." };
  } catch (error) {
    throw new Error(error.message);
  }
};

const addStudentToSubject = async (studentId, subjectId) => {
  try {
    // Kiểm tra xem studentId và subjectId có tồn tại không
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new Error("Không tìm thấy học sinh");
    }

    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      throw new Error("Không tìm thấy môn học");
    }

    // Kiểm tra đã tồn tại chưa
    const existing = await StudentSubject.findOne({
      where: { studentId, subjectId },
    });

    if (existing) {
      throw new Error("Học sinh đã được thêm vào môn học này");
    }

    // Thêm mới
    const newRecord = await StudentSubject.create({
      studentId,
      subjectId,
      enrollmentDate: new Date(), 
    });

    return newRecord;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default {
  getStudentsBySubjectId, removeStudentFromSubject,  addStudentToSubject,
};
