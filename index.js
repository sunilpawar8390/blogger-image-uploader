// Root endpoint - API documentation
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    name: 'Blogger Image Uploader API',
    version: '1.0.0',
    description: 'Serverless API to upload WordPress post images to Google Drive',
    endpoints: {
      'GET /': 'API documentation (this page)',
      'GET /api/hello': 'Test endpoint - returns Hello World',
      'POST /api/process': 'Main endpoint - processes WordPress post images'
    },
    usage: {
      endpoint: '/api/process',
      method: 'POST',
      body: {
        postUrl: 'WordPress post URL',
        password: 'API password (if configured)'
      }
    },
    github: 'https://github.com/sunilpawar8390/blogger-image-uploader'
  });
};
