import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const botSchema = new mongoose.Schema({
  botId: { type: String },
  name: { type: String, required: true },
  url: { type: String, required: true },
  status: { type: String, default: 'processing' },
  process: {
    reports: Boolean,
    customization: Boolean,
    deployed: Boolean
  },
  config: {
    // Bot Identity
    botName: { type: String, default: 'Chatrio AI' },
    greetingMessage: { type: String, default: 'Hi there! How can I help you today?' },
    tone: { type: String, default: 'helpful' },
    inputPlaceholder: { type: String, default: 'Type a message...' },
    additionalContent: { type: String, default: '' },

    // Branding
    branding: {
      logoUrl: { type: String, default: '' },
      launcherIcon: { type: String, default: '💬' },
      launcherIconUrl: { type: String, default: '' },
      sendButtonIcon: { type: String, default: 'Send' },
    },

    // Colors
    colors: {
      headerBg: { type: String, default: '#000000' },
      headerText: { type: String, default: '#ffffff' },
      backgroundColor: { type: String, default: '#ffffff' },
      textColor: { type: String, default: '#000000' },
      borderColor: { type: String, default: '#e5e5e5' },
      messagesBg: { type: String, default: '#fafbfc' },
      inputBg: { type: String, default: '#ffffff' },
      userBg: { type: String, default: '#e6f0ff' },
      userText: { type: String, default: '#222222' },
      assistantBg: { type: String, default: '#f3f3f3' },
      assistantText: { type: String, default: '#444444' },
      sendButtonBg: { type: String, default: '#000000' },
      sendButtonText: { type: String, default: '#ffffff' },
      launcherBg: { type: String, default: '#000000' },
      launcherText: { type: String, default: '#ffffff' },
    },

    // Typography
    typography: {
      fontFamily: { type: String, default: 'Inter' },
      fontSize: { type: String, default: '14px' },
      headerFontSize: { type: String, default: '16px' },
      messageFontSize: { type: String, default: '14px' },
      fontWeight: { type: String, default: '400' },
    },

    // Sizing & Shape
    sizing: {
      widgetWidth: { type: String, default: '350px' },
      widgetHeight: { type: String, default: '500px' },
      borderRadius: { type: String, default: '16px' },
      messageBorderRadius: { type: String, default: '12px' },
      launcherSize: { type: String, default: '60px' },
    },

    // Behavior
    behavior: {
      opacity: { type: Number, default: 1, min: 0.1, max: 1 },
      autoOpen: { type: Boolean, default: false },
      autoOpenDelay: { type: Number, default: 3000 },
      showTypingIndicator: { type: Boolean, default: true },
      soundEnabled: { type: Boolean, default: false },
    },

    // Animation
    animation: {
      type: { type: String, default: 'scale' }, // scale, slide, fade, bounce
      duration: { type: String, default: '0.3s' },
      easing: { type: String, default: 'ease-out' },
      slideDirection: { type: String, default: 'bottom-right' }, // for slide animation
    },

    // Legacy fields (for backward compatibility)
    colorTheme: String,
    darkMode: Boolean,
  },
  ragContext: { type: Object }, // NOT SCALABLE: For MVP only
  scrapingReport: { type: Object }, // NOT SCALABLE: For MVP only
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function () { return !this.googleId; },
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },
  googleId: {
    type: String,
  },
  avatar: {
    type: String,
    default: 'https://i.pravatar.cc/150'
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  bots: [botSchema], // Embed bot configurations here for the MVP
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 