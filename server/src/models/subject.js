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
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active',
    },
    maxStudents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },
    sessionsPerWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // số buổi học mặc định mỗi tuần
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Subject',
    tableName: 'subjects',
    timestamps: true,
  });

  return Subject;
};
