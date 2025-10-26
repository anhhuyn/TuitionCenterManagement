// models/teacherpaymentdetail.js
'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class TeacherPaymentDetail extends Model {
    static associate(models) {
      TeacherPaymentDetail.belongsTo(models.TeacherPayment, { foreignKey: 'paymentId' });
      TeacherPaymentDetail.belongsTo(models.Subject, { foreignKey: 'subjectId' });
    }
  }

  TeacherPaymentDetail.init({
    paymentId: DataTypes.INTEGER,
    subjectId: DataTypes.INTEGER,
    totalHours: DataTypes.FLOAT,
    totalSessions: DataTypes.INTEGER,
    salaryRate: DataTypes.FLOAT,
    totalMoney: DataTypes.FLOAT,
  }, {
    sequelize,
    modelName: 'TeacherPaymentDetail',
    timestamps: true,
  });

  return TeacherPaymentDetail;
};
