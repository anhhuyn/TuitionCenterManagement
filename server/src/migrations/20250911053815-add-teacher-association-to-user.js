'use strict';

export default {
  async up(queryInterface, Sequelize) {
    // Teacher.userId -> Users.id
    await queryInterface.addConstraint('Teachers', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'FK_Teachers_Users',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Teacher.addressId -> Addresses.id
    await queryInterface.addConstraint('Teachers', {
      fields: ['addressId'],
      type: 'foreign key',
      name: 'FK_Teachers_Addresses',
      references: {
        table: 'Addresses',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Student.userId -> Users.id
    await queryInterface.addConstraint('Students', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'FK_Students_Users',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Student.addressId -> Addresses.id
    await queryInterface.addConstraint('Students', {
      fields: ['addressId'],
      type: 'foreign key',
      name: 'FK_Students_Addresses',
      references: {
        table: 'Addresses',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Teachers', 'FK_Teachers_Users');
    await queryInterface.removeConstraint('Teachers', 'FK_Teachers_Addresses');
    await queryInterface.removeConstraint('Students', 'FK_Students_Users');
    await queryInterface.removeConstraint('Students', 'FK_Students_Addresses');
  }
};
