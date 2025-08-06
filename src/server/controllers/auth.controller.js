import User from '../models/user.model';
import { generateToken, verifyToken } from '../utils/jwt.utils';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Helper function to create response with cookie
const createResponseWithCookie = (data, token) => {
  const response = NextResponse.json(data);
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
  return response;
};

export const register = async (req) => {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters', field: 'name' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters', field: 'password' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email is already registered', field: 'email' }, { status: 400 });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id);
    return createResponseWithCookie({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    }, token);
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failedsss', field: 'general' }, { status: 500 });
  }
};

export const login = async (req) => {
  try {
    const body = await req.json();
    const { email, password } = body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json({ error: 'Email not found', field: 'email' }, { status: 401 });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Incorrect password', field: 'password' }, { status: 401 });
    }

    const token = generateToken(user._id);
    return createResponseWithCookie({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    }, token);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed', field: 'general' }, { status: 500 });
  }
};

export const getMe = async (req) => {
  try {
    const cookieStore = await cookies(); 
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
};

export const googleAuth = async () => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=email profile`;
  return NextResponse.redirect(googleAuthUrl);
};

export const googleCallback = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', req.url));
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', req.url));
    }

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    let user = await User.findOne({ email: userData.email });

    if (!user) {
      user = new User({
        name: userData.name,
        email: userData.email,
        googleId: userData.id,
        avatar: userData.picture,
        isEmailVerified: true,
      });
      await user.save();
    }

    const token = generateToken(user._id);
    const response = NextResponse.redirect(new URL('/dashboard', req.url));
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(new URL('/login?error=google_auth_failed', req.url));
  }
};

export const logout = async () => {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('token');
  return response;
}; 