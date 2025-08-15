const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebaseAdmin');

// GET /interests?listingId=:id - Get interests for a specific listing (owner only)
router.get('/', async (req, res) => {
  try {
    const { listingId } = req.query;
    
    if (!listingId) {
      return res.status(400).json({ message: 'listingId query parameter is required' });
    }
    
    console.log(`GET /interests?listingId=${listingId} called by user:`, req.user?.email);
    
    // First verify that the user owns the listing
    const listingDoc = await db.collection('listings').doc(listingId).get();
    
    if (!listingDoc.exists) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    const listingData = listingDoc.data();
    
    if (listingData.owner.uid !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized to view interests for this listing' });
    }
    
    // Get interests for this listing
    const snapshot = await db.collection('interests')
      .where('listingId', '==', listingId)
      .get();
    
    const interests = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const aTime = a.timestamp?.toDate() || new Date(0);
        const bTime = b.timestamp?.toDate() || new Date(0);
        return bTime - aTime; // desc order
      });
    
    console.log(`Returning ${interests.length} interests for listing ${listingId}`);
    res.json(interests);
  } catch (err) {
    console.error('Error getting interests for listing:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /interests/my - Get user's interests (for My Requests page)
router.get('/my', async (req, res) => {
  try {
    console.log('GET /interests/my called by user:', req.user?.email);
    
    // Simplified query to avoid index requirements - filter by buyerId only
    const snapshot = await db.collection('interests')
      .where('buyerId', '==', req.user.uid)
      .get();
    
    // Sort in memory instead of Firestore to avoid compound index
    const interests = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const aTime = a.timestamp?.toDate() || new Date(0);
        const bTime = b.timestamp?.toDate() || new Date(0);
        return bTime - aTime; // desc order
      });
    
    // Get listing details for each interest
    const interestsWithListings = await Promise.all(
      interests.map(async (interest) => {
        try {
          const listingDoc = await db.collection('listings').doc(interest.listingId).get();
          if (listingDoc.exists) {
            return {
              ...interest,
              listing: { id: listingDoc.id, ...listingDoc.data() }
            };
          }
          return interest;
        } catch (err) {
          console.error('Error fetching listing for interest:', err);
          return interest;
        }
      })
    );
    
    console.log(`Returning ${interestsWithListings.length} interests`);
    res.json(interestsWithListings);
  } catch (err) {
    console.error('Error getting user interests:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /interests/:id - Revoke interest
router.delete('/:id', async (req, res) => {
  try {
    const interestDoc = await db.collection('interests').doc(req.params.id).get();
    
    if (!interestDoc.exists) {
      return res.status(404).json({ message: 'Interest not found' });
    }
    
    const interestData = interestDoc.data();
    
    // Only allow the buyer to revoke their own interest
    if (interestData.buyerId !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized to revoke this interest' });
    }
    
    await db.collection('interests').doc(req.params.id).delete();
    console.log('Interest revoked:', req.params.id);
    
    res.json({ message: 'Interest revoked successfully' });
  } catch (err) {
    console.error('Error revoking interest:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /interests/:id/remind - Send reminder to seller
router.post('/:id/remind', async (req, res) => {
  try {
    const interestDoc = await db.collection('interests').doc(req.params.id).get();
    
    if (!interestDoc.exists) {
      return res.status(404).json({ message: 'Interest not found' });
    }
    
    const interestData = interestDoc.data();
    
    // Only allow the buyer to send reminder for their own interest
    if (interestData.buyerId !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized to send reminder for this interest' });
    }
    
    // Update the interest with reminder timestamp
    await db.collection('interests').doc(req.params.id).update({
      lastReminderSent: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Reminder sent for interest:', req.params.id);
    res.json({ message: 'Reminder sent to seller successfully' });
  } catch (err) {
    console.error('Error sending reminder:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
