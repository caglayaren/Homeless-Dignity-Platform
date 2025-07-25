'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. conversationId field'ı ekle (user-to-user konuşmalar için)
    await queryInterface.addColumn('messages', 'conversationId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Format: smaller_user_id-larger_user_id (örn: 1-5)'
    });

    // 2. parentMessageId field'ı ekle (reply mesajları için)
    await queryInterface.addColumn('messages', 'parentMessageId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'messages',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // 3. metadata field'ı ekle (konum, extra bilgiler için)
    await queryInterface.addColumn('messages', 'metadata', {
      type: Sequelize.JSON,
      allowNull: true
    });

    // 4. messageType enum'una 'location' eklemeye çalış (hata olursa devam et)
    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_messages_messageType" ADD VALUE IF NOT EXISTS 'location';
      `);
    } catch (error) {
      console.log('Location messageType already exists or could not be added:', error.message);
    }

    // 5. Performance için index'ler ekle
    await queryInterface.addIndex('messages', ['senderId', 'receiverId'], {
      name: 'messages_sender_receiver_idx'
    });

    await queryInterface.addIndex('messages', ['conversationId', 'createdAt'], {
      name: 'messages_conversation_time_idx'
    });

    await queryInterface.addIndex('messages', ['isRead'], {
      name: 'messages_read_status_idx'
    });

    // 6. Mevcut user-to-user mesajları için conversationId'leri otomatik oluştur
    await queryInterface.sequelize.query(`
      UPDATE messages 
      SET "conversationId" = CASE 
        WHEN "senderId" < "receiverId" THEN CONCAT("senderId", '-', "receiverId")
        WHEN "senderId" > "receiverId" THEN CONCAT("receiverId", '-', "senderId")
        ELSE NULL
      END
      WHERE "senderId" IS NOT NULL 
        AND "receiverId" IS NOT NULL 
        AND "caseWorkerId" IS NULL
        AND "conversationId" IS NULL;
    `);

    console.log('✅ User messaging fields added successfully!');
  },

  async down(queryInterface, Sequelize) {
    // Index'leri kaldır
    try {
      await queryInterface.removeIndex('messages', 'messages_sender_receiver_idx');
      await queryInterface.removeIndex('messages', 'messages_conversation_time_idx');  
      await queryInterface.removeIndex('messages', 'messages_read_status_idx');
    } catch (error) {
      console.log('Some indexes may not exist:', error.message);
    }

    // Column'ları kaldır
    await queryInterface.removeColumn('messages', 'conversationId');
    await queryInterface.removeColumn('messages', 'parentMessageId');
    await queryInterface.removeColumn('messages', 'metadata');

    // messageType enum'undan 'location'u kaldırma (PostgreSQL'de zor olduğu için atlıyoruz)
    console.log('✅ User messaging fields removed successfully!');
  }
};