const axios = require('axios');
const { google } = require('googleapis');

const OAuth2 = google.auth.OAuth2;

// Validate environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
  console.error('ERROR: Missing required environment variables!');
  console.error('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'MISSING');
  console.error('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'MISSING');
  console.error('GOOGLE_REFRESH_TOKEN:', process.env.GOOGLE_REFRESH_TOKEN ? 'Set' : 'MISSING');
  console.error('Please check your .env file and restart the server.');
  process.exit(1);
}

// Set API password (optional - if not set, no authentication required)
const API_PASSWORD = process.env.API_PASSWORD || null;

// Helper function to validate API password
function validatePassword(password) {
  if (!API_PASSWORD) {
    return true; // No password required
  }
  return password === API_PASSWORD;
}

// Initialize OAuth2 client
const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

// Set credentials
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

// Initialize Google Drive client
const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
});

// Debug logging
console.log('✓ Environment Variables Loaded:');
console.log('  GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...');
console.log('  GOOGLE_CLIENT_SECRET:', '***' + process.env.GOOGLE_CLIENT_SECRET.slice(-4));
console.log('  GOOGLE_REFRESH_TOKEN:', '***' + process.env.GOOGLE_REFRESH_TOKEN.slice(-10));
console.log('  API_PASSWORD:', API_PASSWORD ? 'Set (authentication enabled)' : 'Not set (authentication disabled)');
console.log('✓ OAuth2 client initialized');
console.log('✓ Google Drive API ready');

// Helper function to validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Helper function to extract image URLs from HTML
function extractImageUrls(html, baseUrl) {
  const imageUrls = [];

  // Extract og:image
  const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
  if (ogImageMatch) {
    let imageUrl = ogImageMatch[1];
    if (!imageUrl.startsWith('http')) {
      imageUrl = new URL(imageUrl, baseUrl).href;
    }
    imageUrls.push(imageUrl);
  }

  // Extract featured image (WordPress specific)
  const featuredImageMatch = html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/);
  if (featuredImageMatch) {
    let imageUrl = featuredImageMatch[1];
    if (!imageUrl.startsWith('http')) {
      imageUrl = new URL(imageUrl, baseUrl).href;
    }
    imageUrls.push(imageUrl);
  }

  // Extract first img tag
  const firstImgMatch = html.match(/<img[^>]+src="([^"]+)"/);
  if (firstImgMatch) {
    let imageUrl = firstImgMatch[1];
    if (!imageUrl.startsWith('http')) {
      imageUrl = new URL(imageUrl, baseUrl).href;
    }
    imageUrls.push(imageUrl);
  }

  return imageUrls;
}

// Helper function to download image
async function downloadImage(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BloggerImageUploader/1.0)'
      }
    });

    // Validate image size (max 5MB)
    const sizeInMB = Buffer.byteLength(response.data) / (1024 * 1024);
    if (sizeInMB > 5) {
      throw new Error('Image size exceeds 5MB limit');
    }

    return response.data;
  } catch (error) {
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

// Helper function to detect image MIME type from buffer
function detectImageMimeType(imageBuffer) {
  // Check magic numbers to detect image type
  if (imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8 && imageBuffer[2] === 0xFF) {
    return 'image/jpeg';
  } else if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50 && imageBuffer[2] === 0x4E && imageBuffer[3] === 0x47) {
    return 'image/png';
  } else if (imageBuffer[0] === 0x47 && imageBuffer[1] === 0x49 && imageBuffer[2] === 0x46) {
    return 'image/gif';
  } else if (imageBuffer[0] === 0x52 && imageBuffer[1] === 0x49 && imageBuffer[2] === 0x46 && imageBuffer[3] === 0x46) {
    return 'image/webp';
  }
  return 'image/jpeg'; // Default fallback
}

// Helper function to get file extension from MIME type
function getFileExtension(mimeType) {
  const extensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  };
  return extensions[mimeType] || 'jpg';
}

// Helper function to find or create "WordPress Thumbnails" folder
async function getOrCreateFolder(folderName = 'WordPress Thumbnails') {
  try {
    console.log(`Looking for folder: ${folderName}`);

    // Search for existing folder
    const response = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (response.data.files && response.data.files.length > 0) {
      const folderId = response.data.files[0].id;
      console.log(`Found existing folder with ID: ${folderId}`);
      return folderId;
    }

    // Create folder if it doesn't exist
    console.log(`Folder not found. Creating new folder: ${folderName}`);
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id, name'
    });

    console.log(`Created folder with ID: ${folder.data.id}`);
    return folder.data.id;

  } catch (error) {
    console.error('Error getting/creating folder:', error);
    throw new Error(`Failed to get/create folder: ${error.message}`);
  }
}

// Helper function to upload image to Google Drive and get direct URL
async function uploadImageToDrive(imageBuffer) {
  try {
    const timestamp = Date.now();
    const mimeType = detectImageMimeType(imageBuffer);
    const extension = getFileExtension(mimeType);
    const filename = `push-image-${timestamp}.${extension}`;

    console.log(`Uploading image to Google Drive: ${filename}`);

    // Get or create "WordPress Thumbnails" folder
    const folderId = await getOrCreateFolder('WordPress Thumbnails');

    // Convert buffer to stream
    const { Readable } = require('stream');
    const stream = Readable.from(imageBuffer);

    // Upload to Google Drive in the specified folder
    const driveResponse = await drive.files.create({
      requestBody: {
        name: filename,
        mimeType: mimeType,
        parents: [folderId] // Upload to "WordPress Thumbnails" folder
      },
      media: {
        mimeType: mimeType,
        body: stream
      },
      fields: 'id, name, mimeType, webViewLink, webContentLink'
    });

    const fileId = driveResponse.data.id;
    console.log(`File uploaded to Drive with ID: ${fileId}`);

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    console.log('File permissions set to public');

    // Get multiple URL formats for compatibility
    // Format 1: Best for embedding in images/notifications (GoogleUserContent)
    const googleusercontent = `https://lh3.googleusercontent.com/d/${fileId}`;

    // Format 2: Alternative download format
    const driveDownload = `https://drive.google.com/uc?id=${fileId}`;

    // Format 3: Thumbnail format (if needed)
    const driveThumbnail = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

    return {
      fileId: fileId,
      filename: filename,
      directImageUrl: googleusercontent, // Best for embedding/previews
      alternativeUrls: {
        driveDownload: driveDownload,
        driveThumbnail: driveThumbnail
      },
      webViewLink: driveResponse.data.webViewLink
    };

  } catch (error) {
    console.error('Drive upload error:', error);
    throw new Error(`Failed to upload to Google Drive: ${error.message}`);
  }
}


// Create HTTP server
const http = require('http');

const server = http.createServer(async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route handling
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  if (parsedUrl.pathname === '/api/process' && req.method === 'POST') {
    // Handle /api/process endpoint
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        // Check authentication
        if (!validatePassword(data.password)) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Authentication failed',
            message: 'Invalid or missing password'
          }));
          return;
        }

        // Validate input
        if (!data.postUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Post URL is required' }));
          return;
        }

        if (!isValidUrl(data.postUrl)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid URL format' }));
          return;
        }

        // Fetch WordPress post HTML
        let html;
        try {
          const response = await axios.get(data.postUrl, {
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; BloggerImageUploader/1.0)'
            }
          });
          html = response.data;
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to fetch WordPress post' }));
          return;
        }

        // Extract image URLs
        const baseUrl = new URL(data.postUrl).origin;
        const imageUrls = extractImageUrls(html, baseUrl);

        if (imageUrls.length === 0) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No images found in the post' }));
          return;
        }

        // Use the first available image URL
        const imageUrl = imageUrls[0];

        // Download image
        const imageBuffer = await downloadImage(imageUrl);

        // Upload to Google Drive only
        console.log('Uploading image to Google Drive...');
        const driveResult = await uploadImageToDrive(imageBuffer);
        console.log('Upload complete!');

        // Return response with direct image URL from Drive
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          imageUrl: driveResult.directImageUrl, // Best URL for embedding/previews
          filename: driveResult.filename,
          fileId: driveResult.fileId,
          alternativeUrls: driveResult.alternativeUrls, // Additional URL formats
          driveViewLink: driveResult.webViewLink,
          originalImage: imageUrl,
          message: 'Image uploaded to Google Drive successfully.'
        }));

      } catch (error) {
        console.error('API Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;

  } else if (parsedUrl.pathname === '/' && req.method === 'GET') {
    // Simple root endpoint for testing
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Google Drive Image Uploader API',
      description: 'Upload WordPress post images to Google Drive',
      endpoints: {
        'POST /api/process': 'Process WordPress post URL and upload image to Drive'
      }
    }));
    return;

  } else {
    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GET  http://localhost:${PORT}/`);
  console.log(`POST http://localhost:${PORT}/api/process`);
});