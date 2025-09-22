import { NextResponse } from 'next/server';
import connectDB from '../../../../server/config/db';
import * as authController from '../../../../server/controllers/auth.controller';

export async function POST(req, { params }) {
  await connectDB();
  
  const { route } = await params;
  const routePath = Array.isArray(route) ? route.join('/') : route;

  // Handle /api/auth/register
  if (routePath === 'register') {
    return await authController.register(req);
  }

  // Handle /api/auth/login
  if (routePath === 'login') {
    return await authController.login(req);
  }

  // Handle /api/auth/logout
  if (routePath === 'logout') {
    return await authController.logout();
  }

  //Handle /api/auth/forgot-password
  if(routePath === 'forgot-password'){
    return await authController.forgot_password(req);
  }

  //Handle /api/auth/verify-otp
  if(routePath === 'verify-otp'){
    return await authController.verify_otp(req);
  }

  //Handle /api/auth/reset-password
  if(routePath === 'reset-password'){
    return await authController.reset_password(req);
  }

  return NextResponse.json({ error: 'Route not found' }, { status: 404 });
}

export async function GET(req, { params }) {
  await connectDB();
  
  const { route } = await params;
  const routePath = Array.isArray(route) ? route.join('/') : route;

  // Handle /api/auth/me
  if (routePath === 'me') {
    return await authController.getMe(req);
  }

  // Handle /api/auth/google
  if (routePath === 'google') {
    return await authController.googleAuth();
  }

  // Handle /api/auth/google/callback
  if (routePath === 'google/callback') {
    return await authController.googleCallback(req);
  }

  return NextResponse.json({ error: 'Route not found' }, { status: 404 });
} 