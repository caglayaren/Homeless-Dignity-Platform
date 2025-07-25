'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CaseWorker extends Model {
    static associate(models) {
      CaseWorker.hasMany(models.Message, { 
        foreignKey: 'caseWorkerId', 
        as: 'messages' 
      });
      CaseWorker.hasMany(models.Appointment, { 
        foreignKey: 'caseWorkerId', 
        as: 'appointments' 
      });
    }
  }
  
  CaseWorker.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    organization: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Social Services Department'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Case Worker'
    },
    specializations: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: ['housing', 'benefits', 'healthcare']
    },
    languagesSpoken: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: ['English']
    },
    availableForNewClients: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    maxCaseload: {
      type: DataTypes.INTEGER,
      defaultValue: 50
    },
    currentCaseload: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    operatingHours: {
      type: DataTypes.JSON,
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
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'CaseWorker',
    tableName: 'case_workers',
    timestamps: true
  });
  
  return CaseWorker;
};