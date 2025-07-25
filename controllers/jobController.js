// controllers/jobController.js
const { Job } = require('../models');
const { Op } = require('sequelize');
const LocationBasedAPIManager = require('../services/locationApiManager');

const apiManager = new LocationBasedAPIManager();

const jobController = {
  // GET /api/jobs - Enhanced with external API integration
  getAllJobs: async (req, res) => {
    try {
      const { type, homeless_friendly, active, location, lat, lng, include_external } = req.query;
      
      // Build query conditions for database
      let whereClause = {};
      
      if (type && type !== 'all') {
        whereClause.type = type;
      }
      
      if (homeless_friendly === 'true') {
        whereClause.isHomelessFriendly = true;
      }
      
      if (active !== undefined) {
        whereClause.isActive = (active === 'true');
      }
      
      // Location filter - search in location field
      if (location && location !== 'all' && location !== 'global') {
        whereClause.location = { 
          [Op.iLike]: `%${location}%` 
        };
      }
      
      // Start with database jobs
      let allJobs = [];
      let locationInfo = null;
      
      // Fetch from database
      const dbJobs = await Job.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
      });
      
      // Add source tag to database jobs
      const dbJobsWithSource = dbJobs.map(job => ({
        ...job.toJSON(),
        source: 'database',
        external: false
      }));
      
      allJobs = [...dbJobsWithSource];
      
      // If coordinates provided and external APIs requested, fetch external data
      if (lat && lng && include_external === 'true') {
        try {
          const externalData = await apiManager.fetchExternalJobs(
            parseFloat(lat), 
            parseFloat(lng), 
            25 // 25km radius for jobs
          );
          
          locationInfo = externalData.location;
          
          // Filter external jobs by type if specified
          let filteredExternalJobs = externalData.jobs;
          if (type && type !== 'all') {
            filteredExternalJobs = filteredExternalJobs.filter(job => 
              job.type === type
            );
          }
          
          if (homeless_friendly === 'true') {
            filteredExternalJobs = filteredExternalJobs.filter(job => 
              job.isHomelessFriendly
            );
          }
          
          allJobs = [...allJobs, ...filteredExternalJobs];
          
        } catch (apiError) {
          console.error('External API error:', apiError.message);
          // Continue with database results only
        }
      }
      
      // Sort combined results - database first, then by date
      allJobs.sort((a, b) => {
        // Database jobs first
        if (!a.external && b.external) return -1;
        if (a.external && !b.external) return 1;
        
        // Then by posting date (newest first)
        return new Date(b.postedDate || b.createdAt) - new Date(a.postedDate || a.createdAt);
      });
      
      res.json({
        success: true,
        count: allJobs.length,
        database_count: dbJobsWithSource.length,
        external_count: allJobs.length - dbJobsWithSource.length,
        location: locationInfo,
        data: allJobs,
        message: `Jobs retrieved successfully ${locationInfo ? `for ${locationInfo.city}, ${locationInfo.country}` : ''}`
      });
      
    } catch (error) {
      console.error('Job retrieval error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve jobs'
      });
    }
  },

  // GET /api/jobs/:id
  getJobById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const job = await Job.findByPk(id);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found',
          message: `Job with ID ${id} does not exist`
        });
      }
      
      res.json({
        success: true,
        data: {
          ...job.toJSON(),
          source: 'database',
          external: false
        },
        message: 'Job retrieved successfully'
      });
      
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve job'
      });
    }
  },

  // POST /api/jobs
  createJob: async (req, res) => {
    try {
      const { 
        title, company, type, salary, location, description, 
        requirements, benefits, contactPhone, contactEmail, 
        applicationUrl, isHomelessFriendly 
      } = req.body;
      
      if (!title || !company || !type || !salary || !location) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Title, company, type, salary, and location are required'
        });
      }
      
      const newJob = await Job.create({
        title,
        company,
        type,
        salary,
        location,
        description: description || '',
        requirements: requirements || [],
        benefits: benefits || [],
        contactPhone: contactPhone || '',
        contactEmail: contactEmail || '',
        applicationUrl: applicationUrl || '',
        isHomelessFriendly: isHomelessFriendly || false,
        isActive: true,
        postedDate: new Date()
      });
      
      res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: {
          ...newJob.toJSON(),
          source: 'database',
          external: false
        }
      });
      
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to create job'
      });
    }
  },

  // PUT /api/jobs/:id
  updateJob: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const job = await Job.findByPk(id);
      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found',
          message: `Job with ID ${id} does not exist`
        });
      }
      
      await job.update(updates);
      
      res.json({
        success: true,
        message: 'Job updated successfully',
        data: {
          ...job.toJSON(),
          source: 'database',
          external: false
        }
      });
      
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to update job'
      });
    }
  },

  // DELETE /api/jobs/:id
  deleteJob: async (req, res) => {
    try {
      const { id } = req.params;
      
      const job = await Job.findByPk(id);
      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found',
          message: `Job with ID ${id} does not exist`
        });
      }
      
      await job.destroy();
      
      res.json({
        success: true,
        message: 'Job deleted successfully',
        data: job
      });
      
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to delete job'
      });
    }
  }
};

module.exports = jobController;