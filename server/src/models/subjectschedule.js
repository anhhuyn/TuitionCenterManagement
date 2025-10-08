'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class SubjectSchedule extends Model {
    static associate(models) {
      // Mỗi lịch học thuộc về 1 môn học
      SubjectSchedule.belongsTo(models.Subject, { foreignKey: 'subjectId' });
      // Mỗi lịch học diễn ra ở 1 phòng
      SubjectSchedule.belongsTo(models.Room, { foreignKey: 'roomId' });
      // Một lịch học có thể tạo ra nhiều buổi học (session)
      SubjectSchedule.hasMany(models.Session, {
        foreignKey: 'scheduleId',
        onDelete: 'CASCADE',   // thêm dòng này
        hooks: true            // cần thiết để Sequelize thực hiện cascade
      });
    }
  }

  SubjectSchedule.init({
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dayOfWeek: {
      type: DataTypes.INTEGER, // 0=Chủ nhật, 1=Thứ 2, ... 6=Thứ 7
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
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Ngày bắt đầu lịch học",
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Ngày kết thúc lịch học (có thể null nếu chưa xác định)",
    },
  }, {
    sequelize,
    modelName: 'SubjectSchedule',
    tableName: 'subject_schedules',
    timestamps: true,
  });

  return SubjectSchedule;
};
