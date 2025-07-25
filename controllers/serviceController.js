// controllers/serviceController.js - UPDATED VERSION
const { Service } = require('../models');
const { Op, sequelize } = require('sequelize');
const LocationBasedAPIManager = require('../services/locationApiManager');

const apiManager = new LocationBasedAPIManager();

const serviceController = {
  // GET /api/services - Enhanced with external API integration
  getAllServices: async (req, res) => {
    try {
      const { type, homeless_friendly, active, location, lat, lng, include_external } = req.query;
      
      // Build query conditions for database
      let whereClause = {};
      
      // Type filtering
      if (type && type !== 'all') {
        whereClause.type = type;
      }
      
      // Homeless-friendly filtering
      if (homeless_friendly === 'true') {
        whereClause.isHomelessFriendly = true;
      }
      
      // Active status filtering
      if (active !== undefined) {
        whereClause.isActive = (active === 'true');
      }
      
      // Location filter - search in address field
      if (location && location !== 'all' && location !== 'global') {
        whereClause.address = { 
          [Op.iLike]: `%${location}%` 
        };
      }
      
      // Start with database services
      let allServices = [];
      let locationInfo = null;
      
      // Fetch from database
      const dbServices = await Service.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        attributes: {
          include: [
            'availability', // Virtual field
            'capacity'      // Virtual field
          ]
        }
      });
      
      // Add source tag to database services
      const dbServicesWithSource = dbServices.map(service => ({
        ...service.toJSON(),
        source: 'database',
        external: false
      }));
      
      allServices = [...dbServicesWithSource];
      
      // If coordinates provided and external APIs requested, fetch external data
      if (lat && lng && include_external === 'true') {
        try {
          const externalData = await apiManager.fetchExternalServices(
            parseFloat(lat), 
            parseFloat(lng), 
            10 // 10km radius
          );
          
          locationInfo = externalData.location;
          
          // Filter external services by type if specified
          let filteredExternalServices = externalData.services;
          if (type && type !== 'all') {
            filteredExternalServices = filteredExternalServices.filter(service => 
              service.type === type
            );
          }
          
          if (homeless_friendly === 'true') {
            filteredExternalServices = filteredExternalServices.filter(service => 
              service.isHomelessFriendly
            );
          }
          
          allServices = [...allServices, ...filteredExternalServices];
          
        } catch (apiError) {
          console.error('External API error:', apiError.message);
          // Continue with database results only
        }
      }
      
      // Sort combined results - database first, then by distance if coordinates provided
      if (lat && lng) {
        allServices.sort((a, b) => {
          // Database services first
          if (!a.external && b.external) return -1;
          if (a.external && !b.external) return 1;
          
          // Then by distance if both have coordinates
          if (a.latitude && a.longitude && b.latitude && b.longitude) {
            const distA = calculateDistance(lat, lng, a.latitude, a.longitude);
            const distB = calculateDistance(lat, lng, b.latitude, b.longitude);
            return distA - distB;
          }
          
          return 0;
        });
      }
      
      res.json({
        success: true,
        count: allServices.length,
        database_count: dbServicesWithSource.length,
        external_count: allServices.length - dbServicesWithSource.length,
        location: locationInfo,
        data: allServices,
        message: `Services retrieved successfully ${locationInfo ? `for ${locationInfo.city}, ${locationInfo.country}` : ''}`
      });
      
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve services'
      });
    }
  },

  // GET /api/services/:id
  getServiceById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const service = await Service.findByPk(id, {
        attributes: {
          include: ['availability', 'capacity']
        }
      });
      
      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found',
          message: `Service with ID ${id} does not exist`
        });
      }
      
      res.json({
        success: true,
        data: {
          ...service.toJSON(),
          source: 'database',
          external: false
        },
        message: 'Service retrieved successfully'
      });
      
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve service'
      });
    }
  },

  // POST /api/services
  createService: async (req, res) => {
    try {
      const {
        name,
        type,
        description,
        address,
        latitude,
        longitude,
        phone,
        email,
        website,
        hours,
        maxCapacity,
        currentCapacity,
        requirements,
        documentsNeeded,
        amenities,
        isHomelessFriendly,
        wheelchairAccessible,
        acceptsPets
      } = req.body;
      
      // Validation
      if (!name || !type || !address) {
        return res.status(400).json({
          success: false,
          error: 'Name, type, and address are required fields',
          message: 'Validation failed'
        });
      }
      
      // Create service in database
      const newService = await Service.create({
        name,
        type,
        description: description || '',
        address,
        latitude: latitude || null,
        longitude: longitude || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        hours: hours || null,
        maxCapacity: maxCapacity || 0,
        currentCapacity: currentCapacity || 0,
        requirements: requirements || null,
        documentsNeeded: documentsNeeded || null,
        amenities: amenities || null,
        isHomelessFriendly: isHomelessFriendly !== undefined ? isHomelessFriendly : true,
        isActive: true,
        wheelchairAccessible: wheelchairAccessible || false,
        acceptsPets: acceptsPets || false
      });
      
      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: {
          ...newService.toJSON(),
          source: 'database',
          external: false
        }
      });
      
    } catch (error) {
      console.error('Database error:', error);
      res.status(400).json({
        success: false,
        error: error.message,
        message: 'Failed to create service'
      });
    }
  },

  // PUT /api/services/:id
  updateService: async (req, res) => {
    try {
      const { id } = req.params;
      
      const service = await Service.findByPk(id);
      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found',
          message: `Service with ID ${id} does not exist`
        });
      }
      
      // Update service
      await service.update(req.body);
      
      res.json({
        success: true,
        message: 'Service updated successfully',
        data: {
          ...service.toJSON(),
          source: 'database',
          external: false
        }
      });
      
    } catch (error) {
      console.error('Database error:', error);
      res.status(400).json({
        success: false,
        error: error.message,
        message: 'Failed to update service'
      });
    }
  },

  // DELETE /api/services/:id
  deleteService: async (req, res) => {
    try {
      const { id } = req.params;
      
      const service = await Service.findByPk(id);
      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found',
          message: `Service with ID ${id} does not exist`
        });
      }
      
      await service.destroy();
      
      res.json({
        success: true,
        message: 'Service deleted successfully',
        data: service
      });
      
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to delete service'
      });
    }
  },

  // GET /api/services/nearby - Location-based service search
  getNearbyServices: async (req, res) => {
    try {
      const { lat, lng, radius = 10, type, include_external = 'true' } = req.query;
      
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
      
      let allServices = [];
      let locationInfo = null;
      
      // 1. Database services with distance calculation
      let dbWhereClause = {
        isActive: true,
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null }
      };
      
      if (type && type !== 'all') {
        dbWhereClause.type = type;
      }
      
      const dbServices = await Service.findAll({
        where: dbWhereClause,
        attributes: {
          include: [
            'availability',
            'capacity',
            // Calculate distance using Haversine formula
            [
              sequelize.literal(`
                (6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians(${longitude})) + sin(radians(${latitude})) * 
                sin(radians(latitude))))
              `),
              'distance'
            ]
          ]
        },
        having: sequelize.literal(`distance <= ${searchRadius}`),
        order: [[sequelize.literal('distance'), 'ASC']]
      });
      
      // Add source info to database services
      const dbServicesWithSource = dbServices.map(service => ({
        ...service.toJSON(),
        source: 'database',
        external: false
      }));
      
      allServices = [...dbServicesWithSource];
      
      // 2. External API services
      if (include_external === 'true') {
        try {
          const externalData = await apiManager.fetchExternalServices(latitude, longitude, searchRadius);
          locationInfo = externalData.location;
          
          // Filter external services
          let filteredExternalServices = externalData.services;
          if (type && type !== 'all') {
            filteredExternalServices = filteredExternalServices.filter(service => 
              service.type === type
            );
          }
          
          // Calculate distance for external services
          const externalWithDistance = filteredExternalServices.map(service => ({
            ...service,
            distance: service.latitude && service.longitude ? 
              calculateDistance(latitude, longitude, service.latitude, service.longitude) : null
          })).filter(service => 
            service.distance === null || service.distance <= searchRadius
          );
          
          allServices = [...allServices, ...externalWithDistance];
          
        } catch (apiError) {
          console.error('External API error:', apiError.message);
        }
      }
      
      // Sort by distance
      allServices.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
      
      res.json({
        success: true,
        count: allServices.length,
        database_count: dbServicesWithSource.length,
        external_count: allServices.length - dbServicesWithSource.length,
        radius: searchRadius,
        location: locationInfo,
        data: allServices,
        message: `Found ${allServices.length} services within ${searchRadius}km ${locationInfo ? `of ${locationInfo.city}, ${locationInfo.country}` : ''}`
      });
      
    } catch (error) {
      console.error('Nearby services error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to find nearby services'
      });
    }
  }
};

// Helper function to calculate distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = serviceController;