const multer = require('multer');
const path = require('path');
const env = require('./env');

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

// Use memory storage (required for Appwrite buffer upload)
const storage = multer.memoryStorage();

/**
 * File filter for validating uploads
 */
const fileFilter = (req, file, cb) => {
  try {
    const mimeType = file.mimetype;
    const ext = path.extname(file.originalname).toLowerCase();

    const isMimeValid = ALLOWED_MIME_TYPES.includes(mimeType);
    const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

    if (isMimeValid && isExtValid) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Invalid file type. Only JPG, JPEG, PNG, and GIF files are allowed.'
        ),
        false
      );
    }
  } catch (error) {
    cb(new Error('File validation failed'), false);
  }
};

/**
 * Multer upload configuration
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE, // e.g. 10MB
  },
});

/**
 * Optional: Middleware to handle multer errors gracefully
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File size exceeds limit of ${env.MAX_FILE_SIZE / (1024 * 1024)} MB`,
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Custom fileFilter errors
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};

module.exports = {
  upload,
  handleMulterError,
};