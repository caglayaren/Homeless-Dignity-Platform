const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/authController');
const authMiddleware = require('../middleware/auth');

// GET /api/auth - Auth API bilgileri (UPDATED)
router.get('/', (req, res) => {
  res.json({
    service: 'Homeless Services Auth API',
    version: '3.1.0',
    status: 'active',
    description: 'Phone number-based authentication system for homeless services',
    endpoints: {
      'POST /api/auth/register': {
        description: 'Register new user with phone number',
        requires: ['firstName', 'lastName', 'birthDate', 'location', 'phoneNumber', 'password', 'confirmPassword'],
        returns: 'JWT token and user data',
        validation: {
          phoneNumber: 'Valid Turkish phone number format (+905xxxxxxxxx, 05xxxxxxxxx, or 5xxxxxxxxx)',
          password: 'Minimum 6 characters',
          confirmPassword: 'Must match password'
        }
      },
      'POST /api/auth/login': {
        description: 'Login with phone number and password',
        requires: ['phoneNumber', 'password'],
        returns: 'JWT token and user data'
      },
      'POST /api/auth/login1': { // ✨ YENİ ENDPOINT EKLENDİ
        description: 'Alternative login endpoint (same as /login)',
        requires: ['phoneNumber', 'password'],
        returns: 'JWT token and user data',
        note: 'Frontend compatibility endpoint'
      },
      'POST /api/auth/admin-login': {
        description: 'Admin login with authorized phone number and password',
        requires: ['phoneNumber', 'password'],
        returns: 'JWT token and admin user data',
        notes: 'Only authorized admin phone numbers can access this endpoint',
        admin_phones: ['+905531461755'] // Kendi telefon numaranızı buraya yazın
      },
      'POST /api/auth/change-password': {
        description: 'Change user password',
        requires: ['currentPassword', 'newPassword'],
        returns: 'Success message',
        auth_required: true
      },
      'GET /api/auth/profile': {
        description: 'Get user profile',
        requires: 'JWT token in Authorization header',
        returns: 'Complete user profile'
      },
      'GET /api/auth/me': { // ✨ YENİ ENDPOINT EKLENDİ
        description: 'Get current authenticated user (JWT verification)',
        requires: 'JWT token in Authorization header',
        returns: 'Current user data',
        note: 'Used by frontend auth system'
      },
      'POST /api/auth/logout': {
        description: 'Logout user',
        requires: 'JWT token in Authorization header',
        returns: 'Success message'
      }
    },
    authentication: {
      type: 'JWT Bearer Token',
      header_format: 'Authorization: Bearer <token>',
      token_expiry: '7 days',
      admin_access: 'Admin endpoints require admin phone number verification'
    },
    phone_number_requirements: {
      format: 'Turkish phone numbers only',
      accepted_formats: ['+905xxxxxxxxx', '05xxxxxxxxx', '5xxxxxxxxx'],
      normalized_format: '+905xxxxxxxxx'
    },
    password_requirements: {
      min_length: 6,
      hashing: 'bcryptjs with salt rounds: 10'
    },
    example_usage: {
      register: {
        method: 'POST',
        url: '/api/auth/register',
        body: {
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          birthDate: '1990-05-15',
          location: 'İstanbul, Türkiye',
          phoneNumber: '05551234567',
          password: 'mypassword123',
          confirmPassword: 'mypassword123'
        }
      },
      login: {
        method: 'POST',
        url: '/api/auth/login',
        body: {
          phoneNumber: '05551234567',
          password: 'mypassword123'
        }
      },
      login1: { // ✨ YENİ ÖRNEK EKLENDİ
        method: 'POST',
        url: '/api/auth/login1',
        body: {
          phoneNumber: '05551234567',
          password: 'mypassword123'
        },
        note: 'Same as /login, alternative endpoint for frontend compatibility'
      },
      admin_login: {
        method: 'POST',
        url: '/api/auth/admin-login',
        body: {
          phoneNumber: '05428881755', // Admin telefon numarası
          password: 'admin.password'
        },
        note: 'Only authorized admin phone numbers can use this endpoint'
      },
      change_password: {
        method: 'POST',
        url: '/api/auth/change-password',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        body: {
          currentPassword: 'mypassword123',
          newPassword: 'mynewpassword456'
        }
      },
      protected_request: {
        method: 'GET',
        url: '/api/auth/profile',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    },
    development_notes: {
      database: 'PostgreSQL with Sequelize ORM',
      password_hashing: 'bcryptjs with salt rounds: 10',
      phone_validation: 'Server-side validation with regex for Turkish numbers',
      security: 'JWT tokens, password hashing, input validation',
      phone_normalization: 'All phone numbers stored as +905xxxxxxxxx format',
      admin_system: 'Phone number-based admin authentication'
    }
  });
});

// Public routes (no authentication required)
// POST /api/auth/register - Register new user with phone number
router.post('/register', authController.register);

// POST /api/auth/login - Login with phone number and password
router.post('/login', authController.login);

// POST /api/auth/login1 - Alternative login endpoint (frontend compatibility)
router.post('/login1', authController.login); // ✨ YENİ ENDPOINT EKLENDİ

// POST /api/auth/admin-login - Admin login with authorized phone number
router.post('/admin-login', authController.adminLogin);

// Protected routes (authentication required)
// GET /api/auth/profile - Get current user profile
router.get('/profile', authMiddleware, authController.getProfile);

// GET /api/auth/me - Get current authenticated user (JWT verification)
router.get('/me', authMiddleware, authController.getProfile); // ✨ YENİ ENDPOINT EKLENDİ

// POST /api/auth/change-password - Change user password
router.post('/change-password', authMiddleware, authController.changePassword);

// POST /api/auth/logout - Logout user
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;