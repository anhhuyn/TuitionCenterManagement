'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class TeacherAttendance extends Model {
    static associate(models) {
      TeacherAttendance.belongsTo(models.Session, { foreignKey: 'sessionId' });
      TeacherAttendance.belongsTo(models.Teacher, { foreignKey: 'teacherId' });
    }
  }

  TeacherAttendance.init({
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    teacherId: {
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
    modelName: 'TeacherAttendance',
    tableName: 'teacher_attendances',
    timestamps: true,
  });

  return TeacherAttendance;
};
