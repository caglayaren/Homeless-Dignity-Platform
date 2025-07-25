'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      caseWorkerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'case_workers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('in-person', 'phone', 'video'),
        allowNull: false,
        defaultValue: 'in-person'
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'completed', 'cancelled', 'no-show'),
        allowNull: false,
        defaultValue: 'scheduled'
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      caseWorkerName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      purpose: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      reminderSent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      reminderSentAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('appointments');
  }
};