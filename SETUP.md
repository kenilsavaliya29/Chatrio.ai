# Chatbot SaaS Setup Guide

## Prerequisites

1. **Create `.env.local` file** in your project root:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/chatbot_saas

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Google OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Environment
NODE_ENV=development
```

2. **Install and start MongoDB:**

### Option 1: Using Docker (Recommended)
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Option 2: Install MongoDB locally
- Download from https://www.mongodb.com/try/download/community
- Follow installation instructions for your OS
- Start MongoDB service

### Option 3: Use MongoDB Atlas (Cloud)
- Go to https://cloud.mongodb.com
- Create a free cluster
- Get connection string and replace MONGODB_URI

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open http://localhost:3000

## Features Fixed

✅ Public assets (images, SVGs) now accessible
✅ Field-specific error messages
✅ Proper authentication flow
✅ Protected routes
✅ Dashboard redirection after login/signup
✅ Middleware simplified and optimized

## Troubleshooting

- If images don't load, check if the dev server is running
- If authentication fails, ensure MongoDB is running and .env.local exists
- Check browser console for any errors 