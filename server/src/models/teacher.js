// src/models/teacher.js
'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Teacher extends Model {
    static associate(models) {
      // Thêm 'as: 'userInfo'' để khớp với câu truy vấn
      Teacher.belongsTo(models.User, { foreignKey: 'userId', as: 'userInfo' });
      Teacher.belongsTo(models.Address, { foreignKey: 'addressId', as: 'addressInfo' });
      Teacher.hasMany(models.TeacherSubject, { foreignKey: 'teacherId' });
      Teacher.hasMany(models.TeacherPayment, { foreignKey: 'teacherId' });
    }
  }

  Teacher.init({
    userId: DataTypes.INTEGER,
    dateOfBirth: DataTypes.DATEONLY,
    addressId: DataTypes.INTEGER,
    specialty: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Teacher',
tableName: 'teachers',
    timestamps: true,
  });

  return Teacher;
};
/*
'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Teacher extends Model {
    static associate(models) {
      Teacher.belongsTo(models.User, { foreignKey: 'userId' });
      Teacher.belongsTo(models.Address, { foreignKey: 'addressId' });
      Teacher.hasMany(models.TeacherSubject, { foreignKey: 'teacherId' });
      Teacher.hasMany(models.TeacherPayment, { foreignKey: 'teacherId' });
    }
  }

  Teacher.init({
    userId: DataTypes.INTEGER,
    dateOfBirth: DataTypes.DATEONLY,
    addressId: DataTypes.INTEGER,
    specialty: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Teacher',
    tableName: 'teachers',
    timestamps: true,
  });

  return Teacher;
};*/