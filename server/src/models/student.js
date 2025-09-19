'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Student extends Model {
    static associate(models) {
      Student.belongsTo(models.User, { foreignKey: 'userId', as: 'userInfo' });
      Student.belongsTo(models.Address, { foreignKey: 'addressId', as: 'addressInfo' });
      Student.hasMany(models.ParentContact, { foreignKey: 'studentId' });
      Student.hasMany(models.StudentSubject, { foreignKey: 'studentId' });
    }
  }

  Student.init({
    userId: DataTypes.INTEGER,
    dateOfBirth: DataTypes.DATEONLY,
    grade: DataTypes.STRING,
    schoolName: DataTypes.STRING,
    addressId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Student',
    tableName: 'students',
    timestamps: true,
  });

  return Student;
};
/*
'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Student extends Model {
    static associate(models) {
      Student.belongsTo(models.User, { foreignKey: 'userId' });
      Student.belongsTo(models.Address, { foreignKey: 'addressId' });
      Student.hasMany(models.ParentContact, { foreignKey: 'studentId' });
      Student.hasMany(models.StudentSubject, { foreignKey: 'studentId' });
    }
  }

  Student.init({
    userId: DataTypes.INTEGER,
    dateOfBirth: DataTypes.DATEONLY,
    grade: DataTypes.STRING,
    schoolName: DataTypes.STRING,
    addressId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Student',
    tableName: 'students',
    timestamps: true,
  });

  return Student;
};*/