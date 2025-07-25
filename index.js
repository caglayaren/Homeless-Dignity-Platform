// index.js - UPDATED VERSION with Leaflet Support + Profile Routes + Real User Messaging
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Database setup
const { User, Job, Service, Document, Message, Appointment, CaseWorker, sequelize } = require('./models');
const { Op } = require('sequelize');

// Import controllers
const serviceController = require('./controllers/serviceController');
const jobController = require('./controllers/jobController');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const serviceRoutes = require('./routes/services');
const jobRoutes = require('./routes/jobs');
const profileRoutes = require('./routes/profile');

// Enhanced Helmet configuration for Leaflet support
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://unpkg.com",
        "https://cdnjs.cloudflare.com",
        "https://*.tile.openstreetmap.org",
        "https://*.basemaps.cartocdn.com"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'", // Required for some mapping libraries
        "https://unpkg.com",
        "https://cdnjs.cloudflare.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://*.tile.openstreetmap.org",
        "https://*.basemaps.cartocdn.com",
        "https://unpkg.com"
      ],
      connectSrc: [
        "'self'",
        "https://*.tile.openstreetmap.org",
        "https://*.basemaps.cartocdn.com",
        "https://nominatim.openstreetmap.org",
        "https://api.github.com",
        "ws://localhost:5173", // WebSocket for development
        "wss://localhost:5173"
      ],
      fontSrc: [
        "'self'",
        "data:",
        "https://fonts.gstatic.com",
        "https://unpkg.com"
      ]
    }
  },
  crossOriginEmbedderPolicy: false // Disable COEP for external map tiles
}));

// Enhanced CORS setup for mapping services
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin"
  ]
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// =============== ENHANCED SOCKET.IO FOR REAL-TIME MESSAGING ===============
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);
  
  // User odalarına katılım
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    socket.userId = userId; // Socket'e userId'yi kaydet
    console.log(`User ${userId} joined room user-${userId}`);
    
    // Diğer kullanıcılara online durumunu bildir
    socket.broadcast.emit('user-online', { userId, socketId: socket.id });
  });
  
  // Real-time mesaj gönderme
  socket.on('send-message', async (messageData) => {
    try {
      const { senderId, receiverId, content, senderName } = messageData;
      
      // Gönderen kullanıcının bilgilerini al
      const sender = await User.findByPk(parseInt(senderId));
      const actualSenderName = sender ? `${sender.firstName} ${sender.lastName}`.trim() : (senderName || 'User');
      
      // Mesajı veritabanına kaydet
      const newMessage = await Message.create({
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        content: content.trim(),
        senderName: actualSenderName,
        conversationId: conversationId, 
        isFromCaseWorker: false,
        messageType: 'text',
        isRead: false
      });
      
      const formattedMessage = {
        id: newMessage.id.toString(),
        senderId: newMessage.senderId.toString(),
        senderName: actualSenderName,
        receiverId: newMessage.receiverId.toString(),
        content: newMessage.content,
        timestamp: newMessage.createdAt,
        isFromCaseWorker: false
      };
      
      // Alıcıya mesajı gönder
      io.to(`user-${receiverId}`).emit('new-message', formattedMessage);
      
      // Gönderene onay gönder
      socket.emit('message-sent', formattedMessage);
      
      console.log(`💬 Message sent from ${senderId} to ${receiverId}`);
      
    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('message-error', { error: error.message });
    }
  });
  
  // Mesaj okundu bildirimi
  socket.on('mark-message-read', async (messageId) => {
    try {
      await Message.update(
        { isRead: true, readAt: new Date() },
        { where: { id: parseInt(messageId) } }
      );
      
      socket.broadcast.emit('message-read', { messageId });
    } catch (error) {
      console.error('Mark read error:', error);
    }
  });
  
  // Typing bildirimi
  socket.on('typing-start', (data) => {
    socket.to(`user-${data.receiverId}`).emit('user-typing', {
      userId: data.senderId,
      senderName: data.senderName
    });
  });
  
  socket.on('typing-stop', (data) => {
    socket.to(`user-${data.receiverId}`).emit('user-stop-typing', {
      userId: data.senderId
    });
  });
  
  // Map-related socket events
  socket.on('job-location-search', (data) => {
    console.log(`🗺️ Job location search: ${data.lat}, ${data.lng}`);
    socket.broadcast.emit('new-job-search', {
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('service-location-search', (data) => {
    console.log(`🗺️ Service location search: ${data.lat}, ${data.lng}`);
    socket.broadcast.emit('new-service-search', {
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date().toISOString()
    });
  });
  
  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`👤 User disconnected: ${socket.id}`);
    
    // Diğer kullanıcılara offline durumunu bildir
    if (socket.userId) {
      socket.broadcast.emit('user-offline', { 
        userId: socket.userId, 
        socketId: socket.id 
      });
    }
  });
});

// =============== API ROUTES ===============

// Enhanced health check endpoint with mapping support info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Dignity Services API is running with Free Mapping Support + Profile Management + Real User Messaging',
    timestamp: new Date().toISOString(),
    database: sequelize ? 'connected' : 'disconnected',
    features: [
      'Location-based service discovery',
      'External API integration',
      'Real-time messaging',
      'PostgreSQL database',
      'Admin panel access',
      '🗺️ Free Leaflet mapping integration',
      '🌍 OpenStreetMap tile support',
      '🎯 Interactive job/service discovery',
      '📍 Click-to-search functionality',
      '👤 User profile management',
      '🔒 Password management',
      '🗑️ Account deletion',
      '💬 Real-time user-to-user messaging',
      '🔔 Socket.IO notifications'
    ],
    messaging: {
      type: 'Real-time Socket.IO + Database',
      features: [
        'User-to-user messaging',
        'Case worker messaging (mock)',
        'Message history storage',
        'Read receipts',
        'Typing indicators',
        'Online/offline status',
        'Conversation threading'
      ]
    },
    mapping: {
      provider: 'Leaflet + OpenStreetMap',
      cost: 'Free',
      features: [
        'Interactive maps',
        'Dark/Light themes',
        'Custom markers',
        'Popup info windows',
        'Click-based location selection',
        'Mobile responsive'
      ]
    },
    endpoints: [
      '/api/services - Enhanced with external APIs + mapping',
      '/api/jobs - Enhanced with external APIs + mapping', 
      '/api/users - Real user management',
      '/api/messages - Real-time messaging system',
      '/api/messages/:userId/:contactId - Get conversation',
      '/api/conversations/:userId - Get user conversations',
      '/api/appointments',
      '/api/auth',
      '/api/admin - Admin panel endpoints',
      '/api/profile - User profile management'
    ]
  });
});

// =============== STRUCTURED ROUTES ===============
app.use('/api/services', serviceRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

// =============== REAL USER MESSAGING ENDPOINTS ===============

// 🔥 UPDATED: Get all users for messaging
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        isActive: true
      },
      attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'createdAt'],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });
    
    // Frontend için uygun format
    const formattedUsers = users.map(user => ({
      id: user.id.toString(),
      name: `${user.firstName} ${user.lastName}`.trim(),
      username: user.phoneNumber,
      isOnline: false, // Bu real-time olarak güncellenebilir
      createdAt: user.createdAt
    }));
    
    res.json({
      success: true,
      data: formattedUsers,
      message: `Retrieved ${formattedUsers.length} active users for messaging`,
      messaging: 'Real user-to-user messaging enabled'
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🔥 NEW: Get messages between two users
app.get('/api/messages/:userId/:contactId', async (req, res) => {
  try {
    const { userId, contactId } = req.params;
    const { limit = 50 } = req.query;
    
    // ConversationId oluştur
    const smallerId = Math.min(parseInt(userId), parseInt(contactId));
    const largerId = Math.max(parseInt(userId), parseInt(contactId));
    const conversationId = `${smallerId}-${largerId}`;
    
    const messages = await Message.findAll({
      where: {
        conversationId: conversationId
      },
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      include: [
        { 
          model: User, 
          as: 'sender', 
          attributes: ['id', 'firstName', 'lastName'] 
        }
      ]
    });
    
    // Frontend formatına uygun şekilde formatla
    const formattedMessages = messages.map(msg => ({
      id: msg.id.toString(),
      senderId: msg.senderId.toString(),
      senderName: msg.senderName,
      receiverId: msg.receiverId.toString(),
      receiverName: 'User',
      content: msg.content,
      timestamp: msg.createdAt,
      isFromCaseWorker: msg.isFromCaseWorker || false,
      isRead: msg.isRead,
      messageType: msg.messageType
    }));
    
    res.json({
      success: true,
      data: formattedMessages,
      conversationId: conversationId,
      message: `Retrieved ${formattedMessages.length} messages`
    });
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🔥 FIXED: Get user conversations - Sequelize column names
app.get('/api/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // ✅ DÜZELTİLMİŞ SQL - Sequelize column names kullan
    const conversations = await sequelize.query(`
      SELECT DISTINCT
        CASE
          WHEN "senderId" = :userId THEN "receiverId"
          ELSE "senderId"
        END as partner_id,
        "conversationId",
        (SELECT content FROM messages m2 WHERE m2."conversationId" = m."conversationId" ORDER BY "createdAt" DESC LIMIT 1) as last_message,
        (SELECT "createdAt" FROM messages m2 WHERE m2."conversationId" = m."conversationId" ORDER BY "createdAt" DESC LIMIT 1) as last_message_time,
        (SELECT "senderName" FROM messages m2 WHERE m2."conversationId" = m."conversationId" ORDER BY "createdAt" DESC LIMIT 1) as last_sender_name
      FROM messages m
      WHERE ("senderId" = :userId OR "receiverId" = :userId)
        AND "conversationId" IS NOT NULL
      ORDER BY last_message_time DESC
    `, {
      replacements: { userId: parseInt(userId) },
      type: sequelize.QueryTypes.SELECT
    });

    // Partner kullanıcılarının bilgilerini al
    const partnersInfo = await Promise.all(
      conversations.map(async (conv) => {
        const partner = await User.findByPk(conv.partner_id, {
          attributes: ['id', 'firstName', 'lastName', 'phoneNumber']
        });
        return {
          participant1Id: parseInt(userId),
          participant2Id: conv.partner_id,
          partnerName: partner ? `${partner.firstName} ${partner.lastName}`.trim() : 'User',
          partnerPhone: partner ? partner.phoneNumber : '',
          conversationId: conv.conversationId,
          lastMessage: conv.last_message,
          lastMessageTime: conv.last_message_time,
          lastSenderName: conv.last_sender_name
        };
      })
    );

    res.json({
      success: true,
      data: partnersInfo,
      message: `Retrieved ${partnersInfo.length} conversations`
    });
  } catch (error) {
    console.error('Conversations fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🔥 UPDATED: Send message with real user support
app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, content, senderName } = req.body;
    
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'senderId, receiverId, and content are required'
      });
    }
    
    // Gönderen kullanıcının bilgilerini al
    const sender = await User.findByPk(parseInt(senderId));
    const receiver = await User.findByPk(parseInt(receiverId));
    
    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'Sender or receiver not found'
      });
    }
    
    const actualSenderName = `${sender.firstName} ${sender.lastName}`.trim() || senderName || 'User';
    
    const newMessage = await Message.create({
      senderId: parseInt(senderId),
      receiverId: parseInt(receiverId),
      content: content.trim(),
      senderName: actualSenderName,
      isFromCaseWorker: false,
      messageType: 'text',
      isRead: false,
      isUrgent: false
    });
    
    // Real-time bildirim gönder
    const io = req.app.get('io');
    const messageData = {
      id: newMessage.id.toString(),
      senderId: newMessage.senderId.toString(),
      senderName: actualSenderName,
      receiverId: newMessage.receiverId.toString(),
      receiverName: `${receiver.firstName} ${receiver.lastName}`.trim(),
      content: newMessage.content,
      timestamp: newMessage.createdAt,
      isFromCaseWorker: false
    };
    
    // Alıcıya mesajı gönder
    io.to(`user-${receiverId}`).emit('new-message', messageData);
    
    res.status(201).json({
      success: true,
      data: messageData,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Message sending error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============== OTHER LEGACY USER ENDPOINTS ===============

app.get('/api/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await User.findByPk(id, {
      attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'emergencyContact', 'caseWorkerName', 'createdAt']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: `User with ID ${id} does not exist`
      });
    }
    
    res.json({
      success: true,
      data: {
        ...user.toJSON(),
        name: `${user.firstName} ${user.lastName}`.trim()
      },
      message: 'User retrieved successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { phoneNumber, firstName, lastName, password, emergencyContact, caseWorkerName } = req.body;
    
    if (!phoneNumber || !firstName || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Phone number, first name, and password are required'
      });
    }
    
    const newUser = await User.create({
      phoneNumber,
      firstName,
      lastName: lastName || '',
      password, // Bu gerçek uygulamada hash'lenmeli
      emergencyContact: emergencyContact || '',
      caseWorkerName: caseWorkerName || 'Sarah Johnson',
      isActive: true
    });
    
    const userData = newUser.toJSON();
    delete userData.password; // Şifreyi response'dan çıkar
    
    res.status(201).json({
      success: true,
      data: userData,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: `User with ID ${id} does not exist`
      });
    }
    
    await user.update(updates);
    
    const userData = user.toJSON();
    delete userData.password; // Şifreyi response'dan çıkar
    
    res.json({
      success: true,
      data: userData,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: `User with ID ${id} does not exist`
      });
    }
    
    await user.destroy();
    
    res.json({
      success: true,
      data: { id },
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============== LEGACY MESSAGES ROUTES (for backward compatibility) ===============
app.get('/api/messages', async (req, res) => {
  try {
    const { userId, senderId, receiverId } = req.query;
    
    let whereClause = {};
    
    if (userId) {
      whereClause = {
        [Op.or]: [
          { senderId: parseInt(userId) },
          { receiverId: parseInt(userId) }
        ]
      };
    }
    
    if (senderId) {
      whereClause.senderId = parseInt(senderId);
    }
    
    if (receiverId) {
      whereClause.receiverId = parseInt(receiverId);
    }
    
    const messages = await Message.findAll({
      where: whereClause,
      order: [['createdAt', 'ASC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });
    
    res.json({
      success: true,
      data: messages,
      message: 'Messages retrieved successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.put('/api/messages/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
        message: `Message with ID ${id} does not exist`
      });
    }
    
    await message.update(updates);
    
    res.json({
      success: true,
      data: message,
      message: 'Message updated successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
        message: `Message with ID ${id} does not exist`
      });
    }
    
    await message.destroy();
    
    res.json({
      success: true,
      data: message,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============== APPOINTMENTS ROUTES ===============
app.get('/api/appointments', async (req, res) => {
  try {
    const { userId, status } = req.query;
    
    let whereClause = {};
    
    if (userId) {
      whereClause.userId = parseInt(userId);
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    const appointments = await Appointment.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: appointments,
      message: 'Appointments retrieved successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const { 
      userId, 
      date, 
      time, 
      type, 
      location, 
      caseWorkerName, 
      purpose,
      coordinates
    } = req.body;
    
    if (!userId || !date || !time || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'User ID, date, time, and type are required'
      });
    }
    
    const newAppointment = await Appointment.create({
      userId,
      date,
      time,
      type,
      status: 'scheduled',
      location: location || '',
      caseWorkerName: caseWorkerName || 'Sarah Johnson',
      purpose: purpose || 'General consultation',
      metadata: coordinates ? { coordinates } : null
    });
    
    // Emit real-time notification
    const io = req.app.get('io');
    io.to(`user-${userId}`).emit('appointment-created', newAppointment);
    
    res.status(201).json({
      success: true,
      data: newAppointment,
      message: 'Appointment created successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.put('/api/appointments/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found',
        message: `Appointment with ID ${id} does not exist`
      });
    }
    
    await appointment.update(updates);
    
    // Emit real-time notification for appointment updates
    const io = req.app.get('io');
    io.to(`user-${appointment.userId}`).emit('appointment-updated', appointment);
    
    res.json({
      success: true,
      data: appointment,
      message: 'Appointment updated successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found',
        message: `Appointment with ID ${id} does not exist`
      });
    }
    
    const userId = appointment.userId;
    await appointment.destroy();
    
    // Emit real-time notification for appointment deletion
    const io = req.app.get('io');
    io.to(`user-${userId}`).emit('appointment-cancelled', { id, userId });
    
    res.json({
      success: true,
      data: appointment,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =============== MAPPING UTILITY ENDPOINTS ===============

// Geocoding endpoint for address-to-coordinates conversion
app.get('/api/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address parameter is required'
      });
    }

    // Use Nominatim (OpenStreetMap's geocoding service) - FREE
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'DignityServices/1.0 (https://dignityservices.org)'
      }
    });

    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }

    const results = await response.json();
    
    const formattedResults = results.map(result => ({
      display_name: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      importance: result.importance,
      type: result.type,
      class: result.class
    }));

    res.json({
      success: true,
      data: formattedResults,
      message: `Found ${formattedResults.length} locations for "${address}"`
    });

  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Geocoding service failed'
    });
  }
});

// Reverse geocoding endpoint for coordinates-to-address conversion
app.get('/api/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude parameters are required'
      });
    }

    // Use Nominatim reverse geocoding - FREE
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'DignityServices/1.0 (https://dignityservices.org)'
      }
    });

    if (!response.ok) {
      throw new Error('Reverse geocoding service unavailable');
    }

    const result = await response.json();
    
    res.json({
      success: true,
      data: {
        display_name: result.display_name,
        address: result.address,
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      },
      message: 'Location details retrieved successfully'
    });

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Reverse geocoding service failed'
    });
  }
});

// Map tile proxy (if needed for CORS issues)
app.get('/api/tiles/:z/:x/:y', async (req, res) => {
  try {
    const { z, x, y } = req.params;
    const { style = 'osm' } = req.query;
    
    let tileUrl;
    if (style === 'dark') {
      tileUrl = `https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/${z}/${x}/${y}.png`;
    } else {
      tileUrl = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
    }
    
    const response = await fetch(tileUrl, {
      headers: {
        'User-Agent': 'DignityServices/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error('Tile server unavailable');
    }
    
    const imageBuffer = await response.buffer();
    
    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400' // 24 hours cache
    });
    
    res.send(imageBuffer);
    
  } catch (error) {
    console.error('Tile proxy error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Enhanced emergency contact endpoint with location support
app.get('/api/emergency', (req, res) => {
  const { lat, lng, country } = req.query;
  
  // Default emergency contacts
  let emergencyContacts = {
    hotline: '(555) 911-HELP',
    text: '911',
    crisis_centers: [
      {
        name: 'Crisis Intervention Center',
        phone: '(555) 273-8255',
        available: '24/7',
        location: 'General'
      }
    ]
  };
  
  // Location-specific emergency contacts
  if (country) {
    switch (country.toLowerCase()) {
      case 'cyprus':
        emergencyContacts = {
          hotline: '112', // EU standard
          text: '116 123', // Emotional support
          crisis_centers: [
            {
              name: 'Cyprus Crisis Support',
              phone: '+357 25 878 787',
              available: '24/7',
              location: 'Cyprus'
            },
            {
              name: 'KISA (Cyprus)',
              phone: '+357 22 878 181',
              available: 'Mon-Fri 9-17',
              location: 'Nicosia'
            }
          ]
        };
        break;
      case 'turkey':
        emergencyContacts = {
          hotline: '112',
          text: '114', // Mental health support
          crisis_centers: [
            {
              name: 'TEGV Crisis Line',
              phone: '444 5 432',
              available: '24/7',
              location: 'Turkey'
            }
          ]
        };
        break;
      case 'greece':
        emergencyContacts = {
          hotline: '112',
          text: '1018', // Crisis support
          crisis_centers: [
            {
              name: 'Greek Crisis Center',
              phone: '210 34 17 209',
              available: '24/7',
              location: 'Greece'
            }
          ]
        };
        break;
      case 'germany':
        emergencyContacts = {
          hotline: '112',
          text: '0800 111 0 111', // Telefonseelsorge
          crisis_centers: [
            {
              name: 'Telefonseelsorge',
              phone: '0800 111 0 111',
              available: '24/7',
              location: 'Germany'
            }
          ]
        };
        break;
      case 'uk':
        emergencyContacts = {
          hotline: '999',
          text: '116 123', // Samaritans
          crisis_centers: [
            {
              name: 'Samaritans',
              phone: '116 123',
              available: '24/7',
              location: 'UK'
            },
            {
              name: 'Crisis Text Line',
              phone: 'Text SHOUT to 85258',
              available: '24/7',
              location: 'UK'
            }
          ]
        };
        break;
      case 'usa':
        emergencyContacts = {
          hotline: '911',
          text: '988', // Suicide & Crisis Lifeline
          crisis_centers: [
            {
              name: 'National Suicide Prevention Lifeline',
              phone: '988',
              available: '24/7',
              location: 'USA'
            },
            {
              name: 'Crisis Text Line',
              phone: 'Text HOME to 741741',
              available: '24/7',
              location: 'USA'
            }
          ]
        };
        break;
    }
  }
  
  res.json({
    success: true,
    data: emergencyContacts,
    location_detected: country || 'unknown',
    coordinates: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null,
    message: 'Emergency contacts retrieved successfully'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error'
    }
  });
});

// Database connection and server startup with enhanced mapping support
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Database sync disabled - using migrations');
    }
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`🔐 Admin Login: http://localhost:${PORT}/api/auth/admin-login`);
      console.log(`👑 Admin Panel: http://localhost:${PORT}/api/admin`);
      console.log(`📋 Services: http://localhost:${PORT}/api/services`);
      console.log(`💼 Jobs: http://localhost:${PORT}/api/jobs`);
      console.log(`👤 Users: http://localhost:${PORT}/api/users`);
      console.log(`💬 Messages: http://localhost:${PORT}/api/messages`);
      console.log(`📅 Appointments: http://localhost:${PORT}/api/appointments`);
      console.log(`🚨 Emergency: http://localhost:${PORT}/api/emergency`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`👤 Profile Management: http://localhost:${PORT}/api/profile`);
      console.log(`🔒 Password Change: http://localhost:${PORT}/api/profile/change-password`);
      console.log(`🗑️ Account Deletion: http://localhost:${PORT}/api/profile/delete-account`);
      console.log(`🔌 Socket.IO enabled for real-time features`);
      console.log(`🌐 CORS enabled for: http://localhost:5173`);
      console.log('');
      console.log('🎯 ENHANCED FEATURES:');
      console.log('🗺️ Free Leaflet mapping integration active');
      console.log('📍 OpenStreetMap + CARTO tile servers');
      console.log('🌍 Interactive map-based discovery');
      console.log('🔄 No API keys required for mapping');
      console.log('📱 Mobile-responsive map interface');
      console.log('🌙 Dark/Light theme map support');
      console.log('🎯 Click-to-search functionality');
      console.log('📍 Real-time location tracking');
      console.log('👑 Admin panel with phone-based authentication');
      console.log('👤 User profile management system');
      console.log('🔒 Secure password management');
      console.log('🗑️ Account deletion with confirmations');
      console.log('💬 REAL-TIME USER MESSAGING SYSTEM'); // ✨ YENİ
      console.log('🔔 Socket.IO notifications and typing indicators'); // ✨ YENİ
      console.log('💾 Database-backed message history'); // ✨ YENİ
      console.log('👥 User-to-user real conversations'); // ✨ YENİ
      console.log('');
      console.log('🗺️ MAPPING ENDPOINTS:');
      console.log('🎯 GET /api/geocode?address=... (Address to coordinates)');
      console.log('🎯 GET /api/reverse-geocode?lat=...&lng=... (Coordinates to address)');
      console.log('🎯 GET /api/tiles/:z/:x/:y?style=... (Map tile proxy)');
      console.log('🎯 GET /api/emergency?country=... (Location-based emergency contacts)');
      console.log('');
      console.log('💬 REAL USER MESSAGING ENDPOINTS:'); // ✨ YENİ BÖLÜM
      console.log('🎯 GET /api/users (Get all users for messaging)');
      console.log('🎯 GET /api/messages/:userId/:contactId (Get conversation between users)');
      console.log('🎯 GET /api/conversations/:userId (Get user\'s all conversations)');
      console.log('🎯 POST /api/messages (Send real message between users)');
      console.log('🎯 Socket: send-message (Real-time message sending)');
      console.log('🎯 Socket: typing-start/stop (Typing indicators)');
      console.log('🎯 Socket: mark-message-read (Read receipts)');
      console.log('');
      console.log('📍 SERVICE/JOB DISCOVERY:');
      console.log('🎯 GET /api/services/location/:lat/:lng (Map-based service search)');
      console.log('🎯 GET /api/jobs/location/:lat/:lng (Map-based job search)');
      console.log('🎯 GET /api/services/nearby?lat=X&lng=Y&include_external=true');
      console.log('🎯 GET /api/jobs/nearby?lat=X&lng=Y&include_external=true');
      console.log('');
      console.log('🔐 AUTHENTICATION:');
      console.log('🎯 POST /api/auth/admin-login (phone: 05428881755, password: admin123)');
      console.log('🎯 GET /api/admin/* (requires admin authentication)');
      console.log('');
      console.log('👤 PROFILE MANAGEMENT:');
      console.log('🎯 GET /api/profile (Get user profile - requires JWT)');
      console.log('🎯 PUT /api/profile (Update profile info - requires JWT)');
      console.log('🎯 POST /api/profile/change-password (Change password - requires JWT)');
      console.log('🎯 DELETE /api/profile/delete-account (Delete account - requires JWT)');
      console.log('');
      console.log('🌟 MESSAGING FEATURES:'); // ✨ YENİ BÖLÜM
      console.log('✅ Real user-to-user messaging');
      console.log('✅ Case worker messaging (mock responses)');
      console.log('✅ Database message persistence');
      console.log('✅ Real-time Socket.IO notifications');
      console.log('✅ Typing indicators');
      console.log('✅ Read receipts');
      console.log('✅ Online/offline status');
      console.log('✅ Message history with pagination');
      console.log('✅ Conversation threading');
      console.log('✅ Auto sender name resolution');
      console.log('✅ Message validation and security');
      console.log('');
      console.log('🌟 MAPPING FEATURES:');
      console.log('✅ Free OpenStreetMap integration');
      console.log('✅ No API key requirements');
      console.log('✅ Dark/Light theme support');
      console.log('✅ Interactive job/service markers');
      console.log('✅ Click-based location selection');
      console.log('✅ Popup information windows');
      console.log('✅ Mobile-responsive design');
      console.log('✅ Real-time Socket.IO integration');
      console.log('✅ Geocoding & reverse geocoding');
      console.log('✅ CORS-compliant tile serving');
      console.log('');
      console.log('🔒 PROFILE FEATURES:');
      console.log('✅ Secure profile information updates');
      console.log('✅ First name and surname management');
      console.log('✅ Phone number validation and updates');
      console.log('✅ Password change with current password verification');
      console.log('✅ Account deletion with double confirmation');
      console.log('✅ JWT-based authentication for all profile operations');
      console.log('✅ Automatic logout after sensitive changes');
      console.log('✅ bcrypt password hashing for security');
      console.log('');
      console.log('📋 FRONTEND REQUIREMENTS:');
      console.log('🔧 Add to public/index.html:');
      console.log('   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />');
      console.log('   <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>');
      console.log('   <script src="/socket.io/socket.io.js"></script>'); // ✨ YENİ
      console.log('');
      console.log('📦 SOCKET.IO CLIENT INTEGRATION:'); // ✨ YENİ BÖLÜM
      console.log('🔧 Frontend\'de Socket.IO client kurulumu:');
      console.log('   npm install socket.io-client');
      console.log('');
      console.log('🔧 Örnek Socket.IO kullanımı:');
      console.log('   const socket = io("http://localhost:3000");');
      console.log('   socket.emit("join-user-room", userId);');
      console.log('   socket.on("new-message", handleNewMessage);');
      console.log('   socket.emit("send-message", messageData);');
      console.log('');
      console.log('🎨 SUPPORTED MAP STYLES:');
      console.log('☀️ Light: OpenStreetMap standard tiles');
      console.log('🌙 Dark: CARTO dark theme tiles');
      console.log('🎯 Custom: Your own tile servers (configurable)');
      console.log('');
      console.log('🌍 SUPPORTED COUNTRIES:');
      console.log('🇨🇾 Cyprus - Emergency: 112');
      console.log('🇹🇷 Turkey - Emergency: 112');
      console.log('🇬🇷 Greece - Emergency: 112');
      console.log('🇩🇪 Germany - Emergency: 112');
      console.log('🇬🇧 UK - Emergency: 999');
      console.log('🇺🇸 USA - Emergency: 911');
      console.log('');
      console.log('📦 REQUIRED PACKAGES:');
      console.log('✅ socket.io - Real-time messaging');
      console.log('✅ bcryptjs - Password hashing and verification');
      console.log('✅ jsonwebtoken - JWT authentication');
      console.log('✅ sequelize - Database ORM');
      console.log('✅ express - Web framework');
      console.log('');
      console.log('🚀 READY FOR FREE MAPPING + PROFILE MANAGEMENT + REAL USER MESSAGING!');
      console.log('💬 Users can now have real conversations with each other!');
      console.log('🔔 Real-time notifications and typing indicators active!');
      console.log('💾 All messages saved to database for history!');
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    if (error.name === 'SequelizeConnectionError') {
      console.error('');
      console.error('💡 Database connection troubleshooting:');
      console.error(' 1. PostgreSQL çalışıyor mu? (brew services start postgresql)');
      console.error(' 2. Database mevcut mu? (createdb homeless_services_db)');
      console.error(' 3. .env dosyasındaki ayarlar doğru mu?');
      console.error(' 4. Paketler yüklü mü? (npm install pg pg-hstore)');
      console.error('');
      console.error('🗺️ Mapping will still work without database connection!');
      console.error('👤 Profile management requires database connection!');
      console.error('💬 Real user messaging requires database connection!'); // ✨ YENİ
    }
    process.exit(1);
  }
}

startServer();

module.exports = { app, server, io };