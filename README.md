# Note App

A minimalist note-taking application with Google Docs-like rich text editing, folder organization, and shareable read-only links.

## Features

- **Rich Text Editor**: TipTap editor with headings, lists, tables, code blocks, and more
- **Folder Organization**: Organize notes in folders (up to 3 levels deep)
- **Full-Text Search**: Search across note titles and content
- **Sharing**: Generate public read-only links for any note
- **Auto-Save**: Changes are saved automatically
- **Clean Design**: Minimalist white-on-neutral design system
- **Authentication**: Password-protected with JWT tokens
- **Security**: Rate limiting, 1MB content limit

## Quick Start

### 1. Create Environment File

```bash
cp .env.example .env
nano .env
```

Set these values:
- `AUTH_PASSWORD`: A strong password (at least 16 characters)
- `JWT_SECRET`: A random secret key (at least 32 characters)

Generate secure values:
```bash
openssl rand -base64 32   # For AUTH_PASSWORD
openssl rand -base64 64   # For JWT_SECRET
```

### 2. Start the Application

```bash
docker compose up -d
```

Access at: `http://localhost:3006`

### 3. Login

Use the password you set in `AUTH_PASSWORD` to log in.

## Tech Stack

- **Backend**: Node.js + Express + TypeScript + SQLite
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Editor**: TipTap (rich text editor)
- **Authentication**: JWT tokens (7-day expiration)
- **Deployment**: Docker Compose

## Development

### Backend

```bash
cd backend
npm install
npm run dev
```

The API will be available at `http://localhost:3006`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Data Storage

The app uses SQLite for data persistence. The database file is stored at:
- Docker: `/app/data/notes.db`
- Development: `./backend/data/notes.db`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with password, returns JWT token

### Notes (Protected)
- `GET /api/notes` - List notes with search and folder filters
- `POST /api/notes` - Create note
- `GET /api/notes/:id` - Get note details
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/:id/share` - Generate share token
- `DELETE /api/notes/:id/share` - Disable sharing

### Folders (Protected)
- `GET /api/folders` - List folders
- `POST /api/folders` - Create folder
- `PUT /api/folders/:id` - Rename folder
- `DELETE /api/folders/:id` - Delete folder

### Sharing (Public)
- `GET /api/shared/:token` - Get shared note (read-only, no auth required)

## Features in Detail

### Rich Text Editor
- Headings (H1, H2, H3)
- Bold, italic, underline, strikethrough
- Bullet and numbered lists
- Code blocks
- Blockquotes
- Tables (insert, resize)
- Horizontal rules

### Folder Organization
- Create nested folders (max 3 levels)
- Move notes between folders
- Delete folders (notes moved to root)

### Sharing System
- Generate unique share token (UUID)
- Toggle sharing on/off per note
- Public read-only access via `/shared/{token}`
- No authentication required for shared notes

## Security Features

| Feature | Details |
|---------|---------|
| **Authentication** | Password-protected with JWT tokens |
| **Rate Limiting** | 5 login attempts/min, 100 general requests/min |
| **Content Limit** | Maximum 1MB per note |
| **Resource Limits** | Docker memory/CPU limits |

## Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `AUTH_PASSWORD` | Yes | - | Password for login |
| `JWT_SECRET` | Yes | - | Secret for JWT signing |
| `DB_PATH` | No | `./data/notes.db` | SQLite database path |
| `PORT` | No | `3006` | Backend server port |

## File Structure

```
note-estv/
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── db/          # Database layer
│   │   ├── middleware/  # Auth, CORS, rate limiting
│   │   ├── routes/      # API endpoints
│   │   └── index.ts     # Entry point
│   └── package.json
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks
│   │   ├── utils/       # API & auth utilities
│   │   └── types/       # TypeScript types
│   └── package.json
│
├── docker-compose.yml   # Docker orchestration
├── Dockerfile.backend   # Backend Dockerfile
├── Dockerfile.frontend  # Frontend Dockerfile
├── .env.example         # Environment template
└── README.md            # This file
```

## Troubleshooting

### Can't login
1. Check `AUTH_PASSWORD` in `.env`
2. Check logs: `docker logs note-backend-estv`
3. Wait 1 minute after 5 failed attempts (rate limit)

### 401 Unauthorized
- Token expired (7-day expiration)
- Clear browser localStorage and login again

### 429 Too Many Requests
- Rate limit exceeded
- Wait 1 minute before retrying

## License

MIT