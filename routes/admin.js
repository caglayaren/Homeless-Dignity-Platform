const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');

// All admin routes require admin authentication
router.use(adminMiddleware);

// GET /api/admin - Admin API info
router.get('/', (req, res) => {
  res.json({
    service: 'Admin API',
    version: '1.0.0',
    status: 'active',
    description: 'Admin management endpoints for Homeless Services Platform',
    endpoints: {
      'GET /api/admin/stats': {
        description: 'Get dashboard statistics',
        returns: 'User counts, service counts, document counts, etc.'
      },
      'GET /api/admin/users': {
        description: 'Get all users with pagination',
        parameters: ['page', 'limit'],
        returns: 'List of users with pagination info'
      },
      'PUT /api/admin/users/:id/status': {
        description: 'Update user active/inactive status',
        parameters: ['id'],
        requires: ['isActive (boolean)'],
        returns: 'Updated user object'
      },
      'GET /api/admin/services': {
        description: 'Get all services',
        returns: 'List of all services'
      },
      'POST /api/admin/services': {
        description: 'Create new service',
        requires: ['name', 'description', 'address'],
        optional: ['latitude', 'longitude', 'type', 'contactPhone', 'contactEmail']
      },
      'PUT /api/admin/services/:id': {
        description: 'Update existing service',
        parameters: ['id']
      },
      'GET /api/admin/documents': {
        description: 'Get documents for review',
        parameters: ['verified (optional)'],
        returns: 'List of documents with user info'
      },
      'PUT /api/admin/documents/:id/verify': {
        description: 'Verify/unverify document',
        requires: ['verified (boolean)']
      },
      'GET /api/admin/appointments': {
        description: 'Get all appointments',
        returns: 'List of appointments with user info'
      },
      'GET /api/admin/applied-jobs': {
        description: 'Get all job applications',
        returns: 'List of job applications with job and user info'
      },
      'GET /api/admin/applied-services': {
        description: 'Get all service applications',
        returns: 'List of service applications with service and user info'
      },
      'GET /api/admin/recent-activity': {
        description: 'Get recent platform activities',
        returns: 'List of recent user registrations, document uploads, etc.'
      }
    },
    authentication: {
      type: 'JWT Bearer Token + Admin Phone Number Check',
      admin_phones: ['05428881755'], // Kendi telefon numaranızı buraya yazın
      login_endpoint: 'POST /api/auth/admin-login',
      header_format: 'Authorization: Bearer <token>',
      note: 'Use admin-login endpoint with phone number and password to get token'
    }
  });
});

// Dashboard Statistics
router.get('/stats', adminController.getStats);

// User Management
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

// Service Management
router.get('/services', adminController.getServices);
router.post('/services', adminController.createService);
router.put('/services/:id', adminController.updateService);

// Document Management
router.get('/documents', adminController.getDocuments);
router.put('/documents/:id/verify', adminController.verifyDocument);

// Appointment Management
router.get('/appointments', adminController.getAppointments);

// Job Applications Management
router.get('/applied-jobs', adminController.getAppliedJobs);

// Service Applications Management
router.get('/applied-services', adminController.getAppliedServices);

// Recent Activity
router.get('/recent-activity', adminController.getRecentActivity);

module.exports = router;