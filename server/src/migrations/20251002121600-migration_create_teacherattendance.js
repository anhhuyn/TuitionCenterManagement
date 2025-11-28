'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('teacher_attendances', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    sessionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'sessions', // bảng sessions
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    teacherId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'teachers', // bảng teachers
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    status: {
      type: Sequelize.STRING, // present | absent | late
      allowNull: false,
      defaultValue: 'present',
    },
    note: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('teacher_attendances');
}
