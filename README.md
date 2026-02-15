# Bookmark Manager

A full-stack Bookmark Manager web application with a REST API backend and a React frontend.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Node.js, Express.js                 |
| Frontend | React 18, Vite 5                    |
| Styling  | Vanilla CSS (custom properties)     |
| Testing  | Vitest, Supertest                   |
| Storage  | In-memory (array)                   |
| Extras   | express-rate-limit, uuid, cors      |

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm 9+ installed

### Install Dependencies

```bash
npm run install:all
```

This runs `npm install` in the root, `backend/`, and `frontend/` directories.

### Start the Application

```bash
npm start
```

This starts both servers concurrently:
- **Backend** → http://localhost:3001
- **Frontend** → http://localhost:5173

### Run Tests

```bash
npm test
```

Runs 13 unit tests covering POST, GET, PUT, and DELETE endpoints.

## Features

### Required
- **Bookmark List** — Displays title, clickable URL, description snippet (100 chars), and tags
- **Add Bookmark** — Form with URL, title, description, and tags (comma-separated). Client-side validation before submission
- **Edit Bookmark** — Form switches to edit mode with pre-filled values. Updates via PUT
- **Delete Bookmark** — Confirmation dialog before deletion
- **Filter by Tag** — Click any tag to filter. Shows active filter state with clear button. Uses API query parameter
- **Real-time Search** — Client-side filtering by title or URL. Case-insensitive

### Bonus
- **Automatic Metadata Fetching** — When adding a bookmark, leaving the URL field auto-fetches the page title
- **Dark Mode Toggle** — Persisted to localStorage
- **Rate Limiting** — 100 requests per 15-minute window via express-rate-limit
- **Unit Tests** — 13 test cases across 4 endpoint groups (POST, GET, PUT, DELETE)

## API Endpoints

| Method | Endpoint           | Status Codes      | Description                     |
|--------|--------------------|--------------------|--------------------------------|
| GET    | /bookmarks         | 200                | List all. `?tag=value` to filter |
| POST   | /bookmarks         | 201, 400           | Create with validation          |
| PUT    | /bookmarks/:id     | 200, 400, 404      | Update by ID                    |
| DELETE | /bookmarks/:id     | 204, 404           | Delete by ID                    |
| GET    | /metadata?url=     | 200, 400           | Fetch page title from URL       |

### Validation Rules
- `url` — Required, must be valid HTTP/HTTPS URL
- `title` — Required, max 200 characters
- `description` — Optional, max 500 characters
- `tags` — Optional, array of strings, max 5, auto-lowercased

## Project Structure

```
bookmark-manager/
├── backend/
│   ├── server.js          # Express API with all endpoints + seed data
│   ├── server.test.js     # Vitest + Supertest unit tests
│   ├── vitest.config.mjs  # Test configuration
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── vite.config.js     # Vite config with API proxy
│   ├── src/
│   │   ├── main.jsx       # React entry point
│   │   ├── App.jsx        # Main app component (state, search, filter, theme)
│   │   ├── api.js         # API client module
│   │   ├── index.css      # Full design system (light + dark themes)
│   │   └── components/
│   │       ├── BookmarkForm.jsx    # Add/Edit form with validation
│   │       ├── BookmarkItem.jsx    # Single bookmark card
│   │       ├── BookmarkList.jsx    # List renderer with empty state
│   │       └── ConfirmDialog.jsx   # Delete confirmation modal
│   └── package.json
├── package.json           # Root: concurrently start script
└── README.md
```

## AI Tools Used

- Gemini, chatgpt — Code generation, architecture decisions, debugging


## Assumptions

- In-memory store resets on backend restart (no persistence)
- Search is client-side only (no API endpoint for search)
- No authentication or authorization
- Tags are automatically normalized to lowercase
- Description snippet truncated at 100 characters in the list view
- Vite dev server proxies API calls to backend (no CORS issues in development)
