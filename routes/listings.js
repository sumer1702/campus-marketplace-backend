const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebaseAdmin');
const { handleImageUpload, uploadImageToStorage, deleteImageFromStorage } = require('../services/imageUpload');

// GET /listings - Get all listings
router.get('/', async (req, res) => {
  try {
    console.log('GET /listings called by user:', req.user?.email || 'Anonymous');
    
    // Use the correct field name - existing data uses 'timestamp' not 'createdAt'
    const snapshot = await db.collection('listings')
      .orderBy('timestamp', 'desc')
      .get();
    
    console.log(`✅ Found ${snapshot.docs.length} total listings in Firestore`);
    
    // Debug: Log first few listings to see their structure
    snapshot.docs.slice(0, 3).forEach((doc, idx) => {
      const data = doc.data();
      console.log(`Listing ${idx + 1}:`, {
        id: doc.id,
        title: data.title,
        status: data.status,
        owner: data.owner?.email,
        timestamp: data.timestamp?.toDate?.()?.toISOString?.() || data.timestamp
      });
    });
    
    // Filter out deleted listings in memory
    const listings = snapshot.docs
      .filter(doc => {
        const data = doc.data();
        const isNotDeleted = data.status !== 'deleted';
        if (!isNotDeleted) {
          console.log(`Filtering out deleted listing: ${doc.id}`);
        }
        return isNotDeleted;
      })
      .map(doc => { 
        const data = doc.data();
        return {
          id: doc.id, 
          ...data,
          // Handle both timestamp and createdAt fields for compatibility
          createdAt: data.createdAt?.toDate()?.toISOString() || data.timestamp?.toDate()?.toISOString(),
          updatedAt: data.updatedAt?.toDate()?.toISOString(),
          // Add imageUrl field for frontend compatibility if missing but image.url exists
          imageUrl: data.imageUrl || (data.image?.url)
        };
      });
    
    console.log(`🎯 Returning ${listings.length} active listings`);
    res.json(listings);
  } catch (err) {
    console.error('❌ Error getting listings:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /listings/mine - Get user's own listings
router.get('/mine', async (req, res) => {
  try {
    console.log('GET /listings/mine called by user:', req.user?.email);
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Query user's own listings only - remove orderBy to avoid index requirement
    const snapshot = await db.collection('listings')
      .where('owner.uid', '==', req.user.uid)
      .get();
    
    // Filter out deleted listings and sort in memory
    const myListings = snapshot.docs
      .filter(doc => {
        const data = doc.data();
        return data.status !== 'deleted';
      })
      .map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Handle timestamp to createdAt conversion for compatibility  
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || doc.data().timestamp?.toDate()?.toISOString(),
        updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
        // Add imageUrl field for frontend compatibility if missing but image.url exists
        imageUrl: doc.data().imageUrl || (doc.data().image?.url)
      }))
      // Sort by timestamp in memory (most recent first)
      .sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.timestamp?.toDate?.() || new Date(b.createdAt || 0);
        return bTime - aTime; // Descending order (newest first)
      });
    
    console.log(`Returning ${myListings.length} user listings for uid: ${req.user.uid}`);
    res.json(myListings);
  } catch (err) {
    console.error('Error getting user listings:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /listings - Create new listing with optional image upload
router.post('/', handleImageUpload, async (req, res) => {
  try {
    console.log('POST /listings called by user:', req.user?.email);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? { name: req.file.originalname, size: req.file.size } : 'No file');
    
    // Check if we have either body or file
    if (!req.body && !req.file) {
      return res.status(400).json({ message: 'No request data received' });
    }

    // Extract fields from body (handles both JSON and multipart)
    const { title, description, price, location, category } = req.body || {};
    
    // Validation
    if (!title || !description || !price || !location || !category) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['title', 'description', 'price', 'location', 'category'],
        received: req.body ? Object.keys(req.body) : []
      });
    }

    // Validate price is a number
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: 'Price must be a valid positive number' });
    }

    // Handle image upload if present
    let imageData = null;
    if (req.file) {
      try {
        imageData = await uploadImageToStorage(req.file, 'listings');
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return res.status(400).json({ 
          message: 'Failed to upload image', 
          error: uploadError.message 
        });
      }
    }

    // Create listing document
    const listingData = {
      title: title.trim(),
      description: description.trim(),
      price: numericPrice,
      location: location.trim(),
      category: category.trim(),
      status: 'active',
      timestamp: admin.firestore.FieldValue.serverTimestamp(), // Use timestamp to match existing data
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      owner: {
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name || req.user.email.split('@')[0]
      },
      interestedUsers: []
    };

    // Add image data if uploaded
    if (imageData) {
      listingData.image = {
        url: imageData.url,
        fileName: imageData.fileName,
        originalName: imageData.originalName,
        uploadedAt: new Date().toISOString()
      };
      // Also add imageUrl for frontend compatibility
      listingData.imageUrl = imageData.url;
    }

    // Save to Firestore
    const docRef = await db.collection('listings').add(listingData);
    
    // Return created listing with converted timestamps  
    const createdDoc = await docRef.get();
    const createdListing = { 
      id: docRef.id, 
      ...createdDoc.data(),
      // Convert timestamp to createdAt for consistency with frontend
      createdAt: createdDoc.data().timestamp?.toDate()?.toISOString(),
      updatedAt: createdDoc.data().updatedAt?.toDate()?.toISOString()
    };

    console.log('Created listing:', createdListing.id, imageData ? 'with image' : 'without image');
    res.status(201).json(createdListing);
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ message: 'Failed to create listing', error: err.message });
  }
});

// PUT /listings/:id - Update listing
router.put('/:id', async (req, res) => {
  try {
    console.log(`PUT /listings/${req.params.id} called by user:`, req.user?.email);
    
    const listingDoc = await db.collection('listings').doc(req.params.id).get();
    
    if (!listingDoc.exists) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    const listingData = listingDoc.data();
    
    // Only allow owner to update
    if (listingData.owner.uid !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }
    
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Don't allow updating owner or creation date
    delete updateData.owner;
    delete updateData.createdAt;
    delete updateData.id;
    
    await db.collection('listings').doc(req.params.id).update(updateData);
    
    // Return updated document
    const updatedDoc = await db.collection('listings').doc(req.params.id).get();
    const updatedListing = { 
      id: updatedDoc.id, 
      ...updatedDoc.data(),
      createdAt: updatedDoc.data().createdAt?.toDate()?.toISOString(),
      updatedAt: updatedDoc.data().updatedAt?.toDate()?.toISOString()
    };
    
    console.log('Updated listing:', req.params.id);
    res.json(updatedListing);
  } catch (err) {
    console.error('Error updating listing:', err);
    res.status(500).json({ message: err.message });
  }
});

// PATCH /listings/:id - Update listing (alias for PUT for REST compliance)
router.patch('/:id', async (req, res) => {
  try {
    console.log(`PATCH /listings/${req.params.id} called by user:`, req.user?.email);
    
    const listingDoc = await db.collection('listings').doc(req.params.id).get();
    
    if (!listingDoc.exists) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    const listingData = listingDoc.data();
    
    // Only allow owner to update
    if (listingData.owner.uid !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }
    
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Don't allow updating owner or creation date
    delete updateData.owner;
    delete updateData.timestamp;
    delete updateData.id;
    
    await db.collection('listings').doc(req.params.id).update(updateData);
    
    // Return updated document with timestamp conversion
    const updatedDoc = await db.collection('listings').doc(req.params.id).get();
    const updatedListing = { 
      id: updatedDoc.id, 
      ...updatedDoc.data(),
      createdAt: updatedDoc.data().timestamp?.toDate()?.toISOString() || updatedDoc.data().createdAt?.toDate()?.toISOString(),
      updatedAt: updatedDoc.data().updatedAt?.toDate()?.toISOString(),
      // Add imageUrl field for frontend compatibility if missing but image.url exists
      imageUrl: updatedDoc.data().imageUrl || (updatedDoc.data().image?.url)
    };
    
    console.log('Updated listing via PATCH:', req.params.id);
    res.json(updatedListing);
  } catch (err) {
    console.error('Error updating listing via PATCH:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /listings/:id - Delete listing and associated image
router.delete('/:id', async (req, res) => {
  try {
    console.log(`DELETE /listings/${req.params.id} called by user:`, req.user?.email);
    
    const listingDoc = await db.collection('listings').doc(req.params.id).get();
    
    if (!listingDoc.exists) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    const listingData = listingDoc.data();
    
    // Only allow owner to delete
    if (listingData.owner.uid !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    // Delete associated image from storage if exists
    if (listingData.image && listingData.image.fileName) {
      await deleteImageFromStorage(listingData.image.fileName);
    }
    
    // Soft delete by updating status
    await db.collection('listings').doc(req.params.id).update({
      status: 'deleted',
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Deleted listing:', req.params.id, listingData.image ? 'with image cleanup' : 'without image');
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    console.error('Error deleting listing:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /listings/:id/interest - Express interest in listing
router.post('/:id/interest', async (req, res) => {
  try {
    console.log(`POST /listings/${req.params.id}/interest called by user:`, req.user?.email);
    
    const { offerPrice, comment } = req.body;
    
    if (!offerPrice || offerPrice <= 0) {
      return res.status(400).json({ message: 'Valid offer price is required' });
    }
    
    // Get the listing
    const listingDoc = await db.collection('listings').doc(req.params.id).get();
    
    if (!listingDoc.exists) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    const listingData = listingDoc.data();
    
    // Don't allow interest in own listing
    if (listingData.owner.uid === req.user.uid) {
      return res.status(400).json({ message: 'Cannot show interest in your own listing' });
    }
    
    // Check if listing is still active
    if (listingData.status !== 'active') {
      return res.status(400).json({ message: 'Listing is no longer available' });
    }
    
    // Create interest document
    const interestData = {
      listingId: req.params.id,
      listingTitle: listingData.title,
      sellerId: listingData.owner.uid,
      sellerEmail: listingData.owner.email,
      buyerId: req.user.uid,
      buyerEmail: req.user.email,
      buyerName: req.user.name || req.user.email.split('@')[0],
      offerPrice: parseFloat(offerPrice),
      comment: comment?.trim() || '',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active'
    };
    
    // Add interest to interests collection
    const interestRef = await db.collection('interests').add(interestData);
    
    console.log('Interest created:', interestRef.id);
    res.status(201).json({ 
      message: 'Interest submitted successfully',
      interestId: interestRef.id 
    });
    
  } catch (err) {
    console.error('Error submitting interest:', err);
    res.status(500).json({ message: err.message });
  }
});

// PATCH /listings/:id/status - Update listing status (close/reopen)
router.patch('/:id/status', async (req, res) => {
  try {
    console.log(`PATCH /listings/${req.params.id}/status called by user:`, req.user?.email);
    
    const { status } = req.body;
    
    if (!['active', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "active" or "closed"' });
    }
    
    const listingDoc = await db.collection('listings').doc(req.params.id).get();
    
    if (!listingDoc.exists) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    const listingData = listingDoc.data();
    
    // Only allow owner to update status
    if (listingData.owner.uid !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }
    
    await db.collection('listings').doc(req.params.id).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Listing ${req.params.id} status updated to:`, status);
    res.json({ message: `Listing ${status} successfully` });
  } catch (err) {
    console.error('Error updating listing status:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
