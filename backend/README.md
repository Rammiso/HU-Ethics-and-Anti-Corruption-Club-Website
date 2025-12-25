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
```

4. **Test MongoDB connection:**
```bash
npm run test:db
```

5. **Start development server:**
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📊 API Endpoints

### Health Check
- `GET /health` - Server health status
- `GET /api` - API information
- `GET /api/health` - Detailed health check

### Planned Endpoints (Coming Soon)
- `POST /api/v1/auth/login` - Admin authentication
- `POST /api/v1/reports` - Submit anonymous report
- `GET /api/v1/reports/track/:trackingId` - Track report status
- `GET /api/v1/news` - Get published news
- `GET /api/v1/events` - Get published events
- `POST /api/v1/contact` - Submit contact message

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server with auto-reload
npm start           # Start production server
npm run test        # Run test suite
npm run test:watch  # Run tests in watch mode
npm run lint        # Check code style
npm run lint:fix    # Fix code style issues
npm run test:db     # Test database connection
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
