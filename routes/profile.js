const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const authMiddleware = require('../middleware/auth'); // JWT middleware

// GET /api/profile - Kullanıcının kendi profil bilgilerini getir
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // Senin middleware'in userId döndürüyor
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['encryptedPin'] } // Şifreyi döndürme
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        emergencyContact: user.emergencyContact,
        caseWorkerName: user.caseWorkerName,
        createdAt: user.createdAt
      },
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/profile - Profil bilgilerini güncelle
router.put('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // Senin middleware'in userId döndürüyor
    const { 
      currentFirstName, 
      currentLastName, 
      newFirstName, 
      newLastName, 
      currentPhone, 
      newPhone 
    } = req.body;

    // Validation
    if (!currentFirstName || !currentLastName || !newFirstName || !newLastName) {
      return res.status(400).json({
        success: false,
        message: 'All name fields are required'
      });
    }

    if (!currentPhone || !newPhone) {
      return res.status(400).json({
        success: false,
        message: 'Current and new phone numbers are required'
      });
    }

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Mevcut bilgileri doğrula - Sadece firstName ve lastName'i kontrol et
    if (user.firstName.toLowerCase().trim() !== currentFirstName.toLowerCase().trim() || 
        user.lastName.toLowerCase().trim() !== currentLastName.toLowerCase().trim()) {
      return res.status(400).json({
        success: false,
        message: `Current name does not match. DB: "${user.firstName}" + "${user.lastName}", Input: "${currentFirstName}" + "${currentLastName}"`
      });
    }

    // Telefon numarasını normalize et - Esnek format desteği
    const normalizePhone = (phone) => {
      if (!phone) return '';
      
      let cleaned = phone.replace(/[\s\-\(\)]/g, ''); // Boşluk, tire, parantez temizle
      
      // Farklı formatları normalize et
      if (cleaned.startsWith('+90')) {
        return cleaned; // +905xxxxxxxxx -> aynı
      }
      if (cleaned.startsWith('90') && cleaned.length === 12) {
        return '+' + cleaned; // 905xxxxxxxxx -> +905xxxxxxxxx
      }
      if (cleaned.startsWith('0') && cleaned.length === 11) {
        return '+90' + cleaned.substring(1); // 05xxxxxxxxx -> +905xxxxxxxxx
      }
      if (cleaned.startsWith('5') && cleaned.length === 10) {
        return '+90' + cleaned; // 5xxxxxxxxx -> +905xxxxxxxxx
      }
      
      return cleaned; // Diğer durumlarda olduğu gibi bırak
    };

    const currentPhoneNormalized = normalizePhone(currentPhone);
    const userPhoneNormalized = normalizePhone(user.phoneNumber);

    // Esnek karşılaştırma - normalize edilmiş hallerini karşılaştır
    if (userPhoneNormalized !== currentPhoneNormalized) {
      return res.status(400).json({
        success: false,
        message: `Phone mismatch. Try: "${user.phoneNumber}" or "${user.phoneNumber.replace('+90', '0')}" or "${user.phoneNumber.replace('+90', '')}"`
      });
    }

    // Yeni telefon numarasının başka kullanıcıda olup olmadığını kontrol et
    const existingUser = await User.findOne({
      where: { phoneNumber: newPhone },
      attributes: ['id']
    });

    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered to another user'
      });
    }

    // Profili güncelle - Yeni telefonu normalize et
    const newPhoneNormalized = normalizePhone(newPhone);
    
    await user.update({
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      phoneNumber: newPhoneNormalized
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber
      },
      message: 'Profile updated successfully. Please log in again.'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/profile/change-password - Şifre değiştir
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // Senin middleware'in userId döndürüyor
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Mevcut şifreyi doğrula
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.encryptedPin);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Yeni şifreyi hash'le
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Şifreyi güncelle
    await user.update({
      encryptedPin: hashedNewPassword
    });

    res.json({
      success: true,
      data: {
        userId: user.id
      },
      message: 'Password changed successfully. Please log in again.'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/profile/delete-account - Hesabı sil
router.delete('/delete-account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // Senin middleware'in userId döndürüyor

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Kullanıcı bilgilerini backup için logla (opsiyonel)
    console.log(`Account deletion requested for user: ${user.firstName} ${user.lastName} (ID: ${user.id})`);

    // Hesabı sil
    await user.destroy();

    res.json({
      success: true,
      data: {
        deletedUserId: userId,
        deletedAt: new Date().toISOString()
      },
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;