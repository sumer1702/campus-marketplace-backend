// Entry point for Express server
require('dotenv').config();
require('./firebaseAdmin');
const express = require('express');
const cors = require('cors');
const app = express();

// Enhanced CORS configuration for production
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://dcpmarketplace.web.app',
    'https://dcpmarketplace.firebaseapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Firestore is initialized via firebase-admin in firebaseAdmin.js

// Import routes
const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const adminRoutes = require('./routes/admin');
// Phase 2 route stubs (not implemented yet)
const forumRoutes = require('./routes/forum');
const timeExchangeRoutes = require('./routes/time-exchange');

// Firebase Auth middleware
const firebaseAuth = require('./middleware/firebaseAuth');

// Public routes
app.use('/auth', authRoutes);

// Protected routes
app.use('/listings', firebaseAuth, listingsRoutes);
app.use('/admin', firebaseAuth, adminRoutes);

// Phase 2 routes (placeholders)
app.use('/forum', firebaseAuth, forumRoutes);
app.use('/time-exchange', firebaseAuth, timeExchangeRoutes);

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
    message: 'Campus Marketplace Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/auth',
      listings: '/listings',
      admin: '/admin',
      forum: '/forum (placeholder)',
      timeExchange: '/time-exchange (placeholder)'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
