'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'user' 
      });
      Appointment.belongsTo(models.CaseWorker, { 
        foreignKey: 'caseWorkerId', 
        as: 'caseWorker' 
      });
    }
  }
  
  Appointment.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    caseWorkerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'case_workers',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('in-person', 'phone', 'video'),
      allowNull: false,
      defaultValue: 'in-person'
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'no-show'),
      allowNull: false,
      defaultValue: 'scheduled'
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    caseWorkerName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reminderSentAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Appointment',
    tableName: 'appointments',
    timestamps: true,
    hooks: {
      beforeCreate: async (appointment) => {
        // Auto-set caseWorkerName if not provided
        if (!appointment.caseWorkerName && appointment.caseWorkerId) {
          const CaseWorker = sequelize.models.CaseWorker;
          const caseWorker = await CaseWorker.findByPk(appointment.caseWorkerId);
          if (caseWorker) {
            appointment.caseWorkerName = `${caseWorker.firstName} ${caseWorker.lastName}`;
          }
        }
        
        // Set default location for in-person appointments
        if (appointment.type === 'in-person' && !appointment.location) {
          appointment.location = 'Social Services Center, Room 205';
        }
      }
    }
  });
  
  return Appointment;
};