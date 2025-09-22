import User from '../models/user.model';
import { generateToken, verifyToken } from '../utils/jwt.utils';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateOTP, sendOTPEmail, sendPasswordResetSuccessEmail } from '../utils/email.service';

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

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const register = async (req) => {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters', field: 'name' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters', field: 'password' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email Required", field: "email" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email", field: "email" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email }).select('+password');
    if (existingUser) {
      if (existingUser.googleId && !existingUser.password) {
        return NextResponse.json({ error: 'This email is registered with Google. Please sign in using Google.', field: 'general' }, { status: 400 });
      }
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
    console.log(req);
    const body = await req.json();
    const { email, password } = body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json({ error: 'Email not found', field: 'email' }, { status: 401 });
    }

    if (!password || password == null || password == "") {
      return NextResponse.json({ error: "Please enter a password", field: 'password' }, { status: 401 })
    }

    if (user.googleId && !user.password) {
      return NextResponse.json({ error: 'This account was created with Google. Please use "Continue with Google" to sign in.', field: 'general' }, { status: 401 });
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

export const logout = async () => {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('token');
  return response;
};

export const forgot_password = async (req) => {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email Required", field: "email" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email", field: "email" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      // Don't reveal if email exists for security
      return NextResponse.json({
        message: 'If an account with this email exists, a verification code has been sent.',
        success: true
      }, { status: 200 });
    }

    // Generate OTP and set expiration (10 minutes)
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update user with OTP
    await User.findByIdAndUpdate(existingUser._id, {
      passwordResetOtp: {
        code: otpCode,
        expiresAt: expiresAt,
        attempts: 0,
        isUsed: false
      }
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, existingUser.name, otpCode);

    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
      console.error('Email service error details:', {
        email,
        userName: existingUser.name,
        error: emailResult.error
      });
      return NextResponse.json({
        error: 'Failed to send verification code. Please check your email configuration.',
        field: 'general'
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Verification code has been sent to your email address.',
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Error occurred', field: 'general' }, { status: 500 });
  }
}

export const verify_otp = async (req) => {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({
        error: "Email and OTP are required",
        field: "general"
      }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({
        error: "Please enter a valid email",
        field: "email"
      }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user || !user.passwordResetOtp) {
      return NextResponse.json({
        error: 'Invalid verification code',
        field: 'otp'
      }, { status: 400 });
    }

    // Check if OTP is expired
    if (new Date() > user.passwordResetOtp.expiresAt) {
      return NextResponse.json({
        error: 'Verification code has expired. Please request a new one.',
        field: 'otp'
      }, { status: 400 });
    }

    // Check if OTP is already used
    if (user.passwordResetOtp.isUsed) {
      return NextResponse.json({
        error: 'Verification code has already been used. Please request a new one.',
        field: 'otp'
      }, { status: 400 });
    }

    // Check attempt limit (max 3 attempts)
    if (user.passwordResetOtp.attempts >= 3) {
      return NextResponse.json({
        error: 'Too many failed attempts. Please request a new verification code.',
        field: 'otp'
      }, { status: 400 });
    }

    // Verify OTP
    if (user.passwordResetOtp.code !== otp) {
      // Increment attempts
      await User.findByIdAndUpdate(user._id, {
        $inc: { 'passwordResetOtp.attempts': 1 }
      });

      return NextResponse.json({
        error: 'Invalid verification code',
        field: 'otp'
      }, { status: 400 });
    }

    // OTP is valid, mark as used
    await User.findByIdAndUpdate(user._id, {
      'passwordResetOtp.isUsed': true
    });

    return NextResponse.json({
      message: 'Verification code is valid. You can now reset your password.',
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Error occurred', field: 'general' }, { status: 500 });
  }
}

export const reset_password = async (req) => {
  try {
    const body = await req.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json({
        error: "Email, OTP, and new password are required",
        field: "general"
      }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({
        error: "Password must be at least 6 characters",
        field: "newPassword"
      }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({
        error: "Please enter a valid email",
        field: "email"
      }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user || !user.passwordResetOtp) {
      return NextResponse.json({
        error: 'Invalid verification code',
        field: 'otp'
      }, { status: 400 });
    }

    // Verify OTP one more time
    if (user.passwordResetOtp.code !== otp) {
      return NextResponse.json({
        error: 'Invalid or expired verification code',
        field: 'otp'
      }, { status: 400 });
    }

    // Check if OTP is expired
    if (new Date() > user.passwordResetOtp.expiresAt) {
      return NextResponse.json({
        error: 'Verification code has expired. Please request a new one.',
        field: 'otp'
      }, { status: 400 });
    }

    // Update password and clear OTP
    user.password = newPassword;
    user.passwordResetOtp = undefined;
    await user.save();

    // Send success email
    await sendPasswordResetSuccessEmail(email, user.name);

    return NextResponse.json({
      message: 'Password has been successfully reset. You can now log in with your new password.',
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Error occurred', field: 'general' }, { status: 500 });
  }
}


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

