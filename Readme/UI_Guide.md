# UI Guide – Angular Frontend (Vercel)

## Purpose

This document defines the **UI roadmap** for building the Angular-based frontend for the Push Image Generator tool. The UI will allow users to paste a WordPress post URL and receive a Blogger-hosted image URL suitable for push notifications.

---

## Phase 0 – Prerequisites

- Node.js LTS installed
- Angular CLI (v16+ recommended)
- Vercel account
- Git repository

---

## Phase 1 – Project Setup

### 1. Create Angular App

```bash
ng new push-image-ui --routing --style=scss
cd push-image-ui
```

### 2. Basic Project Structure

```
src/
 ├── app/
 │   ├── pages/
 │   │   └── generator/
 │   │       ├── generator.component.ts
 │   │       ├── generator.component.html
 │   │       └── generator.component.scss
 │   ├── services/
 │   │   └── image.service.ts
 │   └── app.module.ts
```

---

## Phase 2 – UI Design

### Screen: Push Image Generator

**Inputs**

- WordPress Post URL (text input)

**Actions**

- Generate Image button

**Outputs**

- Blogger Image URL (read-only input)
- Copy to clipboard button
- Preview image (optional)

---

## Phase 3 – Angular Component Logic

### generator.component.ts (Responsibilities)

- Form validation
- Call backend API `/api/process`
- Handle loading and error states
- Display returned image URL

### Validation Rules

- URL required
- Must start with http/https

---

## Phase 4 – API Integration

### image.service.ts

Responsibilities:

- POST request to backend
- Handle JSON response

Example flow:

```ts
POST / api / process;
{
  postUrl: string;
}
```

Response:

```json
{
  "imageUrl": "https://blogger.googleusercontent.com/..."
}
```

---

## Phase 5 – UX Enhancements

- Loading spinner
- Error messages (invalid URL, API failure)
- Success toast
- Copy-to-clipboard feedback

---

## Phase 6 – Environment Configuration

Use relative API path:

```
/api/process
```

(no environment switch needed for Vercel)

---

## Phase 7 – Build & Deploy (Vercel)

### Build Command

```bash
ng build --configuration production
```

### Output Directory

```
dist/push-image-ui
```

Vercel will auto-detect static build.

---

## Phase 8 – AI Agent Development Notes

AI Agent can independently:

- Generate Angular components
- Add validation logic
- Integrate HTTP service
- Improve UI/UX styling

---

## Done Criteria

- User can generate Blogger image URL
- UI deployed on Vercel
- Works with serverless API

---

End of UI Guide
