# HUEACC Backend API

Backend API server for the Haramaya University Ethics and Anti-Corruption Club website.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Setup database:
```bash
npm run migrate
npm run seed
```

4. Start development server:
```bash
npm run dev
```

## API Endpoints

### Public Endpoints
- `GET /api/v1/news` - Get published news articles
- `GET /api/v1/events` - Get published events
- `POST /api/v1/reports` - Submit anonymous report
- `GET /api/v1/reports/track/:trackingId` - Track report status
- `POST /api/v1/contact` - Submit contact message

### Authentication
- `POST /api/v1/auth/login` - Admin login
- `POST /api/v1/auth/logout` - Admin logout
- `POST /api/v1/auth/refresh` - Refresh access token

### Admin Endpoints (Protected)
- `GET /api/v1/admin/reports` - List all reports
- `PUT /api/v1/admin/reports/:id` - Update report status
- `GET /api/v1/admin/events` - Manage events
- `GET /api/v1/admin/news` - Manage news articles
- `GET /api/v1/admin/users` - Manage administrators

## Project Structure

```
src/
├── controllers/    # Request handlers
├── services/       # Business logic
├── repositories/   # Data access
├── models/         # Data models
├── middleware/     # Express middleware
├── routes/         # API routes
├── config/         # Configuration
├── utils/          # Utilities
└── database/       # Database management
```

## Testing

```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
```

## Security

- JWT-based authentication
- bcrypt password hashing
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers
