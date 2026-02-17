# Backend API

Node.js backend with Express, PostgreSQL, Sequelize ORM, and JWT authentication.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your PostgreSQL credentials and JWT secrets.

4. Create PostgreSQL database:
```sql
CREATE DATABASE dip_db;
```

5. Start server:
```bash
npm run dev    # Development with watch mode
npm start      # Production
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (email or username)
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get current user profile (protected)
- `PATCH /api/auth/profile` - Update profile (protected)

### Health Check

- `GET /health` - Server health status

## Request/Response Examples

### Register
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "username": "user123",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "gender": "MALE",
  "weight_kg": 75.5,
  "height_sm": 180
}

Response:
{
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### Login
```json
POST /api/auth/login
{
  "email": "user@example.com",  // or "username": "user123"
  "password": "password123"
}
```

### Get Profile (requires Authorization header)
```
GET /api/auth/profile
Headers: Authorization: Bearer <accessToken>
```

### Update Profile
```json
PATCH /api/auth/profile
Headers: Authorization: Bearer <accessToken>
{
  "first_name": "Jane",
  "weight_kg": 70.0
}
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - PostgreSQL connection
- `JWT_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `NODE_ENV` - Environment (development/production)
