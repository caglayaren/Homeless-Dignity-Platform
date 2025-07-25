'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.User, {
        foreignKey: 'senderId',
        as: 'sender'
      });
      Message.belongsTo(models.User, {
        foreignKey: 'receiverId',
        as: 'receiver'
      });
      Message.belongsTo(models.CaseWorker, {
        foreignKey: 'caseWorkerId',
        as: 'caseWorker'
      });
    }
  }
  
  Message.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 2000] // ✨ Mesaj uzunluk limiti eklendi
      }
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    isFromCaseWorker: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    senderName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    messageType: {
      type: DataTypes.ENUM('text', 'document', 'image', 'system', 'location'), // ✨ 'location' eklendi
      defaultValue: 'text'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isUrgent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    attachmentUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // ✨ YENİ ALANLAR - User mesajlaşması için
    metadata: {
      type: DataTypes.JSON, // Konum bilgisi, reply mesajları vs. için
      allowNull: true
    },
    conversationId: {
      type: DataTypes.STRING, // Konuşma gruplandırması için
      allowNull: true,
      comment: 'Format: smaller_user_id-larger_user_id (örn: 1-5)'
    },
    parentMessageId: {
      type: DataTypes.INTEGER, // Reply mesajları için
      allowNull: true,
      references: {
        model: 'messages',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    timestamps: true,
    // ✨ İndeksler eklendi - performans için
    indexes: [
      {
        fields: ['senderId', 'receiverId']
      },
      {
        fields: ['conversationId', 'createdAt']
      },
      {
        fields: ['timestamp']
      },
      {
        fields: ['isRead']
      }
    ],
    hooks: {
      beforeCreate: async (message) => {
        // Auto-set timestamp
        message.timestamp = new Date();
        
        // ✨ ConversationId otomatik oluştur (user-to-user mesajları için)
        if (message.senderId && message.receiverId && !message.caseWorkerId) {
          const smallerId = Math.min(message.senderId, message.receiverId);
          const largerId = Math.max(message.senderId, message.receiverId);
          message.conversationId = `${smallerId}-${largerId}`;
        }
        
        // Auto-set senderName based on who's sending
        if (message.isFromCaseWorker && message.caseWorkerId) {
          const CaseWorker = sequelize.models.CaseWorker;
          const caseWorker = await CaseWorker.findByPk(message.caseWorkerId);
          if (caseWorker) {
            message.senderName = `${caseWorker.firstName} ${caseWorker.lastName}`;
          }
        } else if (message.senderId) {
          const User = sequelize.models.User;
          const user = await User.findByPk(message.senderId);
          if (user) {
            message.senderName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
          }
        }
      },
      // ✨ Mesaj okunduğunda readAt'i otomatik set et
      beforeUpdate: async (message) => {
        if (message.isRead && !message.readAt) {
          message.readAt = new Date();
        }
      }
    },
    // ✨ Model metodları eklendi
    classMethods: {
      // Konuşma geçmişi getir
      async getConversation(userId1, userId2, limit = 50) {
        const smallerId = Math.min(userId1, userId2);
        const largerId = Math.max(userId1, userId2);
        const conversationId = `${smallerId}-${largerId}`;
        
        return await this.findAll({
          where: { conversationId },
          order: [['createdAt', 'DESC']],
          limit,
          include: [
            { model: sequelize.models.User, as: 'sender', attributes: ['id', 'firstName', 'lastName'] },
            { model: sequelize.models.User, as: 'receiver', attributes: ['id', 'firstName', 'lastName'] }
          ]
        });
      },
      
      // Kullanıcının tüm konuşmalarını getir
      async getUserConversations(userId) {
        const { Op } = require('sequelize');
        
        return await this.findAll({
          where: {
            [Op.or]: [
              { senderId: userId },
              { receiverId: userId }
            ]
          },
          attributes: [
            [sequelize.fn('MAX', sequelize.col('createdAt')), 'lastMessageTime'],
            [sequelize.literal('(SELECT content FROM messages m2 WHERE m2.conversationId = Message.conversationId ORDER BY createdAt DESC LIMIT 1)'), 'lastMessage'],
            'conversationId',
            'senderId',
            'receiverId'
          ],
          group: ['conversationId', 'senderId', 'receiverId'],
          order: [[sequelize.fn('MAX', sequelize.col('createdAt')), 'DESC']],
          raw: true
        });
      }
    }
  });
  
  // ✨ Instance metodları
  Message.prototype.markAsRead = async function() {
    this.isRead = true;
    this.readAt = new Date();
    return await this.save();
  };
  
  return Message;
};