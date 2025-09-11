'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Subject extends Model {
    static associate(models) {
      Subject.hasMany(models.StudentSubject, { foreignKey: 'subjectId' });
      Subject.hasMany(models.TeacherSubject, { foreignKey: 'subjectId' });
    }
  }

  Subject.init({
    name: DataTypes.STRING,
    grade: DataTypes.STRING,
    price: DataTypes.DECIMAL(10, 2), // per hour
  }, {
    sequelize,
    modelName: 'Subject',
    timestamps: true,
  });

  return Subject;
};
