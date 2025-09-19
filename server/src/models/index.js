//index.js
import Sequelize from 'sequelize';
import userModel from './user.js';
import teacherModel from './teacher.js';
import addressModel from './address.js';
import parentContactModel from './parentContact.js';
import studentModel from './student.js';
import studentSubjectModel from './studentSubject.js';
import subjectModel from './subject.js';
import teacherPaymentModel from './teacherPayment.js';
import teacherSubjectModel from './teacherSubject.js';

const sequelize = new Sequelize('tuitioncentermanagement', 'root', '@Thanh05052004', {
  host: 'localhost',
  dialect: 'mysql' // hoặc 'postgres', 'sqlite', ...
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = userModel(sequelize, Sequelize.DataTypes);
db.Teacher = teacherModel(sequelize, Sequelize.DataTypes);
db.Address = addressModel(sequelize, Sequelize.DataTypes);
db.ParentContact = parentContactModel(sequelize, Sequelize.DataTypes);
db.Student = studentModel(sequelize, Sequelize.DataTypes);
db.StudentSubject = studentSubjectModel(sequelize, Sequelize.DataTypes);
db.Subject = subjectModel(sequelize, Sequelize.DataTypes);
db.TeacherPayment = teacherPaymentModel(sequelize, Sequelize.DataTypes);
db.TeacherSubject = teacherSubjectModel(sequelize, Sequelize.DataTypes);

// Thêm đoạn code này để thiết lập tất cả các mối quan hệ
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
