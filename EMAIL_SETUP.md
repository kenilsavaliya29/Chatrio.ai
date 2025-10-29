# Email Setup for Password Reset

This guide explains how to configure email functionality for the OTP-based password reset feature.

## Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Base URL for email templates (optional)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `EMAIL_PASS`

## Alternative Email Services

### SendGrid (Production Recommended)
```javascript
// In src/server/utils/email.service.js
const transporter = nodemailer.createTransporter({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});
```

### Resend (Modern Alternative)
```javascript
// Install: npm install resend
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (email, userName, otpCode) => {
  const { data, error } = await resend.emails.send({
    from: 'Chatrio <noreply@yourdomain.com>',
    to: [email],
    subject: '🔐 Password Reset Verification Code - Chatrio',
    html: createOTPEmailTemplate(userName, otpCode),
  });
  
  return { success: !error, data, error };
};
```

## Testing

1. Start your development server: `npm run dev`
2. Go to `/forgot-password`
3. Enter a valid email address
4. Check your email for the OTP code
5. Complete the password reset flow

## Email Templates

The system uses separate HTML template files for better maintainability:

- `src/server/templates/otp-email.html` - OTP verification email
- `src/server/templates/password-reset-success.html` - Password reset success email

### Template Features:
- ✅ Professional design with company logo
- ✅ Responsive layout for all devices
- ✅ Dynamic content replacement
- ✅ Branded styling matching your app
- ✅ Easy to customize and maintain

### Template Variables:
- `{{USER_NAME}}` - User's name
- `{{OTP_CODE}}` - 6-digit verification code
- `{{LOGO_URL}}` - Company logo URL
- `{{LOGIN_URL}}` - Login page URL

## Security Features

- ✅ OTP expires in 10 minutes
- ✅ Maximum 3 verification attempts
- ✅ Single-use OTP codes
- ✅ Rate limiting on requests
- ✅ Professional email template with logo
- ✅ Secure password hashing
- ✅ Input validation and sanitization

## Troubleshooting

### Email Not Sending
- Check your email credentials
- Verify 2FA is enabled for Gmail
- Check spam folder
- Ensure app password is correct

### OTP Not Working
- Check database connection
- Verify OTP hasn't expired
- Check attempt limits
- Ensure proper error handling

## Production Considerations

1. **Use a dedicated email service** (SendGrid, Resend, AWS SES)
2. **Set up proper DNS records** (SPF, DKIM, DMARC)
3. **Monitor email delivery rates**
4. **Implement rate limiting** at the server level
5. **Use environment-specific configurations**
