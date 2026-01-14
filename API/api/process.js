const axios = require('axios');
const { google } = require('googleapis');

const OAuth2 = google.auth.OAuth2;

// Initialize OAuth2 client
const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const blogger = google.blogger({
  version: 'v3',
  auth: oauth2Client
});

// Debug logging
console.log('Environment Variables Check:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing');
console.log('GOOGLE_REFRESH_TOKEN:', process.env.GOOGLE_REFRESH_TOKEN ? 'Set' : 'Missing');
console.log('BLOGGER_BLOG_ID:', process.env.BLOGGER_BLOG_ID ? process.env.BLOGGER_BLOG_ID : 'Missing');

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

// Helper function to upload image to Google Drive and get CDN URL
async function uploadImageToDrive(imageBuffer) {
  try {
    const timestamp = Date.now();
    const filename = `push-image-${timestamp}.jpg`;

    const media = {
      mimeType: 'image/jpeg',
      body: imageBuffer
    };

    // Upload to Google Drive
    const driveResponse = await drive.files.create({
      resource: {
        name: filename,
        parents: ['root'], // Upload to root folder
        mimeType: 'image/jpeg'
      },
      media: media,
      fields: 'id, webViewLink, webContentLink, webViewLink'
    });

    return {
      fileId: driveResponse.data.id,
      webViewLink: driveResponse.data.webViewLink,
      webContentLink: driveResponse.data.webContentLink
    };
  } catch (error) {
    throw new Error(`Failed to upload to Google Drive: ${error.message}`);
  }
}

// Helper function to upload image to Blogger
async function uploadImageToBlogger(imageBuffer) {
  try {
    const timestamp = Date.now();

    // First upload to Google Drive
    const driveResult = await uploadImageToDrive(imageBuffer);

    // Create Blogger post with Drive image
    const postContent = `
<div style="text-align: center; margin: 20px 0;">
  <img src="${driveResult.webViewLink}"
       alt="Push notification image"
       style="max-width: 100%; height: auto;" />
</div>

<div style="font-size: 12px; color: #666; margin-top: 20px; text-align: center;">
  <p>📱 Generated for push notification - ${new Date().toLocaleString()}</p>
  <p>🔗 Original: [View in Drive](${driveResult.webViewLink})</p>
</div>
    `;

    const post = {
      title: `Push Image ${timestamp}`,
      content: postContent,
      labels: ['push-image', 'drive-upload', 'temp'],
      status: 'draft'
    };

    // Create the post
    const response = await blogger.posts.insert({
      blogId: process.env.BLOGGER_BLOG_ID,
      resource: post
    });

    // Extract the image URL from Blogger's response
    const postContentHtml = response.data.content;
    const imageUrlMatch = postContentHtml.match(/src="([^"]+)"/);

    if (imageUrlMatch && imageUrlMatch[1]) {
      return imageUrlMatch[1]; // Return the actual Blogger CDN URL
    }

    throw new Error('Could not extract image URL from Blogger response');
  } catch (error) {
    throw new Error(`Failed to upload image to Blogger: ${error.message}`);
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

        // Upload to Blogger
        const bloggerImageUrl = await uploadImageToBlogger(imageBuffer);

        // Return response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          imageUrl: bloggerImageUrl,
          originalImage: imageUrl,
          blogId: process.env.BLOGGER_BLOG_ID
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
      message: 'Blogger Image Uploader API',
      endpoints: {
        'POST /api/process': 'Process WordPress post URL'
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