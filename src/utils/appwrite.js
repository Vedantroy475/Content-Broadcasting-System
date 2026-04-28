const { Client, Storage, ID} = require('node-appwrite');
const { InputFile } = require('node-appwrite/file');
const env = require('../config/env');

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(env.APPWRITE_ENDPOINT)
  .setProject(env.APPWRITE_PROJECT_ID)
  .setKey(env.APPWRITE_API_KEY);

// Initialize Storage instance
const storage = new Storage(client);

// Export for use in services
module.exports = {
  client,
  storage,
  ID,
  InputFile,
};