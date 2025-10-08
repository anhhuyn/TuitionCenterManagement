'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class AttendanceStudent extends Model {
    static associate(models) {
      AttendanceStudent.belongsTo(models.Session, { foreignKey: 'sessionId' });
      AttendanceStudent.belongsTo(models.Student, { foreignKey: 'studentId' });
    }
  }

  AttendanceStudent.init({
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING, // present | absent | late
      allowNull: false,
      defaultValue: 'present',
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'AttendanceStudent',
    tableName: 'attendance_students',
    timestamps: true,
  });

  return AttendanceStudent;
};
