@echo off
REM Quick setup script for backend .env file (Windows)

(
echo PORT=5000
echo NODE_ENV=development
echo JWT_SECRET=bitbazaar-super-secret-jwt-key-change-in-production-2024
echo JWT_EXPIRES_IN=7d
echo FRONTEND_URL=http://localhost:3000
) > .env

echo ✅ .env file created successfully!
echo You can now run: npm run dev

