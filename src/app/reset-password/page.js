'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageBox } from '@/components/ui/MessageBox';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: '',
    general: ''
  });

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const otpParam = searchParams.get('otp');
    
    if (!emailParam || !otpParam) {
      router.push('/forgot-password');
      return;
    }
    
    setEmail(emailParam);
    setOtp(otpParam);
  }, [searchParams, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ newPassword: '', confirmPassword: '', general: '' });

    // Validate passwords
    if (newPassword.length < 6) {
      setErrors(prev => ({ 
        ...prev, 
        newPassword: 'Password must be at least 6 characters' 
      }));
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors(prev => ({ 
        ...prev, 
        confirmPassword: 'Passwords do not match' 
      }));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          otp, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to login with success message
        router.push('/login?message=password_reset_success');
      } else {
        if (data.field === 'newPassword') {
          setErrors(prev => ({ ...prev, newPassword: data.error }));
        } else if (data.field === 'otp') {
          setErrors(prev => ({ ...prev, general: data.error }));
        } else {
          setErrors(prev => ({ ...prev, general: data.error || 'Failed to reset password' }));
        }
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'An error occurred. Please try again.' }));
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!email || !otp) {
    return (
      <main className="flex items-center justify-center min-h-screen px-4 sm:px-7 md:px-10 py-20 pb-0 bg-background mt-10">
        <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-2xl shadow-lg border border-border">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen px-4 sm:px-7 md:px-10 py-20 pb-0 bg-background mt-10">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-2xl shadow-lg border border-border">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl f-geist-mono">
            Set New Password
          </h1>
          <p className="mt-2 text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        {errors.general && (
          <MessageBox
            type="error"
            message={errors.general}
            onClose={() => setErrors(prev => ({ ...prev, general: '' }))}
          />
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-foreground">
              New Password
            </label>
            <div className="mt-1">
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-3 py-2 border ${errors.newPassword ? 'border-destructive' : 'border-border'} rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background`}
                placeholder="Enter new password"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-destructive">{errors.newPassword}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
              Confirm New Password
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-destructive' : 'border-border'} rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background`}
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full flex justify-center py-2 px-4 border-0 rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:scale-[1.02] custom-transition btn-primary-gradient-hover hover:text-white focus:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary hover:underline"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
