# CSM — College Study Material Management System

A simple, fast, and easy-to-use study material platform for college students and faculty.

**Current scope:** Semester 5 · Java · NGDB · Software Testing · Cyber Security · ERP

---

## Project Structure

```
csm/
├── frontend/                   # Static HTML/CSS/JS — serve from any web host
│   ├── index.html              # Homepage (hero, recent uploads, subject grid)
│   ├── browse.html             # Student materials browser (search, filter, preview)
│   ├── faculty.html            # Faculty login, signup, upload, manage
│   └── public/
│       ├── css/
│       │   └── main.css        # Design tokens + all shared styles
│       └── js/
│           └── shared.js       # API client, auth helpers, toast, subjects config
│
└── backend/                    # Node.js + Express REST API
    ├── server.js               # Entry point
    ├── package.json
    ├── .env.example            # Copy to .env and fill in values
    ├── config/
    │   ├── db.js               # MongoDB connection
    │   └── cloudinary.js       # Cloudinary + Multer upload config
    ├── models/
    │   ├── Faculty.js          # Faculty schema (hashed passwords, subject)
    │   └── Material.js         # Material schema (semester→subject→category)
    ├── controllers/
    │   ├── authController.js   # Signup, login, getMe
    │   └── materialsController.js
    ├── routes/
    │   ├── auth.js
    │   └── materials.js
    └── middleware/
        └── auth.js             # JWT protect middleware
```

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (free tier works)

### 2. Backend setup

```bash
cd backend
cp .env.example .env          # Fill in your values
npm install
npm run dev                   # Starts on http://localhost:5000
```

Fill in `.env`:

```
MONGODB_URI=mongodb://localhost:27017/csm
JWT_SECRET=change_this_to_a_long_random_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend setup

The frontend is plain HTML — no build step needed.

**Option A — simple local server (recommended for dev):**
```bash
cd frontend
npx serve .            # Serves on http://localhost:3000
# OR
python3 -m http.server 3000
```

**Option B — VS Code Live Server:**
Open `frontend/index.html` with the Live Server extension.

Update the API URL in `frontend/public/js/shared.js`:
```js
const API_BASE = 'http://localhost:5000/api'; // dev
// const API_BASE = 'https://your-backend.railway.app/api'; // production
```

---

## API Endpoints

### Auth (rate-limited to 20 req / 15 min)

| Method | Path            | Auth     | Description          |
|--------|-----------------|----------|----------------------|
| POST   | /api/auth/signup | —        | Register faculty     |
| POST   | /api/auth/login  | —        | Login, get JWT       |
| GET    | /api/auth/me     | Bearer   | Get logged-in faculty|

### Materials

| Method | Path                      | Auth   | Description                    |
|--------|---------------------------|--------|--------------------------------|
| GET    | /api/materials            | —      | List (filter: semester, subject, category, search) |
| GET    | /api/materials/recent     | —      | Latest 5 materials             |
| GET    | /api/materials/:id        | —      | Single material                |
| GET    | /api/materials/faculty/mine | Bearer | My uploads                  |
| POST   | /api/materials            | Bearer | Upload (multipart/form-data)   |
| PUT    | /api/materials/:id        | Bearer | Update title/category          |
| DELETE | /api/materials/:id        | Bearer | Delete (removes from Cloudinary too) |

---

## Allowed File Types

PDF · DOC · DOCX · PPT · PPTX · ZIP (max 50 MB)

---

## Adding More Semesters (Future)

The data model already supports semesters 1–6. When you're ready:

1. Add the semester's subjects to `SUBJECTS` in `frontend/public/js/shared.js`.
2. Update the `subject` enum in `backend/models/Faculty.js` and `Material.js`.
3. Add a semester selector UI to `browse.html` and `faculty.html` (filter by `semester`).

No structural changes required — the schema, API, and routes handle it already.

---

## Deployment

### Backend — Railway / Render / Fly.io

```bash
# Set these environment variables in your hosting dashboard:
PORT, NODE_ENV=production, MONGODB_URI, JWT_SECRET,
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, FRONTEND_URL
```

### Frontend — Netlify / Vercel / GitHub Pages

Drag-and-drop the `frontend/` folder. Update `API_BASE` in `shared.js` to your production backend URL.

---

## Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Frontend       | HTML · CSS · Vanilla JavaScript   |
| Backend        | Node.js · Express.js              |
| Database       | MongoDB · Mongoose                |
| File Storage   | Cloudinary                        |
| Authentication | JWT · bcrypt                      |
| File Upload    | Multer + multer-storage-cloudinary|

---

## Design

Preserves the filing-cabinet / library aesthetic from the original design:
- `--manila` card backgrounds, `--stamp` typeface, drawer accordion pattern
- Subject colour coding: Java (gold), NGDB (slate blue), Testing (sage), Cyber (terracotta), ERP (mauve)
- Stamp animation on login/signup
- Toast notifications for all actions
- Mobile-friendly with hamburger nav
