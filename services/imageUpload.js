const { admin, storage } = require('../firebaseAdmin');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Upload image to Firebase Storage
async function uploadImageToStorage(file, folder = 'listings') {
  try {
    if (!file || !file.buffer) {
      throw new Error('No file provided');
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${folder}/${uuidv4()}${fileExtension}`;
    
    // Get Firebase Storage bucket
    const bucket = storage.bucket();
    const fileRef = bucket.file(fileName);
    
    // Upload file
    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    // Make file publicly accessible
    await fileRef.makePublic();
    
    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    console.log(`✅ Image uploaded successfully: ${publicUrl}`);
    
    return {
      url: publicUrl,
      fileName: fileName,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype
    };
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
}

// Delete image from Firebase Storage
async function deleteImageFromStorage(fileName) {
  try {
    if (!fileName) return;
    
    const bucket = storage.bucket();
    const fileRef = bucket.file(fileName);
    
    // Check if file exists before deleting
    const [exists] = await fileRef.exists();
    if (exists) {
      await fileRef.delete();
      console.log(`🗑️ Image deleted: ${fileName}`);
    }
  } catch (error) {
    console.error('❌ Error deleting image:', error);
    // Don't throw error for deletion failures to avoid blocking other operations
  }
}

// Middleware for single image upload
const uploadSingle = upload.single('image');

// Middleware wrapper with error handling
const handleImageUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'File too large. Maximum size is 5MB.',
          error: 'FILE_TOO_LARGE'
        });
      }
      return res.status(400).json({ 
        message: `Upload error: ${err.message}`,
        error: 'UPLOAD_ERROR'
      });
    } else if (err) {
      return res.status(400).json({ 
        message: err.message,
        error: 'INVALID_FILE'
      });
    }
    next();
  });
};

module.exports = {
  uploadImageToStorage,
  deleteImageFromStorage,
  handleImageUpload,
  upload
};
