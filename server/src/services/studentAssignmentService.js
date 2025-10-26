import db from '../models/index.js';

// Thêm student assignments cho tất cả student học môn chứa assignment này
const assignToStudents = async (assignmentId) => {
  const assignment = await db.Assignment.findByPk(assignmentId, {
    include: {
      model: db.Session,
      attributes: ['subjectId'],
    },
  });

  if (!assignment || !assignment.Session) {
    throw new Error('Assignment hoặc Session không tồn tại');
  }

  const subjectId = assignment.Session.subjectId;

  // Lấy tất cả studentId từ bảng StudentSubject đang học môn này
  const studentSubjects = await db.StudentSubject.findAll({
    where: { subjectId },
    attributes: ['studentId'],
  });

  if (studentSubjects.length === 0) {
    throw new Error('Không tìm thấy học sinh nào đang học môn này');
  }

  const studentAssignments = studentSubjects.map((ss) => ({
    assignmentId,
    studentId: ss.studentId,
    submittedStatus: 'pending',
    feedback: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  // Thêm hàng loạt vào DB
  await db.StudentAssignment.bulkCreate(studentAssignments);

  return {
    assignmentId,
    totalAssigned: studentAssignments.length,
  };
};

const getStudentAssignmentsByAssignmentId = async (assignmentId) => {
  const assignments = await db.StudentAssignment.findAll({
    where: { assignmentId },
    include: [
      {
        model: db.Student,
        include: [
          {
            model: db.User,
            as: 'userInfo',
            attributes: ['fullName', 'email', 'phoneNumber', 'gender', 'image'],
          }
        ],
        attributes: ['id', 'grade', 'schoolName']
      },
    ],
    order: [['createdAt', 'ASC']],
  });

  if (assignments.length === 0) {
    throw new Error('Không tìm thấy học sinh nào được gán assignment này');
  }

  return assignments;
};

const updateStudentAssignment = async (id, { submittedStatus, feedback }) => {
  const assignment = await db.StudentAssignment.findByPk(id);

  if (!assignment) {
    throw new Error('Không tìm thấy bản ghi StudentAssignment');
  }

  // Cập nhật nếu có truyền giá trị
  if (submittedStatus) assignment.submittedStatus = submittedStatus;
  if (feedback !== undefined) assignment.feedback = feedback;

  await assignment.save();

  return assignment;
};

export default {
  updateStudentAssignment,
  assignToStudents,
  getStudentAssignmentsByAssignmentId
};
