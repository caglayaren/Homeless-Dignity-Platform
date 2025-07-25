'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    static associate(models) {
      // Relations can be added here
    }
  }
  
  Service.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.ENUM('shelter', 'food', 'healthcare', 'social', 'employment', 'legal'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    hours: {
      type: DataTypes.JSON,
      allowNull: true
    },
    currentCapacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    maxCapacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    // Frontend expects these specific fields
    availability: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.maxCapacity - this.currentCapacity;
      }
    },
    capacity: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.maxCapacity;
      }
    },
    requirements: {
      type: DataTypes.JSON,
      allowNull: true
    },
    documentsNeeded: {
      type: DataTypes.JSON,
      allowNull: true
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true
    },
    isHomelessFriendly: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    wheelchairAccessible: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    acceptsPets: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Service',
    tableName: 'services',
    timestamps: true,
    hooks: {
      beforeSave: (service) => {
        service.lastUpdated = new Date();
      }
    }
  });
  
  return Service;
};