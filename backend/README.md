# BitBazaar Backend API

Node.js + Express + TypeScript backend for BitBazaar marketplace.

## Setup

1. Install dependencies:
```bash
npm install
```

2. **IMPORTANT: Create `.env` file** in the backend directory:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=bitbazaar-super-secret-jwt-key-change-in-production-2024
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

3. Start development server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Current Status

⚠️ **Note**: The backend currently uses in-memory storage (arrays) for data. You'll need to integrate a database (PostgreSQL recommended) for production use.

The codebase is structured to make database integration straightforward - simply replace the array operations in controllers with database queries in services.

## Troubleshooting

If you're getting 500 errors:
1. Make sure the `.env` file exists with `JWT_SECRET` defined
2. Make sure `node_modules` are installed: `npm install`
3. Check that port 5000 is not already in use
4. Check the console logs for specific error messages
