const express = require('express');
const router = express.Router();
const { Document } = require('../models');

// GET /api/documents - Dokümanları listele (Database integrated)
router.get('/', async (req, res) => {
  try {
    const { userId, type, verified } = req.query;
    
    let whereClause = {};
    
    if (userId) {
      whereClause.userId = parseInt(userId);
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (verified !== undefined) {
      whereClause.verified = (verified === 'true');
    }

    const documents = await Document.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/documents/:id - Belirli bir dokümanı getir (Database integrated)
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/documents - Yeni doküman yükle (Database integrated)
router.post('/', async (req, res) => {
  try {
    const { userId, name, type, originalName, fileSize, mimeType, filePath, cloudinaryUrl, cloudinaryPublicId } = req.body;
    
    // Validation
    if (!userId || !name || !type || !originalName || !fileSize || !mimeType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'UserId, name, type, originalName, fileSize, and mimeType are required'
      });
    }

    const newDocument = await Document.create({
      userId,
      name,
      type,
      originalName,
      fileSize,
      mimeType,
      filePath: filePath || '',
      cloudinaryUrl: cloudinaryUrl || '',
      cloudinaryPublicId: cloudinaryPublicId || '',
      verified: false,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: newDocument
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/documents/:id - Dokümanı güncelle (Database integrated)
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;

    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        message: `Document with ID ${id} does not exist`
      });
    }

    await document.update(updates);

    res.json({
      success: true,
      data: document,
      message: 'Document updated successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/documents/:id - Doküman sil (Database integrated)
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        message: `Document with ID ${id} does not exist`
      });
    }

    await document.destroy();

    res.json({
      success: true,
      data: document,
      message: 'Document deleted successfully'
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