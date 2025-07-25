'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Document, { foreignKey: 'userId', as: 'documents' });
      User.hasMany(models.Message, { foreignKey: 'senderId', as: 'sentMessages' });
      User.hasMany(models.Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
      User.hasMany(models.Appointment, { foreignKey: 'userId', as: 'appointments' });
    }
  }
  
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 100]
      }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        len: [8, 18]
      }
    },
    // ❌ EMAIL FIELD'INI KALDIRDIM - Database'de yok!
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    emergencyContact: {
      type: DataTypes.STRING,
      allowNull: true
    },
    medicalConditions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    caseWorkerName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    preferredShelter: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true
  });
  
  // Mesajlaşma için helper metodlar
  User.prototype.getFullName = function() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim() || 'User';
  };
  
  User.prototype.getDisplayName = function() {
    const fullName = this.getFullName();
    return fullName !== 'User' ? fullName : this.phoneNumber;
  };
  
  return User;
};