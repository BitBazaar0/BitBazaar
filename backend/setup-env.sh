#!/bin/bash
# Quick setup script for backend .env file

cat > .env << EOF
PORT=5000
NODE_ENV=development
JWT_SECRET=bitbazaar-super-secret-jwt-key-change-in-production-2024
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
EOF

echo "✅ .env file created successfully!"
echo "You can now run: npm run dev"

