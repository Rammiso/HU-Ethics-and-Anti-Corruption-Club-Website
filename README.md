# Haramaya University Ethics and Anti-Corruption Club Website

A full-stack web application for managing ethics and anti-corruption initiatives at Haramaya University.

## Features

- **Public Website**: Information portal with news, events, and educational resources
- **Anonymous Reporting**: Secure, confidential incident reporting system
- **Admin Dashboard**: Comprehensive management interface for club administrators
- **Multi-language Support**: English and Amharic language options

## Technology Stack

### Frontend
- React 18 with Vite
- Tailwind CSS with shadcn/ui components
- React Router for navigation
- Axios for API communication

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- bcrypt for password hashing

## Project Structure

```
hueacc-website/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend API
└── docs/              # Project documentation
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd hueacc-website
```

2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npm run migrate
npm run seed
npm run dev
```

3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

### Environment Variables

See `.env.example` files in both frontend and backend directories for required configuration.

## Development

- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:3000`

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

See `docs/deployment/` for detailed deployment instructions.

## Documentation

- API Documentation: `docs/api/`
- Deployment Guide: `docs/deployment/`
- User Guides: `docs/user-guides/`

## Contributing

This is an academic project for Haramaya University. For contributions, please contact the project maintainers.

## License

Copyright © 2025 Haramaya University Ethics and Anti-Corruption Club. All rights reserved.

## Contact

For questions or support, contact the club at [contact information].




