# CourseForge AI (Prototype)

CourseForge AI is a first-prototype MVP that turns any topic into a structured, lesson-based course in seconds.

The core goal is to combine AI engineering with a full-stack product experience so course creation becomes dramatically faster and more usable than raw chat outputs.

## Project Overview

Most AI tools return plain text. CourseForge AI focuses on producing learning-ready structure:

- Course title and modular lessons
- Rich lesson content with headings, lists, and code blocks
- Key points for retention and review
- Persistent storage + interactive dashboard UX

## What I Engineered

- Prompt design + strict schema guidance for structured JSON outputs
- Robust JSON parsing and repair path for malformed model responses
- Automatic lesson expansion when generated content is too short
- End-to-end pipeline from AI generation to persistence to UI rendering

## Product Features (Current)

- AI-generated lessons with headings, key points, and code blocks
- Authenticated course dashboard with progress tracking
- Course CRUD with MongoDB persistence
- Responsive frontend for generation and learning flow

## Highlights (Videos and Images)

### Demo Video

- Clickable to Download Video:

[![CourseForge AI Demo](https://res.cloudinary.com/dxka218ey/image/upload/v1774331764/lfgz2wkz0bjgwu1j1blm.png)](https://res.cloudinary.com/dxka218ey/video/upload/v1774331834/f8vrqouzgsathdhh5xsr.mov)

### Product Screenshots

Replace placeholder image paths below with your real screenshots.

| Home | Course Generation | Dashboard |
| --- | --- | --- |
| <img src="https://res.cloudinary.com/dxka218ey/image/upload/v1774331777/jgudrzdnqyfxwsyl0elk.png" alt="CourseForge Home" width="320" /> | <img src="https://res.cloudinary.com/dxka218ey/image/upload/v1774331785/d49fhy6fqktlrgurzoie.png" alt="CourseForge Generation" width="320" /> | <img src="https://res.cloudinary.com/dxka218ey/image/upload/v1774331764/lhvrz45du2lnr7ces4ub.png" alt="CourseForge Dashboard" width="320" /> |


## Tech Stack

- Frontend: React, Vite, Tailwind CSS, shadcn/ui
- Backend: Node.js, Express, MongoDB, JWT authentication
- AI Layer: Groq Chat Completions API

## Architecture (High Level)

1. User submits course generation parameters.
2. Backend prompts model for strict JSON lesson output.
3. Parser validates and repairs response if needed.
4. Short lessons are expanded automatically.
5. Final course is stored in MongoDB and shown in dashboard.

## Monorepo Structure

- backend: API, auth, generation pipeline, persistence
- frontend: UI, course dashboard, auth screens

## Getting Started

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

Backend env file at backend/.env:

```env
PORT=5005
MONGODB_URI=mongodb://localhost:27017/courseforge
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

Frontend env file at frontend/.env:

```env
VITE_API_URL=http://localhost:5005/api
```

### 3. Run the app

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

Frontend runs on Vite default port and connects to backend API using VITE_API_URL.

## API Notes

- GET /api/health: health check
- POST /api/courses/generate: generate a new course
- GET /api/courses: list authenticated user courses
- GET /api/courses/:id: fetch one course
- DELETE /api/courses/:id: delete one course

## Prototype Safety Guard

Because signup and abuse controls are still early-stage, the backend currently enforces a global model-call cap:

- 10 Groq API requests per hour shared across all users (server-wide)

This is temporary and will be replaced with stronger per-user controls.

## Coming Next

- Quiz generation
- Subjective assessment questions
- Coding challenges

## Why This Project

This prototype explores how AI systems can generate structured learning experiences instead of generic text responses, with emphasis on reliability, UX, and real product flow.
