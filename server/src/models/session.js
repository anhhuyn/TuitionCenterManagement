'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Session extends Model {
    static associate(models) {
      // Session thuộc về 1 môn học
      Session.belongsTo(models.Subject, { foreignKey: 'subjectId' });
      // Session dựa trên 1 lịch học
      Session.belongsTo(models.SubjectSchedule, { foreignKey: 'scheduleId' });
      // Session diễn ra ở 1 phòng
      Session.belongsTo(models.Room, { foreignKey: 'roomId' });
      // Một buổi học có nhiều điểm danh học sinh
      Session.hasMany(models.AttendanceStudent, { foreignKey: 'sessionId' });
      // Một buổi học có điểm danh giáo viên
      Session.hasMany(models.TeacherAttendance, { foreignKey: 'sessionId' });
      // Feedback của học sinh về session
      Session.hasMany(models.Feedback, { foreignKey: 'sessionId' });
    }
  }

  Session.init({
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    scheduleId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Có thể null nếu là buổi bù
    },
    sessionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'scheduled', // scheduled | completed | canceled
    },
  }, {
    sequelize,
    modelName: 'Session',
    tableName: 'sessions',
    timestamps: true,
  });

  return Session;
};
