'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Feedback extends Model {
    static associate(models) {
      Feedback.belongsTo(models.Session, { foreignKey: 'sessionId' });
      Feedback.belongsTo(models.Student, { foreignKey: 'studentId' });
    }
  }

  Feedback.init({
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER, // 1-5
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'Feedback',
    tableName: 'feedbacks',
    updatedAt: false, // feedback không cần updatedAt
  });

  return Feedback;
};
