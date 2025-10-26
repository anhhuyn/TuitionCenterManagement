'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class TeacherPayment extends Model {
    static associate(models) {
      TeacherPayment.belongsTo(models.Teacher, { foreignKey: 'teacherId' });
      TeacherPayment.hasMany(models.TeacherPaymentDetail, {  foreignKey: "paymentId"   });
    }
  }

  TeacherPayment.init({
    teacherId: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL(10, 2),
    paymentDate: DataTypes.DATEONLY,
    status: DataTypes.STRING,
    notes: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'TeacherPayment',
    timestamps: true,
  });

  return TeacherPayment;
};
