'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class ParentContact extends Model {
    static associate(models) {
      ParentContact.belongsTo(models.Student, { foreignKey: 'studentId' });
    }
  }

  ParentContact.init({
    studentId: DataTypes.INTEGER,
    fullName: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    relationship: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'ParentContact',
    timestamps: true,
  });

  return ParentContact;
};
