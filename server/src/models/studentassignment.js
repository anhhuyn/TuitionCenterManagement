'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class StudentAssignment extends Model {
    static associate(models) {
      StudentAssignment.belongsTo(models.Assignment, { foreignKey: 'assignmentId' });
      StudentAssignment.belongsTo(models.Student, { foreignKey: 'studentId' });
    }
  }

  StudentAssignment.init({
    assignmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    submittedStatus: {
      type: DataTypes.STRING, // pending | submitted | late
      allowNull: false,
      defaultValue: 'pending',
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'StudentAssignment',
    tableName: 'student_assignments',
    timestamps: true,
  });

  return StudentAssignment;
};
