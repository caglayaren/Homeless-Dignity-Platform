const { User, Service, Document, Message, Appointment } = require('../../models');
const { Op } = require('sequelize');

const adminController = {
  // GET /api/admin/stats - Dashboard statistics
  getStats: async (req, res) => {
    try {
      const [
        totalUsers,
        activeUsers,
        totalServices,
        totalDocuments,
        pendingDocuments,
        totalMessages,
        totalAppointments,
        appliedJobs,
        appliedServices
      ] = await Promise.all([
        User.count(),
        User.count({ where: { isActive: true } }),
        Service.count(),
        Document.count(),
        Document.count({ where: { verified: false } }),
        Message.count(),
        Appointment.count(),
        // Eğer Job modeliniz varsa bu satırları aktif edin:
        // Job.count({ where: { status: 'applied' } }),
        // ServiceApplication.count(),
        0, // Geçici olarak 0 verdim, Job modeliniz varsa değiştirin
        0  // Geçici olarak 0 verdim, ServiceApplication modeliniz varsa değiştirin
      ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          totalServices,
          totalJobs: 0, // Job modeliniz varsa güncelleyin
          totalDocuments,
          pendingDocuments,
          totalMessages,
          totalAppointments,
          appliedJobs,
          appliedServices
        }
      });
    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics',
        error: error.message
      });
    }
  },

  // GET /api/admin/users - Get all users
  getUsers: async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const users = await User.findAndCountAll({
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.json({
        success: true,
        data: users.rows,
        pagination: {
          total: users.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(users.count / limit)
        }
      });
    } catch (error) {
      console.error('Admin get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users',
        error: error.message
      });
    }
  },

  // PUT /api/admin/users/:id/status - Update user status
  updateUserStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update({ 
        isActive,
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: user
      });
    } catch (error) {
      console.error('Admin update user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status',
        error: error.message
      });
    }
  },

  // GET /api/admin/services - Get all services
  getServices: async (req, res) => {
    try {
      const services = await Service.findAll({
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: services
      });
    } catch (error) {
      console.error('Admin get services error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get services',
        error: error.message
      });
    }
  },

  // POST /api/admin/services - Create new service
  createService: async (req, res) => {
    try {
      const { name, description, address, latitude, longitude, type, contactPhone, contactEmail } = req.body;

      if (!name || !description || !address) {
        return res.status(400).json({
          success: false,
          message: 'Name, description, and address are required'
        });
      }

      const service = await Service.create({
        name,
        description,
        address,
        latitude: latitude || null,
        longitude: longitude || null,
        type: type || 'other',
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null
      });

      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: service
      });
    } catch (error) {
      console.error('Admin create service error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create service',
        error: error.message
      });
    }
  },

  // PUT /api/admin/services/:id - Update service
  updateService: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const service = await Service.findByPk(id);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      await service.update(updates);

      res.json({
        success: true,
        message: 'Service updated successfully',
        data: service
      });
    } catch (error) {
      console.error('Admin update service error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update service',
        error: error.message
      });
    }
  },

  // GET /api/admin/documents - Get all documents for review
  getDocuments: async (req, res) => {
    try {
      const { verified = null } = req.query;
      
      const whereClause = {};
      if (verified !== null) {
        whereClause.verified = verified === 'true';
      }

      const documents = await Document.findAll({
        where: whereClause,
        include: [{
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
          as: 'user'
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      console.error('Admin get documents error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get documents',
        error: error.message
      });
    }
  },

  // PUT /api/admin/documents/:id/verify - Verify document
  verifyDocument: async (req, res) => {
    try {
      const { id } = req.params;
      const { verified } = req.body;

      const document = await Document.findByPk(id, {
        include: [{
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
          as: 'user'
        }]
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      await document.update({
        verified: verified,
        verifiedAt: verified ? new Date() : null
      });

      res.json({
        success: true,
        message: `Document ${verified ? 'verified' : 'unverified'} successfully`,
        data: document
      });
    } catch (error) {
      console.error('Admin verify document error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify document',
        error: error.message
      });
    }
  },

  // GET /api/admin/appointments - Get all appointments
  getAppointments: async (req, res) => {
    try {
      const appointments = await Appointment.findAll({
        include: [{
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
          as: 'user'
        }],
        order: [['date', 'ASC'], ['time', 'ASC']]
      });

      res.json({
        success: true,
        data: appointments
      });
    } catch (error) {
      console.error('Admin get appointments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get appointments',
        error: error.message
      });
    }
  },

  // GET /api/admin/applied-jobs - Get job applications (eğer Job modeliniz varsa)
  getAppliedJobs: async (req, res) => {
    try {
      // Job modeliniz yoksa boş array döndürün
      const appliedJobs = [];
      
      /* Eğer Job ve JobApplication modelleriniz varsa bu kodu kullanın:
      const appliedJobs = await JobApplication.findAll({
        include: [
          {
            model: Job,
            attributes: ['id', 'title', 'company', 'location', 'type'],
            as: 'job'
          },
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'email'],
            as: 'user'
          }
        ],
        order: [['appliedAt', 'DESC']]
      });
      */

      res.json({
        success: true,
        data: appliedJobs
      });
    } catch (error) {
      console.error('Admin get applied jobs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get applied jobs',
        error: error.message
      });
    }
  },

  // GET /api/admin/applied-services - Get service applications
  getAppliedServices: async (req, res) => {
    try {
      // ServiceApplication modeliniz yoksa boş array döndürün
      const appliedServices = [];

      /* Eğer ServiceApplication modeliniz varsa bu kodu kullanın:
      const appliedServices = await ServiceApplication.findAll({
        include: [
          {
            model: Service,
            attributes: ['id', 'name', 'type', 'address'],
            as: 'service'
          },
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'email'],
            as: 'user'
          }
        ],
        order: [['appliedAt', 'DESC']]
      });
      */

      res.json({
        success: true,
        data: appliedServices
      });
    } catch (error) {
      console.error('Admin get applied services error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get applied services',
        error: error.message
      });
    }
  },

  // GET /api/admin/recent-activity - Get recent activities
  getRecentActivity: async (req, res) => {
    try {
      const limit = 10;

      // Get recent users (last 5)
      const recentUsers = await User.findAll({
        attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 5
      });

      // Get recent documents (last 5)
      const recentDocuments = await Document.findAll({
        attributes: ['id', 'name', 'type', 'createdAt'],
        include: [{
          model: User,
          attributes: ['firstName', 'lastName', 'phoneNumber'],
          as: 'user'
        }],
        order: [['createdAt', 'DESC']],
        limit: 5
      });

      // Get recent appointments (last 3)
      const recentAppointments = await Appointment.findAll({
        attributes: ['id', 'type', 'date', 'time', 'createdAt'],
        include: [{
          model: User,
          attributes: ['firstName', 'lastName', 'phoneNumber'],
          as: 'user'
        }],
        order: [['createdAt', 'DESC']],
        limit: 3
      });

      // Format activities
      const activities = [];

      recentUsers.forEach(user => {
        activities.push({
          type: 'user_registered',
          message: `New user registration`,
          phone: user.phoneNumber,
          timestamp: user.createdAt,
          icon: '👤'
        });
      });

      recentDocuments.forEach(doc => {
        activities.push({
          type: 'document_uploaded',
          message: `Document uploaded for verification`,
          phone: doc.user ? doc.user.phoneNumber : null,
          timestamp: doc.createdAt,
          icon: '📄'
        });
      });

      recentAppointments.forEach(appointment => {
        activities.push({
          type: 'appointment_created',
          message: `New appointment scheduled`,
          phone: appointment.user ? appointment.user.phoneNumber : null,
          timestamp: appointment.createdAt,
          icon: '📅'
        });
      });

      // Sort by timestamp and limit
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const limitedActivities = activities.slice(0, limit);

      res.json({
        success: true,
        data: limitedActivities
      });
    } catch (error) {
      console.error('Admin recent activity error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recent activity',
        error: error.message
      });
    }
  }
};

module.exports = adminController;