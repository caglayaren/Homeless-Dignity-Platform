// routes/services.js - UPDATED VERSION
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// GET /api/services - Get all services (enhanced with external APIs)
router.get('/', serviceController.getAllServices);

// GET /api/services/nearby - Find nearby services
router.get('/nearby', serviceController.getNearbyServices);

// GET /api/services/location/:lat/:lng - Get services for map-based location selection
router.get('/location/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { radius = 15, type, include_external = 'true' } = req.query;
    
    // Use the nearby services logic
    req.query = { lat, lng, radius, type, include_external };
    return serviceController.getNearbyServices(req, res);
    
  } catch (error) {
    console.error('Location services error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to get services for location'
    });
  }
});

// GET /api/services/:id - Get specific service
router.get('/:id', serviceController.getServiceById);

// POST /api/services - Create new service
router.post('/', serviceController.createService);

// PUT /api/services/:id - Update service
router.put('/:id', serviceController.updateService);

// DELETE /api/services/:id - Delete service
router.delete('/:id', serviceController.deleteService);

module.exports = router;