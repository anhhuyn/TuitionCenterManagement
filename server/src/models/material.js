'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Material extends Model {
    static associate(models) {
      Material.belongsTo(models.Subject, { foreignKey: 'subjectId' });
      Material.belongsTo(models.User, { foreignKey: 'uploadedBy' });
    }
  }

  Material.init({
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileURL: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING, // video | document | slide | other
      allowNull: false,
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    uploadedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'Material',
    tableName: 'materials',
    timestamps: true,
  });

  return Material;
};
