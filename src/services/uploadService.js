const { storage, ID, InputFile } = require('../utils/appwrite');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * Uploads a file to Appwrite Storage
 * @param {Object} file - The file object from multer (contains buffer and originalname)
 * @returns {Object} - Contains fileUrl, fileId, and other metadata
 */
const uploadToAppwrite = async (file) => {
  if (!file || !file.buffer) {
    throw new ApiError(400, 'No file provided for upload');
  }

  try {
    // Generate a unique ID for the file
    const fileId = ID.unique();

    // Create InputFile from buffer
    const inputFile = InputFile.fromBuffer(file.buffer, file.originalname);

    // Upload file to Appwrite Storage bucket
    const response = await storage.createFile(
      env.APPWRITE_BUCKET_ID,
      fileId,
      inputFile
    );

    // Generate the public file URL
    const fileUrl = `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${response.$id}/view?project=${env.APPWRITE_PROJECT_ID}`;

    return {
      fileUrl,
      fileId: response.$id,
      fileName: response.name,
      fileSize: response.sizeOriginal,
      mimeType: response.mimeType,
    };
  } catch (error) {
    console.error('Appwrite upload error:', error);
    throw new ApiError(500, 'Failed to upload file to storage');
  }
};

module.exports = {
  uploadToAppwrite,
};