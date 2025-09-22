'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageBox } from '@/components/ui/MessageBox';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    otp: '',
    general: ''
  });

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ email: '', otp: '', general: '' });

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
      } else {
        if (data.field === 'email') {
          setErrors(prev => ({ ...prev, email: data.error }));
        } else {
          setErrors(prev => ({ ...prev, general: data.error || 'Failed to send verification code' }));
        }
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'An error occurred. Please try again.' }));
      console.error('Send OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ email: '', otp: '', general: '' });

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to reset password page with email and OTP
        router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`);
      } else {
        if (data.field === 'otp') {
          setErrors(prev => ({ ...prev, otp: data.error }));
        } else {
          setErrors(prev => ({ ...prev, general: data.error || 'Invalid verification code' }));
        }
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'An error occurred. Please try again.' }));
      console.error('Verify OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setErrors({ email: '', otp: '', general: '' });

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setErrors(prev => ({ ...prev, general: 'New verification code sent!' }));
      } else {
        setErrors(prev => ({ ...prev, general: data.error || 'Failed to resend code' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'An error occurred. Please try again.' }));
      console.error('Resend OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen px-4 sm:px-7 md:px-10 py-20 pb-0 bg-background mt-10">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-2xl shadow-lg border border-border mb-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl f-geist-mono">
            {step === 'email' ? 'Reset Password' : 'Verify Code'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {step === 'email' 
              ? 'Enter your email address and we\'ll send you a verification code.'
              : 'Enter the 6-digit code sent to your email address.'
            }
          </p>
        </div>

        {errors.general && (
          <MessageBox
            type={errors.general.includes('sent') ? 'success' : 'error'}
            message={errors.general}
            onClose={() => setErrors(prev => ({ ...prev, general: '' }))}
          />
        )}

        {step === 'email' ? (
          <form className="space-y-6" onSubmit={handleSendOTP}>
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
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border-0 rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:scale-[1.02] custom-transition btn-primary-gradient-hover hover:text-white focus:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleVerifyOTP}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-foreground">
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength="6"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-3 py-2 border ${errors.otp ? 'border-destructive' : 'border-border'} rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-center text-2xl tracking-widest`}
                  placeholder="000000"
                />
                {errors.otp && (
                  <p className="mt-1 text-sm text-destructive">{errors.otp}</p>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Code sent to: <span className="font-medium">{email}</span>
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex justify-center py-2 px-4 border-0 rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:scale-[1.02] custom-transition btn-primary-gradient-hover hover:text-white focus:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="w-full text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

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