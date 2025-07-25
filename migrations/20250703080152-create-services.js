'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('services', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('shelter', 'food', 'healthcare', 'social', 'employment', 'legal'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      hours: {
        type: Sequelize.JSON,
        allowNull: true
      },
      currentCapacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      maxCapacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      requirements: {
        type: Sequelize.JSON,
        allowNull: true
      },
      documentsNeeded: {
        type: Sequelize.JSON,
        allowNull: true
      },
      amenities: {
        type: Sequelize.JSON,
        allowNull: true
      },
      isHomelessFriendly: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      wheelchairAccessible: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      acceptsPets: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      lastUpdated: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
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
    await queryInterface.dropTable('services');
  }
};