const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebaseAdmin');

// GET /users/me - Get current user profile (must come before /:uid route)
router.get('/me', async (req, res) => {
  try {
    console.log('GET /users/me called by user:', req.user?.email);
    
    if (!req.user) {
      console.error('GET /users/me - No user in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Try to get user document from Firestore
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    let userData;
    if (userDoc.exists) {
      userData = userDoc.data();
      console.log('GET /users/me - Found existing profile:', {
        hasName: !!userData.name,
        hasPhone: !!userData.phone,
        hasRegNo: !!userData.regNo,
        email: userData.email
      });
    } else {
      // Create default profile if doesn't exist
      console.log('GET /users/me - No doc found, creating default profile');
      const defaultProfile = {
        name: '',
        fullName: '',
        email: req.user.email,
        phone: '',
        regNo: '',
        registrationNumber: '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Create the document
      await db.collection('users').doc(req.user.uid).set(defaultProfile, { merge: true });
      userData = defaultProfile;
    }
    
    // Convert timestamps for JSON serialization
    if (userData.createdAt?.toDate) {
      userData.createdAt = userData.createdAt.toDate().toISOString();
    }
    if (userData.updatedAt?.toDate) {
      userData.updatedAt = userData.updatedAt.toDate().toISOString();
    }
    
    const profileResponse = {
      uid: req.user.uid,
      fullName: userData.name || userData.fullName || '',
      name: userData.name || userData.fullName || '', // Keep backward compatibility
      email: userData.email || req.user.email,
      phone: userData.phone || '',
      registrationNumber: userData.regNo || userData.registrationNumber || '',
      regNo: userData.regNo || userData.registrationNumber || '' // Keep backward compatibility
    };
    
    console.log('GET /users/me - Returning profile:', {
      uid: profileResponse.uid,
      email: profileResponse.email,
      fullName: profileResponse.fullName || 'none',
      phone: profileResponse.phone || 'none',
      registrationNumber: profileResponse.registrationNumber || 'none'
    });
    
    res.json(profileResponse);
  } catch (err) {
    console.error('Error getting user profile:', err);
    res.status(500).json({ message: 'Failed to load profile', error: err.message });
  }
});

// PUT /users/me - Update current user profile
router.put('/me', async (req, res) => {
  try {
    console.log('PUT /users/me called by user:', req.user?.email);
    console.log('Update data:', req.body);
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (!req.body) {
      return res.status(400).json({ message: 'No update data provided' });
    }
    
    const { fullName, phone, registrationNumber } = req.body;
    
    const updateData = {
      email: req.user.email, // Always set from auth token
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Only update editable fields (fullName, phone, registrationNumber)
    if (fullName !== undefined) {
      updateData.name = fullName;
      updateData.fullName = fullName; // Also set fullName for consistency
    }
    if (phone !== undefined) updateData.phone = phone;
    if (registrationNumber !== undefined) {
      updateData.regNo = registrationNumber;
      updateData.registrationNumber = registrationNumber; // Also set registrationNumber for consistency
    }
    
    // Upsert user document
    await db.collection('users').doc(req.user.uid).set(updateData, { merge: true });
    
    console.log('User profile updated for:', req.user.email);
    
    // Return updated profile in normalized format
    const response = {
      uid: req.user.uid,
      fullName: updateData.name || updateData.fullName || '',
      name: updateData.name || updateData.fullName || '', // Keep backward compatibility
      email: req.user.email,
      phone: updateData.phone || '',
      registrationNumber: updateData.regNo || updateData.registrationNumber || '',
      regNo: updateData.regNo || updateData.registrationNumber || '' // Keep backward compatibility
    };
    
    res.json(response);
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
});

// GET /users/:uid - Get profile by UID (must be after /me routes)
router.get('/:uid', async (req, res) => {
  try {
    console.log('GET /users/:uid called for uid:', req.params.uid);
    
    const doc = await db.collection('users').doc(req.params.uid).get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = doc.data();
    
    // Convert Firestore timestamps to ISO strings
    if (userData.createdAt && userData.createdAt.toDate) {
      userData.createdAt = userData.createdAt.toDate().toISOString();
    }
    
    if (userData.updatedAt && userData.updatedAt.toDate) {
      userData.updatedAt = userData.updatedAt.toDate().toISOString();
    }
    
    const profileResponse = {
      uid: doc.id,
      email: userData.email || '',
      ...userData
    };
    
    console.log('GET /users/:uid - Returning profile for uid:', req.params.uid);
    
    res.json(profileResponse);
  } catch (err) {
    console.error('Error getting user by UID:', err);
    res.status(500).json({ message: 'Failed to load profile', error: err.message });
  }
});

// GET /users/stats - Get user statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('[stats] 🔍 Request headers:', {
      authorization: req.headers.authorization ? 'Bearer [REDACTED]' : 'Missing',
      contentType: req.headers['content-type']
    });
    console.log('[stats] 🔍 req.user:', req.user ? { uid: req.user.uid, email: req.user.email } : 'undefined');
    
    const userEmail = req.user?.email;
    const userUid = req.user?.uid;
    
    if (!req.user) {
      console.error('[stats] ❌ No authenticated user - middleware did not set req.user');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    console.log(`[stats] 🔍 Computing stats for uid=${userUid} email=${userEmail}`);
    
    // Get user's listings - handle both owner formats (old: string email, new: {uid, email})
    // First try new format (owner.uid) - use simple query to avoid index issues
    let listingsSnapshot = await db.collection('listings')
      .where('owner.uid', '==', userUid)
      .get();
    
    console.log(`[stats] 📋 Found ${listingsSnapshot.docs.length} listings with owner.uid format`);
    
    // If no results with new format, try old format (owner = email) - also simple query
    if (listingsSnapshot.docs.length === 0) {
      console.log(`[stats] 🔍 Trying old format with owner = email (${userEmail})`);
      listingsSnapshot = await db.collection('listings')
        .where('owner', '==', userEmail)
        .get();
      console.log(`[stats] 📋 Found ${listingsSnapshot.docs.length} listings with owner=email format`);
    }
    
    // Filter out deleted listings in JavaScript (avoid compound index requirement)
    const validListings = listingsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.status !== 'deleted';
    });
    
    // Debug: Log listing details and count active ones
    let activeListings = 0;
    validListings.forEach((doc, idx) => {
      const data = doc.data();
      const isActive = data.status !== 'closed';
      if (isActive) activeListings++;
      console.log(`[stats] Listing ${idx + 1}: id=${doc.id} title="${data.title}" status="${data.status}" isActive=${isActive}`);
    });
    
    console.log(`[stats] 📊 Active listings count: ${activeListings}`);
    
    // Get total interests across all user's listings (including closed ones)
    let receivedInterests = 0;
    const listingIds = validListings.map(doc => doc.id);
    
    if (listingIds.length > 0) {
      console.log(`[stats] 💕 Checking interests for listings: [${listingIds.join(', ')}]`);
      
      // Batch fetch interests for efficiency
      const interestsPromises = listingIds.map(listingId =>
        db.collection('interests')
          .where('listingId', '==', listingId)
          .get()
      );
      
      const interestsSnapshots = await Promise.all(interestsPromises);
      
      interestsSnapshots.forEach((snapshot, idx) => {
        console.log(`[stats] Listing ${listingIds[idx]} has ${snapshot.docs.length} interests`);
        receivedInterests += snapshot.docs.length;
      });
    }
    
    // Get interests made BY this user (myInterests)
    const myInterestsSnapshot = await db.collection('interests')
      .where('buyerId', '==', userUid)
      .get();
    
    console.log(`[stats] 👤 User has made ${myInterestsSnapshot.docs.length} interests`);
    
    const stats = {
      activeListings: activeListings || 0,
      totalInterests: receivedInterests || 0,
      myInterests: myInterestsSnapshot.docs.length || 0,
      receivedInterests: receivedInterests || 0,
      fetchedAt: new Date().toISOString()
    };
    
    console.log(`[stats] ✅ Final stats for uid=${userUid}: activeListings=${stats.activeListings}, receivedInterests=${stats.receivedInterests}, myInterests=${stats.myInterests}, docs(listings)=${validListings.length}, docs(interests)=${receivedInterests}`);
    
    res.status(200).json(stats);
    
  } catch (err) {
    console.error('[stats] ❌ Error getting user stats:', err);
    // Return error instead of fallback to help debug
    res.status(500).json({ 
      message: 'Failed to load stats', 
      error: err.message,
      activeListings: 0, 
      totalInterests: 0 
    });
  }
});

module.exports = router;
