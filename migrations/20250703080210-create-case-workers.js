'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('case_workers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      organization: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Social Services Department'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Case Worker'
      },
      specializations: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: ['housing', 'benefits', 'healthcare']
      },
      languagesSpoken: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: ['English']
      },
      availableForNewClients: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      maxCaseload: {
        type: Sequelize.INTEGER,
        defaultValue: 50
      },
      currentCaseload: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      operatingHours: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' }
        }
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    await queryInterface.dropTable('case_workers');
  }
};