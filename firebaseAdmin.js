// Centralized Firebase Admin initialization
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Enhanced Firebase Admin initialization for multiple environments
if (!admin.apps.length) {
  try {
    let serviceAccount;
    
    // Try to get service account from environment variable first (production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log('Loading Firebase service account from environment variable');
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } 
    // Fallback to local file (development)
    else {
      const keyPath = path.join(__dirname, 'serviceAccountKey.json');
      console.log('Looking for serviceAccountKey.json at:', keyPath);
      console.log('File exists:', fs.existsSync(keyPath));
      
      if (fs.existsSync(keyPath)) {
        serviceAccount = require(keyPath);
        console.log('Loaded Firebase service account from local file');
      } else {
        throw new Error('No Firebase service account found. Please provide serviceAccountKey.json or FIREBASE_SERVICE_ACCOUNT environment variable.');
      }
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
    });
    
    console.log('✅ Firebase Admin initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    process.exit(1);
  }
}

// Export both admin and commonly used services
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = {
  admin,
  db,
  auth,
  storage
};
