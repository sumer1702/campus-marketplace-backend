require('dotenv').config();
require('./firebaseAdmin');
const express = require('express');
const cors = require('cors');
const { db } = require('./firebaseAdmin');
const app = express();

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://dcpmarketplace.web.app',
    'https://dcpmarketplace.firebaseapp.com',
    'https://campus-marketplace-8b2c1.web.app',
    'https://campus-marketplace-8b2c1.firebaseapp.com'
  ],
  credentials: false, // Set to false since we're not using cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type']
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log(`[req] ${req.method} ${req.path}`, { uid: req.user?.uid });
  next();
});

const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const interestsRoutes = require('./routes/interests');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const firebaseAuth = require('./middleware/firebaseAuth');

app.use('/auth', authRoutes);
app.use('/listings', firebaseAuth, listingsRoutes);
app.use('/interests', firebaseAuth, interestsRoutes);
app.use('/users', firebaseAuth, usersRoutes);
app.use('/admin', firebaseAuth, adminRoutes);

app.get('/health', (req, res) => {
  console.log('Health endpoint hit');
  res.json({ ok: true, ts: Date.now() });
});

// GET /stats - Get user statistics (authenticated users only)
app.get('/stats', firebaseAuth, async (req, res) => {
  try {
    console.log('[stats] � Stats endpoint called by user:', req.user?.email);
    
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userUid = req.user.uid;
    
    // Get user's listings
    const listingsSnapshot = await db.collection('listings')
      .where('owner.uid', '==', userUid)
      .get();
    
    // Filter out deleted listings and count active ones
    const validListings = listingsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.status !== 'deleted';
    });
    
    const activeListings = validListings.filter(doc => {
      const data = doc.data();
      return data.status !== 'closed';
    }).length;
    
    // Get total interests across all user's listings
    let receivedInterests = 0;
    const listingIds = validListings.map(doc => doc.id);
    
    if (listingIds.length > 0) {
      const interestsPromises = listingIds.map(listingId =>
        db.collection('interests')
          .where('listingId', '==', listingId)
          .get()
      );
      
      const interestsSnapshots = await Promise.all(interestsPromises);
      receivedInterests = interestsSnapshots.reduce((total, snapshot) => total + snapshot.docs.length, 0);
    }
    
    const stats = {
      activeListings: activeListings || 0,
      totalInterests: receivedInterests || 0,
      receivedInterests: receivedInterests || 0,
      fetchedAt: new Date().toISOString()
    };
    
    console.log('[stats] ✅ Returning stats:', stats);
    res.json(stats);
  } catch (err) {
    console.error('[stats] ❌ Error:', err);
    res.status(500).json({ message: 'Failed to get stats', error: err.message });
  }
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});