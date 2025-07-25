'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Email kolonu zaten var, sadece mevcut NULL değerleri doldur
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET email = "phoneNumber" || '@temp.com' 
      WHERE email IS NULL AND "phoneNumber" IS NOT NULL
    `);

    // 2. Email kolonunu NOT NULL ve UNIQUE yap
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });

    // 3. phoneNumber'ı optional yap
    await queryInterface.changeColumn('users', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false
    });

    // 4. encryptedPin'i password olarak rename et
    await queryInterface.renameColumn('users', 'encryptedPin', 'password');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('users', 'password', 'encryptedPin');
    await queryInterface.changeColumn('users', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false
    });
  }
};