# Electora Local Server

A simple Express.js server for handling authentication and user management for the Electora voting platform.

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Configuration
Create a `.env` file in the server directory:
```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout (requires token)
- `GET /api/auth/profile` - Get current user profile (requires token)

### Health Check
- `GET /health` - Server health check

### Protected Routes
- `GET /api/protected` - Example protected route (requires token)

## Test Credentials

The server comes with two pre-configured users:

1. **Admin User**
   - Username: `admin`
   - Password: `admin123`
   - Role: `election-manager`

2. **Manager User**
   - Username: `manager`
   - Password: `manager456`
   - Role: `election-manager`

## API Usage Examples

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Get Profile (with token)
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Features

- **Password Hashing**: Uses bcryptjs for secure password storage
- **JWT Tokens**: Stateless authentication with 24-hour expiration
- **CORS**: Configured for cross-origin requests
- **Input Validation**: Validates required fields
- **Error Handling**: Comprehensive error responses

## Next Steps

1. **Database Integration**: Replace in-memory storage with PostgreSQL/MySQL
2. **User Registration**: Add endpoints for user registration
3. **Password Reset**: Implement password reset functionality
4. **Rate Limiting**: Add rate limiting for security
5. **Logging**: Add comprehensive logging 