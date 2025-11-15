# BitBazaar 🛒

A modern PC parts marketplace built with React, TypeScript, Express, and PostgreSQL.

## 🚀 Features

- **User Authentication** - Secure JWT-based authentication
- **Listings Management** - Create, browse, search, and filter PC part listings
- **Real-time Chat** - Socket.IO powered messaging between buyers and sellers
- **Favorites System** - Save favorite listings
- **Reviews & Ratings** - Rate sellers and leave reviews
- **Image Upload** - Supabase storage integration for listing images
- **Responsive Design** - Modern UI with Material-UI, light/dark theme support
- **Advanced Search** - Filter by category, price range, condition, location
- **Recently Viewed** - Track and display recently viewed listings

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Material-UI (MUI)
- React Query for data fetching
- Zustand for state management
- React Router for navigation
- Vite for build tooling

### Backend
- Node.js + Express + TypeScript
- PostgreSQL with Prisma ORM
- Socket.IO for real-time features
- JWT authentication
- Supabase for image storage
- Winston for logging

## 📦 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Supabase)
- Git

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/BitBazaar0/BitBazaar.git
cd BitBazaar
```

2. **Backend Setup**:
```bash
cd backend
npm install

# Create .env file (copy from .env.example)
cp .env.example .env
# Edit .env with your database URL and secrets

# Run database migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start development server
npm run dev
```

3. **Frontend Setup**:
```bash
cd frontend
npm install

# Create .env file (copy from .env.example)
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🐳 Docker Deployment

See [PRODUCTION_README.md](./PRODUCTION_README.md) for complete deployment guide.

Quick start with Docker Compose:
```bash
docker-compose up -d
```

## 📚 Project Structure

```
BitBazaar/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── lib/            # Prisma & Supabase clients
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema & migrations
│   └── dist/               # Compiled JavaScript
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── stores/         # Zustand stores
│   │   └── theme/          # MUI theme configuration
│   └── dist/               # Built frontend
└── docker-compose.yml      # Docker orchestration
```

## 🔒 Security Features

- Rate limiting on all API endpoints
- Helmet.js security headers
- JWT authentication
- Input validation with express-validator
- CORS configuration
- Request size limits
- Comprehensive error logging

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get listing details
- `POST /api/listings` - Create listing (auth required)
- `GET /api/listings/homepage` - Get homepage data

### Other Endpoints
- See `backend/src/routes/` for complete API documentation

## 🧪 Development

```bash
# Backend
cd backend
npm run dev        # Start dev server
npm run build      # Build for production
npm run lint       # Run ESLint

# Frontend
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 🌐 Production Deployment

For detailed production deployment instructions, see [PRODUCTION_README.md](./PRODUCTION_README.md).

Key production considerations:
- Environment variables configuration
- Database connection pooling
- SSL/HTTPS setup
- Error monitoring
- Log aggregation
- CDN for static assets

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

