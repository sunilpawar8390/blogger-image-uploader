# Blogger Image Uploader API - Setup Guide

## Prerequisites

Before running this API, you need to:

### 1. Google Cloud Project Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Blogger API v3**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Blogger API"
   - Enable it for your project

### 2. OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: **Web application**
4. Authorized redirect URIs: `https://developers.google.com/oauthplayground`
5. Click "Create"

### 3. Generate Refresh Token

1. Go to [Google OAuth Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon ⚙️ and select "Use your own OAuth credentials"
3. Enter Client ID and Client Secret from step 2
4. In "Step 1", select the scope:
   ```
   https://www.googleapis.com/auth/blogger
   ```
5. Click "Authorize APIs"
6. Grant permission when prompted
7. In "Step 2", click "Exchange authorization code for tokens"
8. Copy the **Refresh Token**

### 4. Blogger Blog ID

1. Go to [Blogger](https://blogger.com/)
2. Create a test blog (or use an existing one)
3. Go to "Settings" > "Basic"
4. Copy the **Blog ID** from the URL:
   ```
   https://www.blogger.com/blogger.g?blogID=YOUR_BLOG_ID
   ```

### 5. Environment Variables

Create a `.env` file in the API directory:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
BLOGGER_BLOG_ID=your_blog_id_here
```

### 6. Install Dependencies

```bash
cd api
npm install
```

### 7. Test the API

You can test the API using curl:

```bash
curl -X POST \
  http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -d '{"postUrl": "https://your-wordpress-site.com/your-post"}'
```

## Deployment to Vercel

1. Push the code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import the repository
4. Add the environment variables in Vercel dashboard:
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - GOOGLE_REFRESH_TOKEN
   - BLOGGER_BLOG_ID
5. Deploy

## API Usage

### Endpoint
```
POST /api/process
```

### Request Body
```json
{
  "postUrl": "https://example.com/post"
}
```

### Success Response
```json
{
  "imageUrl": "https://blogger.googleusercontent.com/img/...",
  "originalImage": "https://example.com/wp-content/uploads/image.jpg",
  "blogId": "your_blog_id_here"
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## Notes

- Maximum image size: 5MB
- Function timeout: ~10 seconds
- Creates a draft post with the uploaded image
- The draft post can be deleted manually from Blogger after you get the URL