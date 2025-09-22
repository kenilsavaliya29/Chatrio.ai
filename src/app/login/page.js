'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MessageBox } from '@/components/ui/MessageBox';
import { EyeIcon } from '@heroicons/react/24/outline';
import { EyeSlashIcon } from '@heroicons/react/24/outline';



const GoogleIcon = (props) => (
  <svg viewBox="0 0 48 48" {...props}>
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 9.196C34.978 5.623 29.81 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l4.843-4.843C34.978 5.623 29.81 4 24 4C16.636 4 10.283 8.343 6.306 14.691z"></path>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
    <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.845 44 30.561 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
  </svg>
);

export default function SignInPage() {
  const router = useRouter();
  const { login, checkAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: '', password: '', general: '' });

    try {
      const response = await login(email, password);

      if (!response.success) {

        if (response.field === 'email') {
          setErrors(prev => ({ ...prev, email: response.error }));
        } else if (response.field === 'password') {
          setErrors(prev => ({ ...prev, password: response.error }));
        } else {
          setErrors(prev => ({ ...prev, general: response.error || 'Login failed' }));
        }
      } else {
        // Login successful, auth context is already updated by login function
        await checkAuth(); // Refresh auth state
        router.push('/dashboard');
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'An error occurred. Please try again.' }));
      console.error('Login error:', error);
    }
  };

  return (


    <main className="flex items-center justify-center min-h-screen px-4 sm:px-7 md:px-10 py-20 pb-0 bg-background mt-10">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-2xl shadow-lg border border-border mb-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl f-geist-mono">
            Welcome Back
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to access your dashboard.
          </p>
        </div>
        {successMessage && (
          <MessageBox
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        )}

        {errors.general && (
          <MessageBox
            type="error"
            message={errors.general}
            onClose={() => setErrors(prev => ({ ...prev, general: '' }))}
          />
        )}

        <button
          onClick={handleGoogleLogin}
          className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          <GoogleIcon className="mr-2 h-5 w-5" />
          Continue with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 border ${errors.email ? 'border-destructive' : 'border-border'} rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>

            </div>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border ${errors.password ? 'border-destructive' : 'border-border'} rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password}</p>
              )}
              <div
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ?
                  <EyeSlashIcon className="w-5 h-5 absolute right-3 top-2 cursor-pointer text-white/60" />
                  :
                  <EyeIcon className="w-5 h-5 absolute right-3 top-2 cursor-pointer text-white/60" />}

              </div>
            </div>
          </div>

          <div className="text-sm mb-3">
            <Link href="/forgot-password" className="font-medium text-primary hover:underline hover-text-gradient">
              Forgot your password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border-0 rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:scale-[1.02] custom-transition btn-primary-gradient-hover hover:text-white focus:scale-105"
            >
              Login
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline hover-text-gradient"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </main>

  );
} 