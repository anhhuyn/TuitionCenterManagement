import db from "../models/index.js";
const { Student, User } = db;

const getStudentsByGrade = async (grade) => {
  try {
    const students = await Student.findAll({
      where: { grade },
      include: [
        {
          model: User,
          as: "userInfo",
          attributes: ["id", "fullName", "gender"],
          where: { roleId: 'R2' } // R2 = học sinh
        },
      ],
      attributes: ["id", "dateOfBirth", "schoolName", "grade"],
    });

    return students.map((student) => ({
      id: student.id,
      fullName: student.userInfo?.fullName || "Chưa có tên",
      gender: student.userInfo?.gender,
      dateOfBirth: student.dateOfBirth,
      schoolName: student.schoolName,
      grade: student.grade,
    }));
  } catch (error) {
    throw new Error(error.message);
  }
};

export default {
  getStudentsByGrade
};
