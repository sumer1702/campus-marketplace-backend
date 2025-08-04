require('dotenv').config();
require('./firebaseAdmin');
const express = require('express');
const cors = require('cors');
const app = express();

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

app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const adminRoutes = require('./routes/admin');
const firebaseAuth = require('./middleware/firebaseAuth');

app.use('/auth', authRoutes);
app.use('/listings', firebaseAuth, listingsRoutes);
app.use('/admin', firebaseAuth, adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Campus Marketplace API', status: 'active' });
});

app.use((error, req, res, next) => {
  console.error('❌ Error:', error);
  res.status(500).json({ message: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
