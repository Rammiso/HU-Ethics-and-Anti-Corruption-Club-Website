# HUEACC Backend API

Backend API server for the Haramaya University Ethics and Anti-Corruption Club website.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6.0+ (local or cloud)
- Git

### Installation

1. **Clone and navigate to backend:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
# IMPORTANT: Set a secure JWT_SECRET in production
```

4. **Test MongoDB connection:**
```bash
npm run test:db
```

5. **Create initial admin users:**
```bash
npm run create:admin
```

6. **Test authentication system:**
```bash
npm run test:auth
```

7. **Start development server:**
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 🔐 Authentication

### Admin Login
```bash
# Default admin credentials (change immediately!)
Super Admin:
  Email: admin@hueacc.edu.et
  Password: Admin123!@#

Regular Admin:
  Email: manager@hueacc.edu.et
  Password: Manager123!@#
```

### API Authentication
```bash
# Login to get JWT token
POST /api/v1/auth/login
{
  "email": "admin@hueacc.edu.et",
  "password": "Admin123!@#"
}

# Use token in subsequent requests
Authorization: Bearer <your-jwt-token>
```

## 📊 API Endpoints

### Health Check
- `GET /health` - Server health status
- `GET /api` - API information
- `GET /api/health` - Detailed health check

### Authentication (Implemented ✅)
- `POST /api/v1/auth/login` - Admin login
- `POST /api/v1/auth/logout` - Admin logout (requires auth)
- `GET /api/v1/auth/profile` - Get admin profile (requires auth)
- `PUT /api/v1/auth/change-password` - Change password (requires auth)
- `GET /api/v1/auth/validate` - Validate token (requires auth)

### Public Routes (Placeholder)
- `GET /api/v1/public/news` - Get published news
- `GET /api/v1/public/events` - Get published events
- `POST /api/v1/public/reports` - Submit anonymous report
- `GET /api/v1/public/reports/track/:trackingId` - Track report status
- `POST /api/v1/public/contact` - Submit contact message

### Admin Routes (Protected, Placeholder)
- `GET /api/v1/admin/dashboard` - Admin dashboard data
- `GET /api/v1/admin/reports` - Manage reports
- `GET /api/v1/admin/news` - Manage news
- `GET /api/v1/admin/events` - Manage events
- `GET /api/v1/admin/users` - User management (Super Admin only)
- `GET /api/v1/admin/audit-logs` - Audit logs (Super Admin only)

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server with auto-reload
npm start           # Start production server
npm run test        # Run test suite
npm run test:watch  # Run tests in watch mode
npm run test:db     # Test database connection
npm run test:auth   # Test authentication system
npm run test:audit  # Test audit logging system
npm run create:admin # Create initial admin users
npm run lint        # Check code style
npm run lint:fix    # Fix code style issues
```

### Project Structure
```
src/
├── config/         # Configuration files
├── middleware/     # Express middleware
├── routes/         # API route definitions
├── utils/          # Utility functions
├── scripts/        # Utility scripts
└── server.js       # Application entry point
```

## 🔧 Configuration

### Environment Variables
Key configuration options in `.env`:

```bash
# Server
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/hueacc_db

# Security
JWT_SECRET=your_secure_secret_here
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

### MongoDB Setup
1. **Local MongoDB:**
   - Install MongoDB Community Edition
   - Start MongoDB service
   - Database will be created automatically

2. **MongoDB Atlas (Cloud):**
   - Create cluster at mongodb.com
   - Get connection string
   - Set `MONGODB_URI` in `.env`

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin requests
- **Request Logging**: Comprehensive request/response logging
- **Error Handling**: Centralized error management
- **Input Validation**: Request validation middleware
- **Rate Limiting**: API abuse prevention

## 📝 Logging

Logs are written to:
- `logs/app.log` - All application logs
- `logs/error.log` - Error logs only
- `logs/exceptions.log` - Uncaught exceptions
- Console output in development

## 🧪 Testing

```bash
# Run all tests
npm test

# Test with coverage
npm run test

# Test database connection
npm run test:db
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure secure `JWT_SECRET`
- [ ] Set up MongoDB production database
- [ ] Configure CORS for production domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure logging for production
- [ ] Set up monitoring and alerts

### Docker Support (Coming Soon)
Docker configuration will be added for containerized deployment.

## 📚 API Documentation

Detailed API documentation will be available at `/api/docs` once implemented.

## 🤝 Contributing

This is an academic project for Haramaya University. For contributions:
1. Follow existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass

## 📄 License

Copyright © 2025 Haramaya University Ethics and Anti-Corruption Club. All rights reserved.

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Failed:**
```bash
# Check MongoDB is running
mongosh --eval "db.runCommand('ping')"

# Test connection
npm run test:db
```

**Port Already in Use:**
```bash
# Change PORT in .env file
PORT=3001
```

**Module Import Errors:**
```bash
# Ensure Node.js 18+ is installed
node --version

# Clear npm cache
npm cache clean --force
npm install
```

For additional support, check the logs in the `logs/` directory.
