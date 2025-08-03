

const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');

// GET /listings - Get all listings (optionally filtered by status/category)
// Query params: status, mode, minPrice, maxPrice
router.get('/', async (req, res) => {
  try {
    let query = db.collection('listings');
    if (req.query.status) query = query.where('status', '==', req.query.status);
    if (req.query.mode) query = query.where('mode', '==', req.query.mode);
    // Firestore does not support range queries on multiple fields, so filter price in-memory
    const snapshot = await query.orderBy('timestamp', 'desc').get();
    let listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (req.query.minPrice) listings = listings.filter(l => l.price >= Number(req.query.minPrice));
    if (req.query.maxPrice) listings = listings.filter(l => l.price <= Number(req.query.maxPrice));
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /listings - Add new listing
router.post('/', async (req, res) => {
  try {
    const { title, description, price, imageUrl, location, mode } = req.body;
    const owner = {
      uid: req.user.uid,
      username: req.user.name || req.user.email.split('@')[0],
      phone: req.body.phone
    };
    const listing = {
      title,
      description,
      price,
      imageUrl,
      location,
      owner,
      status: 'active',
      mode,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('listings').add(listing);
    const newDoc = await docRef.get();
    res.status(201).json({ id: docRef.id, ...newDoc.data() });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /listings/my - Get listings for the logged-in user
router.get('/my', async (req, res) => {
  try {
    const snapshot = await db.collection('listings').where('owner.uid', '==', req.user.uid).orderBy('timestamp', 'desc').get();
    const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /listings/:id/status - Mark listing as closed/delisted
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const docRef = db.collection('listings').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ message: 'Listing not found' });
    if (doc.data().owner.uid !== req.user.uid) return res.status(403).json({ message: 'Not authorized' });
    await docRef.update({ status });
    res.json({ id: doc.id, ...doc.data(), status });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /listings/:id/interest - Add offer to a listing
router.post('/:id/interest', async (req, res) => {
  try {
    const { offerPrice, comment } = req.body;
    const interest = {
      listingId: req.params.id,
      buyerId: req.user.uid,
      offerPrice,
      comment,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('interests').add(interest);
    res.status(201).json({ id: docRef.id, ...interest });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /listings/:id/interests - Get all offers on a listing (for seller/admin)
router.get('/:id/interests', async (req, res) => {
  try {
    const snapshot = await db.collection('interests').where('listingId', '==', req.params.id).orderBy('timestamp', 'desc').get();
    const interests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(interests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
