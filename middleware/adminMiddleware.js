const jwt = require('jsonwebtoken');
const { User } = require('../models');

const adminMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive.'
      });
    }

    // Admin telefon numaralarını farklı formatlarda tanımla
    const adminPhoneNumbers = [
      '05428881755', // Ana admin numarası
      '+905428881755', // Uluslararası format
      '5428881755', // 0 olmadan format
      '90 542 888 1755', // Boşluklu format
      '90 (542) 888-1755' // Parantezli format
    ];

    // Telefon numarası karşılaştırması - daha kapsamlı
    const normalizePhone = (phone) => {
      return phone.toString()
        .replace(/\s/g, '') // Boşlukları kaldır
        .replace(/\(/g, '') // Parantezleri kaldır
        .replace(/\)/g, '') // Parantezleri kaldır
        .replace(/-/g, '') // Tire işaretlerini kaldır
        .replace(/\+/g, '') // + işaretini kaldır
        .replace(/^90/, '') // Başta 90 varsa kaldır
        .replace(/^0/, ''); // Başta 0 varsa kaldır
    };

    const userNormalizedPhone = normalizePhone(user.phoneNumber);
    const isAdminPhone = adminPhoneNumbers.some(adminPhone => {
      const normalizedAdminPhone = normalizePhone(adminPhone);
      return normalizedAdminPhone === userNormalizedPhone;
    });

    if (!isAdminPhone) {
      console.log(`❌ Admin access denied for ${user.phoneNumber}`);
      console.log(`🔍 Normalized user phone: ${userNormalizedPhone}`);
      console.log(`📋 Admin phones: ${adminPhoneNumbers.map(p => normalizePhone(p)).join(', ')}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Add user info to request object
    req.user = {
      userId: user.id,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: true
    };

    console.log(`✅ Admin access granted for ${user.phoneNumber}`);
    next();

  } catch (error) {
    console.error('Admin middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

module.exports = adminMiddleware;