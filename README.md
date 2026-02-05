# Secure-Authentication-System

A production-ready secure authentication system built as a full-stack project demonstrating modern best practices in security, scalability, and clean architecture.

## Features

- 🔐 **Secure Authentication** - Register, Login, Logout with JWT tokens
- 🍪 **HttpOnly Cookies** - Refresh tokens stored securely in HttpOnly cookies
- ⚡ **Access Token in Memory** - Never stored in localStorage
- 🛡️ **Rate Limiting** - Protection against brute-force attacks
- ✅ **Input Validation** - Zod schemas for all inputs
- 🎨 **Modern UI** - TailwindCSS with dark theme and glassmorphism

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- SQLite (better-sqlite3)
- bcrypt for password hashing
- jsonwebtoken for JWT
- zod for validation
- helmet + cors + express-rate-limit

### Frontend
- React 19 + Vite + TypeScript
- TailwindCSS v4
- React Router v7

## Quick Start

### 1. Clone and Setup

```bash
git clone <repo-url>
cd Secure-Authentication-System
```

### 2. Server Setup

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Server runs on `http://localhost:3000`

### 3. Client Setup

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Client runs on `http://localhost:5173`

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `CLIENT_ORIGIN` | CORS allowed origin | `http://localhost:5173` |
| `JWT_ACCESS_SECRET` | Secret for JWT signing | - |
| `ACCESS_TOKEN_TTL_MIN` | Access token TTL (minutes) | `15` |
| `REFRESH_TOKEN_TTL_DAYS` | Refresh token TTL (days) | `14` |
| `COOKIE_SECURE` | Secure cookie flag | `false` |

### Client (`client/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new user |
| POST | `/auth/login` | Login, get access token |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Revoke refresh token |
| GET | `/me` | Get current user (protected) |

## Scripts

### Server
```bash
npm run dev      # Development server
npm run build    # Compile TypeScript
npm run lint     # Run ESLint
```

### Client
```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Run ESLint
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Access Tokens**: 15-minute TTL, sent in response body
- **Refresh Tokens**: 14-day TTL, HttpOnly cookies, stored in DB
- **CORS**: Restricted to configured origin only
- **Rate Limiting**: 10 requests per 10 minutes on auth endpoints
- **Helmet**: Security headers protection
- **Generic Errors**: "Invalid credentials" prevents user enumeration

## License

MIT
