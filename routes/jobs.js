// routes/jobs.js - UPDATED VERSION
const express = require('express');
const router = express.Router();
const { Job } = require('../models');
const { Op } = require('sequelize');
const LocationBasedAPIManager = require('../services/locationApiManager');

const apiManager = new LocationBasedAPIManager();

// GET /api/jobs - Enhanced with external API integration
router.get('/', async (req, res) => {
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
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/jobs/nearby - Location-based job search with external APIs
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 25, type, include_external = 'true' } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
        message: 'Location parameters missing'
      });
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseInt(radius);
    
    let allJobs = [];
    let locationInfo = null;
    
    // 1. Database jobs (filter by location string matching)
    let dbWhereClause = {
      isActive: true
    };
    
    if (type && type !== 'all') {
      dbWhereClause.type = type;
    }
    
    const dbJobs = await Job.findAll({
      where: dbWhereClause,
      order: [['createdAt', 'DESC']]
    });
    
    // Add source info to database jobs
    const dbJobsWithSource = dbJobs.map(job => ({
      ...job.toJSON(),
      source: 'database',
      external: false,
      distance: null // Database jobs don't have precise coordinates
    }));
    
    allJobs = [...dbJobsWithSource];
    
    // 2. External API jobs
    if (include_external === 'true') {
      try {
        const externalData = await apiManager.fetchExternalJobs(latitude, longitude, searchRadius);
        locationInfo = externalData.location;
        
        // Filter external jobs
        let filteredExternalJobs = externalData.jobs;
        if (type && type !== 'all') {
          filteredExternalJobs = filteredExternalJobs.filter(job => 
            job.type === type
          );
        }
        
        allJobs = [...allJobs, ...filteredExternalJobs];
        
      } catch (apiError) {
        console.error('External API error:', apiError.message);
      }
    }
    
    // Sort by relevance (database jobs first, then external)
    allJobs.sort((a, b) => {
      // Database jobs first
      if (!a.external && b.external) return -1;
      if (a.external && !b.external) return 1;
      
      // Then by posting date
      return new Date(b.postedDate || b.createdAt) - new Date(a.postedDate || a.createdAt);
    });
    
    res.json({
      success: true,
      count: allJobs.length,
      database_count: dbJobsWithSource.length,
      external_count: allJobs.length - dbJobsWithSource.length,
      radius: searchRadius,
      location: locationInfo,
      data: allJobs,
      message: `Found ${allJobs.length} jobs within ${searchRadius}km ${locationInfo ? `of ${locationInfo.city}, ${locationInfo.country}` : ''}`
    });
    
  } catch (error) {
    console.error('Nearby jobs error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to find nearby jobs'
    });
  }
});

// GET /api/jobs/location/:lat/:lng - New endpoint for map-based selection
router.get('/location/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { radius = 25, type, include_external = 'true' } = req.query;
    
    // Use the nearby jobs logic
    req.query = { lat, lng, radius, type, include_external };
    
    // Call nearby endpoint logic
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseInt(radius);
    
    let allJobs = [];
    let locationInfo = null;
    
    // Database jobs
    let dbWhereClause = { isActive: true };
    if (type && type !== 'all') {
      dbWhereClause.type = type;
    }
    
    const dbJobs = await Job.findAll({
      where: dbWhereClause,
      order: [['createdAt', 'DESC']]
    });
    
    const dbJobsWithSource = dbJobs.map(job => ({
      ...job.toJSON(),
      source: 'database',
      external: false
    }));
    
    allJobs = [...dbJobsWithSource];
    
    // External API jobs
    if (include_external === 'true') {
      try {
        const externalData = await apiManager.fetchExternalJobs(latitude, longitude, searchRadius);
        locationInfo = externalData.location;
        
        let filteredExternalJobs = externalData.jobs;
        if (type && type !== 'all') {
          filteredExternalJobs = filteredExternalJobs.filter(job => job.type === type);
        }
        
        allJobs = [...allJobs, ...filteredExternalJobs];
      } catch (apiError) {
        console.error('External API error:', apiError.message);
      }
    }
    
    res.json({
      success: true,
      count: allJobs.length,
      database_count: dbJobsWithSource.length,
      external_count: allJobs.length - dbJobsWithSource.length,
      location: locationInfo,
      data: allJobs,
      message: `Jobs found for location ${locationInfo ? `${locationInfo.city}, ${locationInfo.country}` : 'selected'}`
    });
    
  } catch (error) {
    console.error('Location jobs error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to get jobs for location'
    });
  }
});

// GET /api/jobs/:id - Get specific job
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
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
      error: error.message
    });
  }
});

// POST /api/jobs - Create new job
router.post('/', async (req, res) => {
  try {
    const { title, company, type, salary, location, description, requirements, isHomelessFriendly, contactPhone, contactEmail, applicationUrl } = req.body;
    
    // Validation
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
      benefits: req.body.benefits || [],
      isHomelessFriendly: isHomelessFriendly || false,
      contactPhone: contactPhone || '',
      contactEmail: contactEmail || '',
      applicationUrl: applicationUrl || '',
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
      error: error.message
    });
  }
});

// PUT /api/jobs/:id - Update job
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
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
      data: {
        ...job.toJSON(),
        source: 'database',
        external: false
      },
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

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
      data: job,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;