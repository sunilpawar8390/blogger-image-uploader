// Load environment variables from .env file
require('dotenv').config();

console.log('Loading environment variables...');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

// Start the API server
require('./api/process.js');