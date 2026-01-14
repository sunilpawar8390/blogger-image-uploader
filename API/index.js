// Load environment variables from .env file for local development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Start the API server
require('./api/process.js');