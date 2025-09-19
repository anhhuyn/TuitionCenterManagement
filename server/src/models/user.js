'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Teacher, { foreignKey: 'userId', as: 'teacherInfo' });
      User.hasOne(models.Student, { foreignKey: 'userId', as: 'studentInfo' });
      
    }
  }

  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    fullName: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    gender: DataTypes.BOOLEAN,
    image: DataTypes.STRING,
    roleId: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true,
  });

  return User;
};
