# Vercel Deployment Guide - Blogger Image Uploader API

## 📋 Overview
This guide walks you through deploying the Blogger Image Uploader API as serverless functions on Vercel.

## ✅ Project Structure (Correct)
```
blogger-image-uploader/
├── index.js              ← Root endpoint (API documentation)
├── package.json          ← Dependencies configuration
├── package-lock.json     ← Lock file
├── .gitignore           ← Ignore sensitive files
└── api/                 ← Serverless functions folder
    ├── hello.js         ← Test endpoint (GET /api/hello)
    ├── process.js       ← Main endpoint (POST /api/process)
    └── .env.example     ← Example environment variables
```

## 🚀 Deployment Steps

### Step 1: Configure Vercel Project Settings

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `blogger-image-uploader`
3. **Click "Settings"** in the top menu
4. **Go to "General"** tab
5. **Find "Build & Development Settings"** section
6. **Configure as follows**:
   - ✅ **Framework Preset**: `Other` (NOT Next.js, NOT any framework)
   - ✅ **Root Directory**: `./` (leave empty or select root)
   - ✅ **Build Command**: Leave **EMPTY** (no build needed)
   - ✅ **Output Directory**: Leave **EMPTY** (no output needed)
   - ✅ **Install Command**: `npm install` (default)

7. **Click "Save"**

### Step 2: Configure Environment Variables

1. In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add the following variables:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | Production, Preview, Development |
   | `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret | Production, Preview, Development |
   | `GOOGLE_REFRESH_TOKEN` | Your Google Refresh Token | Production, Preview, Development |
   | `API_PASSWORD` | Your API password (optional) | Production, Preview, Development |

3. **Click "Save"** for each variable

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click the **3 dots menu** (⋯) on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (1-2 minutes)

## 🧪 Testing Your Deployment

### Test 1: Root Endpoint (Documentation)
```bash
curl https://blogger-image-uploader.vercel.app/
```

**Expected Response:**
```json
{
  "name": "Blogger Image Uploader API",
  "version": "1.0.0",
  "endpoints": {
    "GET /": "API documentation",
    "GET /api/hello": "Test endpoint",
    "POST /api/process": "Main endpoint"
  }
}
```

### Test 2: Hello World Endpoint
```bash
curl https://blogger-image-uploader.vercel.app/api/hello
```

**Expected Response:**
```json
{
  "message": "Hello World",
  "status": "API is working!",
  "timestamp": "2026-01-15T12:00:00.000Z"
}
```

### Test 3: Main Process Endpoint
```bash
curl -X POST https://blogger-image-uploader.vercel.app/api/process \
  -H "Content-Type: application/json" \
  -d '{
    "postUrl": "https://example.com/wordpress-post",
    "password": "your-api-password"
  }'
```

## 📝 API Endpoints

### 1. GET `/` - API Documentation
Returns API information and available endpoints.

### 2. GET `/api/hello` - Test Endpoint
Simple endpoint to verify deployment is working.

### 3. POST `/api/process` - Main Image Processor
Extracts images from WordPress posts and uploads to Google Drive.

**Request Body:**
```json
{
  "postUrl": "https://your-wordpress-site.com/post-url",
  "password": "your-api-password"
}
```

**Success Response:**
```json
{
  "success": true,
  "imageUrl": "https://lh3.googleusercontent.com/d/FILE_ID",
  "filename": "push-image-1234567890.jpg",
  "fileId": "DRIVE_FILE_ID",
  "message": "Image uploaded to Google Drive successfully."
}
```

## 🔧 Troubleshooting

### Issue: "No Output Directory named 'public' found"
**Solution**:
- Go to Project Settings → Build & Development Settings
- Set Framework Preset to **"Other"**
- Leave Build Command and Output Directory **EMPTY**
- Redeploy

### Issue: "404 NOT_FOUND"
**Solution**:
- Verify `/api` folder exists at project root (lowercase)
- Check that API files export a function: `module.exports = (req, res) => {...}`
- Make sure Root Directory is set to `./` in Vercel settings

### Issue: "500 Internal Server Error"
**Solution**:
- Check Environment Variables are set correctly in Vercel Dashboard
- View Function Logs in Vercel Dashboard → Deployments → Click deployment → Logs
- Verify Google OAuth credentials are valid

### Issue: API works locally but not on Vercel
**Solution**:
- Remove any `vercel.json` file (let Vercel auto-detect)
- Ensure you're using CommonJS (`module.exports`), not ES6 modules
- Check Node.js version in `package.json` engines field

## 📚 Important Notes

1. **No vercel.json needed**: Vercel auto-detects serverless functions in `/api` folder
2. **File-based routing**: Each `.js` file in `/api` becomes an endpoint
3. **Node.js version**: Using Node 20.x for stability
4. **Environment variables**: Must be set in Vercel Dashboard, not in code
5. **Cold starts**: First request may be slower (~1-2 seconds)
6. **Execution limits**: Vercel serverless functions have 10-second timeout on Hobby plan

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Functions Docs: https://vercel.com/docs/functions
- Project Repository: https://github.com/sunilpawar8390/blogger-image-uploader
- Vercel Support: https://vercel.com/support

## ✅ Deployment Checklist

- [ ] Framework Preset set to "Other"
- [ ] Build Command is EMPTY
- [ ] Output Directory is EMPTY
- [ ] Root Directory is `./`
- [ ] All Environment Variables are set
- [ ] `/api` folder exists at project root
- [ ] No `vercel.json` file in project
- [ ] `index.js` exists at root
- [ ] Redeployed after configuration changes
- [ ] Tested all endpoints

## 🎉 Success!

If all tests pass, your API is successfully deployed! You can now use it in your applications.

**Live URLs:**
- API Documentation: `https://blogger-image-uploader.vercel.app/`
- Test Endpoint: `https://blogger-image-uploader.vercel.app/api/hello`
- Main Endpoint: `https://blogger-image-uploader.vercel.app/api/process`

---

**Last Updated**: January 15, 2026
**Deployed By**: Claude Sonnet 4.5
