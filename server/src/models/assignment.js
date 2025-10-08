'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Assignment extends Model {
    static associate(models) {
      Assignment.belongsTo(models.Session, { foreignKey: 'sessionId' });
      Assignment.hasMany(models.StudentAssignment, { foreignKey: 'assignmentId' });
    }
  }

  Assignment.init({
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    file: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Assignment',
    tableName: 'assignments',
    timestamps: true,
  });

  return Assignment;
};
