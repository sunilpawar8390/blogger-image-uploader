# API Guide – Node.js Serverless (Vercel)

## Purpose

This document defines the **API roadmap** for building a Node.js serverless backend on Vercel that:

- Fetches a WordPress post image
- Uploads it to Blogger
- Returns a Google CDN image URL

---

## Phase 0 – Prerequisites

- Vercel account
- Google Cloud account
- Blogger blog created
- OAuth 2.0 credentials

---

## Phase 1 – Google Blogger Setup

### 1. Create Google Cloud Project

- Enable **Blogger API v3**

### 2. OAuth Credentials

- Create OAuth Client (Web App)
- Scopes:

```
https://www.googleapis.com/auth/blogger
```

### 3. Generate Refresh Token

- One-time OAuth consent
- Store refresh token securely

---

## Phase 2 – API Project Structure

```
/api
 └── process.ts
```

---

## Phase 3 – Environment Variables

Set in Vercel Dashboard:

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN
BLOGGER_BLOG_ID
```

---

## Phase 4 – API Responsibilities

### /api/process (POST)

**Input**

```json
{
  "postUrl": "https://example.com/post"
}
```

**Output**

```json
{
  "imageUrl": "https://blogger.googleusercontent.com/img/..."
}
```

---

## Phase 5 – Processing Steps

1. Validate input URL
2. Fetch WordPress HTML
3. Extract image URL (priority order):

   - og:image
   - featured image
   - first <img>

4. Download image to memory buffer
5. Authenticate using refresh token
6. Create draft Blogger post
7. Upload image
8. Extract Blogger CDN image URL
9. Return response

---

## Phase 6 – Error Handling

Handled errors:

- Invalid URL
- No image found
- Blogger API failure
- OAuth token refresh failure

Standard error response:

```json
{
  "error": "Readable message"
}
```

---

## Phase 7 – Performance & Limits

- Max image size: 5MB
- Function timeout: < 10 seconds
- Cache repeated URLs (recommended)

---

## Phase 8 – Security Best Practices

- Never expose OAuth secrets to frontend
- Use environment variables only
- Add basic rate limiting if public

---

## Phase 9 – Optional Enhancements

- Image resize (1200x628)
- Hash-based deduplication
- Bulk processing
- Larapush API auto-trigger

---

## Phase 10 – Deployment (Vercel)

- No server needed
- Push to GitHub
- Import project into Vercel
- Add env variables
- Deploy

---

## Phase 11 – AI Agent Development Notes

AI Agent can:

- Implement Blogger upload logic
- Add caching layer
- Optimize image handling
- Add logging & monitoring

---

## Done Criteria

- API returns stable Blogger image URL
- Secure OAuth handling
- Works under free Vercel limits

---

End of API Guide
