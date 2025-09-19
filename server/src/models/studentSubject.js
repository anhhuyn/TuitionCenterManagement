'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class StudentSubject extends Model {
    static associate(models) {
      StudentSubject.belongsTo(models.Student, { foreignKey: 'studentId' });
      StudentSubject.belongsTo(models.Subject, { foreignKey: 'subjectId' });
    }
  }

  StudentSubject.init({
    studentId: DataTypes.INTEGER,
    subjectId: DataTypes.INTEGER,
    enrollmentDate: DataTypes.DATEONLY,
  }, {
    sequelize,
    modelName: 'StudentSubject',
    tableName: 'studentsubjects',
    timestamps: true,
  });

  return StudentSubject;
};