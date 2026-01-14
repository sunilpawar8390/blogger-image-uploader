# Blogger Image Uploader

A serverless tool that converts WordPress post images to Blogger CDN URLs, optimized for mobile push notifications.

## 🚀 Purpose

When sending push notifications with images to large audiences (4M+ users), the original WordPress images may not load properly on mobile devices. This tool:

1. Fetches a WordPress post URL
2. Extracts the featured image
3. Uploads it to Google Blogger (as a private draft)
4. Returns a CDN-optimized URL for use in push notifications

## 📁 Project Structure

```
Blogger Image Uploader/
├── API/                           # Node.js serverless API (Vercel)
│   ├── api/
│   │   └── process.js             # Main API endpoint
│   ├── package.json
│   ├── vercel.json
│   ├── .gitignore
│   └── SETUP.md                  # Google Cloud setup guide
├── UI/                            # Angular frontend (Vercel)
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   └── generator/    # Main UI component
│   │   │   ├── services/
│   │   │   │   └── image.service.ts
│   │   │   ├── utils/
│   │   │   │   └── copy-to-clipboard.utils.ts
│   │   │   └── app.module.ts
│   │   ├── index.html
│   │   └── styles.scss
│   ├── package.json
│   ├── angular.json
│   ├── vercel.json
│   └── .gitignore
├── Readme/
│   ├── API_Guide.md
│   └── UI_Guide.md
└── README.md                      # This file
```

## 🛠️ API Setup

### Prerequisites

1. **Google Cloud Account**
   - Create a new project
   - Enable Blogger API v3
   - Create OAuth 2.0 credentials (Web App)
   - Generate refresh token

2. **Blogger Blog**
   - Create a test blog (can be private)
   - Get Blog ID from URL

### Environment Variables

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
BLOGGER_BLOG_ID=your_blog_id
```

### API Endpoints

```
POST /api/process

Request:
{
  "postUrl": "https://example.com/post"
}

Response:
{
  "imageUrl": "https://blogger.googleusercontent.com/img/...",
  "originalImage": "https://example.com/wp-content/uploads/image.jpg",
  "blogId": "your_blog_id"
}

Error Response:
{
  "error": "Error message"
}
```

## 🎨 UI Setup

### Prerequisites

- Node.js 18+
- Angular CLI

### Install Dependencies

```bash
cd UI
npm install
```

### Development

```bash
ng serve
```

### Build

```bash
ng build --configuration production
```

## 🚀 Deployment

### Vercel (Recommended)

1. **API Deployment**
   ```bash
   cd API
   vercel
   ```
   - Add environment variables in Vercel dashboard

2. **UI Deployment**
   ```bash
   cd UI
   vercel
   ```
   - Frontend will be deployed as a static site

### Manual Build

1. Build the UI:
   ```bash
   cd UI
   npm install
   ng build
   ```

2. Deploy both frontend and backend to your preferred hosting

## 📱 Features

### API Features
- ✅ Fetch WordPress post HTML
- ✅ Extract images (og:image, twitter:image, first img)
- ✅ Download images with size validation (max 5MB)
- ✅ Upload to Blogger via OAuth 2.0
- ✅ Return CDN-optimized URL
- ✅ Comprehensive error handling
- ✅ CORS support

### UI Features
- 🎯 Clean, responsive interface
- 📋 URL validation
- 🔄 Loading states
- 📋 Image preview
- 📋 Copy to clipboard
- 🔔 Toast notifications
- 📱 Mobile optimized

## 🔧 Usage

1. Enter a WordPress post URL
2. Click "Generate Image URL"
3. Wait for processing (10-15 seconds)
4. Copy the returned Blogger URL
5. Use the URL in your Larapush notifications

## ⚠️ Important Notes

- Creates private draft posts in Blogger (can be deleted manually)
- Maximum image size: 5MB
- Processing time: ~10 seconds
- Uses your own Blogger account storage
- No cost within free Vercel limits

## 🔒 Security

- OAuth refresh token stored securely in environment variables
- No hardcoded credentials
- CORS properly configured
- Input validation on all endpoints

## 📊 Performance

- Serverless architecture (Vercel)
- Fast image processing (< 10 seconds)
- Efficient memory usage
- Global CDN distribution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please open an issue in the GitHub repository.

---

**Happy image uploading! 🎉**