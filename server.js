// Entry point for Express server
require('dotenv').config();
require('./firebaseAdmin');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();

// Enhanced CORS configuration for production
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://dcpmarketplace.web.app',
    'https://dcpmarketplace.firebaseapp.com',
    'https://campus-marketplace-8b2c1.web.app',
    'https://campus-marketplace-8b2c1.firebaseapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer for handling multipart/form-data
const upload = multer();
app.use(upload.none()); // For text fields only

// Logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log('Headers:', Object.keys(req.headers).length > 0 ? req.headers : 'No headers');
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Firestore is initialized via firebase-admin in firebaseAdmin.js

// Import routes
const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const adminRoutes = require('./routes/admin');

// Firebase Auth middleware
const firebaseAuth = require('./middleware/firebaseAuth');

// Public routes
app.use('/auth', authRoutes);

// Protected routes
app.use('/listings', firebaseAuth, listingsRoutes);
app.use('/admin', firebaseAuth, adminRoutes);

// Phase 2 routes (placeholders) - temporarily disabled
// app.use('/forum', firebaseAuth, forumRoutes);
// app.use('/time-exchange', firebaseAuth, timeExchangeRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Campus Marketplace API',
    status: 'active',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Test protected endpoint
app.get('/api/protected-test', firebaseAuth, (req, res) => {
  res.json({
    message: 'Protected endpoint working',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for production frontend`);
});
