# Deployment Guide

## 🚀 Quick Start

### 1. Get Google Cloud Credentials

Follow the [API Setup Guide](./API/SETUP.md) to get:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `BLOGGER_BLOG_ID`

### 2. Environment Variables Setup

#### Option A: Vercel Dashboard (Recommended)

1. Deploy API to Vercel
2. Go to Vercel Dashboard → Project Settings → Environment Variables
3. Add these variables:

| Variable | Value |
|----------|-------|
| `GOOGLE_CLIENT_ID` | Your Google Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret |
| `GOOGLE_REFRESH_TOKEN` | Your Refresh Token |
| `BLOGGER_BLOG_ID` | Your Blog ID |

#### Option B: Local Development

Copy the environment files and fill in your values:

```bash
# API
cd API
cp .env.example .env
# Edit .env with your values

# UI
cd UI
# No local env needed, uses environment.ts
```

## 🌐 Deployment Instructions

### Vercel Deployment (1-Click)

#### API Only
```bash
cd API
vercel
```

#### UI Only
```bash
cd UI
vercel
```

#### Full Stack (Both API & UI in one project)

1. Create a new Vercel project
2. Link both API and UI to the same repo
3. Set environment variables
4. Deploy

### Manual Deployment

#### API Deployment

1. **Install dependencies**
   ```bash
   cd API
   npm install
   ```

2. **Set environment variables**
   - Create `.env` from `.env.example`
   - Fill in your Google credentials

3. **Deploy**
   - Vercel: `vercel`
   - Heroku: `heroku create`
   - AWS Lambda: Package and deploy

#### UI Deployment

1. **Install dependencies**
   ```bash
   cd UI
   npm install
   ```

2. **Build for production**
   ```bash
   ng build --configuration production
   ```

3. **Deploy**
   - Vercel: `vercel`
   - Netlify: `netlify deploy --prod`
   - GitHub Pages: Copy `dist` folder to gh-pages branch

## 🔧 Environment Variables Reference

### API Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ | 123456789012.apps.googleusercontent.com |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ✅ | your-secret-key |
| `GOOGLE_REFRESH_TOKEN` | OAuth refresh token | ✅ | 1/xxxxxxxx... |
| `BLOGGER_BLOG_ID` | Your Blogger blog ID | ✅ | 1234567890 |

### UI Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `API_URL` | Custom API endpoint | ❌ | `/api/process` |

## 📋 Pre-Deployment Checklist

- [ ] Google Cloud project created
- [ ] Blogger API v3 enabled
- [ ] OAuth credentials created
- [ ] Refresh token generated
- [ ] Blog ID obtained
- [ ] All environment variables set
- [ ] Dependencies installed (API & UI)
- [ ] API tested locally (optional)
- [ ] UI running locally (optional)

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid credentials" error**
   - Check your OAuth credentials in Vercel
   - Verify the refresh token is valid

2. **"Blog not found" error**
   - Confirm BLOGGER_BLOG_ID is correct
   - Check if you have access to the blog

3. **Image upload fails**
   - Verify OAuth scope includes blogger
   - Check image size (< 5MB)

4. **CORS errors**
   - API should be on same domain as UI
   - Use relative path `/api/process`

### Testing Your Setup

1. **Test API locally**
   ```bash
   cd API
   node api/process.js
   # Send POST request to http://localhost:3000/api/process
   ```

2. **Test UI locally**
   ```bash
   cd UI
   ng serve
   # Open http://localhost:4200
   ```

## 🎯 Production Considerations

### Security
- Never commit `.env` files
- Use Vercel's environment variables
- Rotate OAuth credentials periodically

### Performance
- Vercel's free tier is sufficient for testing
- Upgrade to Pro for production use
- Monitor API usage

### Maintenance
- Refresh tokens expire (every ~6 months)
- Monitor for Google API changes
- Keep dependencies updated

## 📞 Support

Need help?
- Check [API Guide](./Readme/API_Guide.md)
- Check [UI Guide](./Readme/UI_Guide.md)
- Open an issue on GitHub

---

Happy deploying! 🚀