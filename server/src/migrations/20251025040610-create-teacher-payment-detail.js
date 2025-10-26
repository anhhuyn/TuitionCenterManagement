'use strict';
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('TeacherPaymentDetails', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    paymentId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'TeacherPayments',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    subjectId: {
      type: Sequelize.INTEGER,
      allowNull: true, // ✅ Cho phép null
      references: {
        model: 'Subjects',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // ✅ Giữ nguyên
    },
    totalHours: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    totalSessions: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    salaryRate: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    totalMoney: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('TeacherPaymentDetails');
}
