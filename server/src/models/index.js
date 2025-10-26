// src/models/index.js
import Sequelize from 'sequelize';

// Import tất cả model
import userModel from './user.js';
import teacherModel from './teacher.js';
import addressModel from './address.js';
import parentContactModel from './parentContact.js';
import studentModel from './student.js';
import studentSubjectModel from './studentSubject.js';
import subjectModel from './subject.js';
import teacherPaymentModel from './teacherPayment.js';
import teacherSubjectModel from './teacherSubject.js';
import roomModel from './room.js';
import sessionModel from './session.js';
import subjectScheduleModel from './subjectschedule.js';
import attendanceStudentModel from './attendancestudent.js';
import assignmentModel from './assignment.js';
import studentAssignmentModel from './studentassignment.js';
import materialModel from './material.js';
import teacherAttendanceModel from './teacherattendance.js';
import feedbackModel from './feedback.js';
import teacherPaymentDetailModel from './teacherpaymentdetail.js'; // ✅ Thêm dòng này

// Kết nối Sequelize
const sequelize = new Sequelize('tuitioncentermanagement', 'root', '12345', {
  host: 'localhost',
  dialect: 'mysql' // hoặc 'postgres', 'sqlite', ...
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Khởi tạo model
db.User = userModel(sequelize, Sequelize.DataTypes);
db.Teacher = teacherModel(sequelize, Sequelize.DataTypes);
db.Address = addressModel(sequelize, Sequelize.DataTypes);
db.ParentContact = parentContactModel(sequelize, Sequelize.DataTypes);
db.Student = studentModel(sequelize, Sequelize.DataTypes);
db.StudentSubject = studentSubjectModel(sequelize, Sequelize.DataTypes);
db.Subject = subjectModel(sequelize, Sequelize.DataTypes);
db.TeacherPayment = teacherPaymentModel(sequelize, Sequelize.DataTypes);
db.TeacherPaymentDetail = teacherPaymentDetailModel(sequelize, Sequelize.DataTypes); // ✅ Thêm dòng này
db.TeacherSubject = teacherSubjectModel(sequelize, Sequelize.DataTypes);
db.Room = roomModel(sequelize, Sequelize.DataTypes);
db.Session = sessionModel(sequelize, Sequelize.DataTypes);
db.SubjectSchedule = subjectScheduleModel(sequelize, Sequelize.DataTypes);
db.AttendanceStudent = attendanceStudentModel(sequelize, Sequelize.DataTypes);
db.Assignment = assignmentModel(sequelize, Sequelize.DataTypes);
db.StudentAssignment = studentAssignmentModel(sequelize, Sequelize.DataTypes);
db.Material = materialModel(sequelize, Sequelize.DataTypes);
db.TeacherAttendance = teacherAttendanceModel(sequelize, Sequelize.DataTypes);
db.Feedback = feedbackModel(sequelize, Sequelize.DataTypes);

// Gọi associate nếu có
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
