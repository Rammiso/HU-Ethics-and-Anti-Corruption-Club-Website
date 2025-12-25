# HUEACC Frontend

Frontend application for the Haramaya University Ethics and Anti-Corruption Club website.

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

3. Start development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── features/       # Feature-based modules
├── services/       # API services
├── context/        # React Context providers
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── routes/         # Route configuration
└── styles/         # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Technologies

- React 18
- Vite
- React Router
- Tailwind CSS
- Axios
