import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Create transporter (you can configure this with your email service)
const createTransporter = () => {
  // For development, you can use Gmail or any SMTP service
  // For production, consider using SendGrid, Resend, or AWS SES
  return nodemailer.createTransport({
    service: 'gmail', // or your preferred service
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your app password
    },
  });
};

// Generate OTP code
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Load CSS file and inline it
const loadCSS = (cssFileName) => {
  try {
    const cssPath = path.join(process.cwd(), 'src', 'server', 'templates', 'styles', cssFileName);
    return fs.readFileSync(cssPath, 'utf8');
  } catch (error) {
    console.error(`Error loading CSS ${cssFileName}:`, error);
    return '';
  }
};

// Load HTML template and replace placeholders
const loadEmailTemplate = (templateName, replacements) => {
  try {
    const templatePath = path.join(process.cwd(), 'src', 'server', 'templates', templateName);
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Load and inline CSS
    const cssFileName = templateName.replace('.html', '.css');
    const cssContent = loadCSS(cssFileName);
    
    // Replace CSS link with inline styles
    template = template.replace(
      /<link rel="stylesheet" href="\.\/styles\/[^"]+">/g,
      `<style>${cssContent}</style>`
    );
    
    // Replace placeholders with actual values
    Object.keys(replacements).forEach(key => {
      const placeholder = `{{${key}}}`;
      template = template.replace(new RegExp(placeholder, 'g'), replacements[key]);
    });
    
    return template;
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    throw error;
  }
};

// Create professional email template using HTML file
const createOTPEmailTemplate = (userName, otpCode) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  // Use a more reliable logo URL format
  const logoUrl = `${baseUrl}/svgs/logo.svg`;
  
  console.log('Logo URL for email:', logoUrl);
  
  return loadEmailTemplate('otp-email.html', {
    USER_NAME: userName || 'there',
    OTP_CODE: otpCode,
    LOGO_URL: logoUrl
  });
};

// Send OTP email
export const sendOTPEmail = async (email, userName, otpCode) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Chatrio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Password Reset Verification Code - Chatrio',
      html: createOTPEmailTemplate(userName, otpCode),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset success email
export const sendPasswordResetSuccessEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const logoUrl = `${baseUrl}/svgs/logo.svg`;
    const loginUrl = `${baseUrl}/login`;
    
    console.log('Logo URL for success email:', logoUrl);
    
    const htmlContent = loadEmailTemplate('password-reset-success.html', {
      USER_NAME: userName || 'there',
      LOGO_URL: logoUrl,
      LOGIN_URL: loginUrl
    });
    
    const mailOptions = {
      from: `"Chatrio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '✅ Password Successfully Reset - Chatrio',
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset success email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending success email:', error);
    return { success: false, error: error.message };
  }
};
