'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class TeacherSubject extends Model {
    static associate(models) {
      TeacherSubject.belongsTo(models.Teacher, { foreignKey: 'teacherId' });
      TeacherSubject.belongsTo(models.Subject, { foreignKey: 'subjectId' });
    }
  }

  TeacherSubject.init({
    teacherId: DataTypes.INTEGER,
    subjectId: DataTypes.INTEGER,
    salaryRate: DataTypes.DECIMAL(10, 2), // per hour
  }, {
    sequelize,
    modelName: 'TeacherSubject',
    tableName: 'teachersubjects',
    timestamps: true,
  });

  return TeacherSubject;
};