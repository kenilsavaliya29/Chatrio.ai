import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const botSchema = new mongoose.Schema({
  botId: { type: String },
  name: { type: String, required: true },
  url: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'processing'], default: 'processing' },
  process: {
    reports: Boolean,
    customization: Boolean,
    deployed: Boolean
  },
  config: {
    // Bot Identity
    Identity: {
      botName: { type: String },
      greetingMessage: { type: String },
      tone: { type: String },
      inputPlaceholder: { type: String },
      additionalContent: { type: String },
    },

    // Branding
    Branding: {
      logoUrl: { type: String },
      launcherIcon: { type: String },
      launcherIconUrl: { type: String },
      sendButtonIcon: { type: String },
    },

    // Colors
    Colors: {
      headerBg: { type: String },
      headerText: { type: String },
      backgroundColor: { type: String },
      textColor: { type: String },
      borderColor: { type: String },
      messagesBg: { type: String },
      inputBg: { type: String },
      userBg: { type: String },
      userText: { type: String },
      assistantBg: { type: String },
      assistantText: { type: String },
      sendButtonBg: { type: String },
      sendButtonText: { type: String },
      launcherBg: { type: String },
      launcherText: { type: String },
    },

    // Typography
    Typography: {
      fontFamily: { type: String },
      fontSize: { type: String },
      headerFontSize: { type: String },
      messageFontSize: { type: String },
      fontWeight: { type: String },
    },


    // Sizing & Shape
    Sizing: {
      widgetWidth: { type: String },
      widgetHeight: { type: String },
      borderRadius: { type: String },
      messageBorderRadius: { type: String },
      launcherSize: { type: String },
    },

    // Behavior
    Behavior: {
      opacity: { type: Number, min: 0.1, max: 1 },
      autoOpen: { type: Boolean },
      autoOpenDelay: { type: Number },
      showTypingIndicator: { type: Boolean },
      soundEnabled: { type: Boolean },
    },

    // Animation
    Animation: {
      animationType: { type: String },
      animationDuration: { type: String },
      animationEasing: { type: String },
      slideDirection: { type: String },
    },

    // Legacy fields (for backward compatibility)
    colorTheme: String,
    darkMode: Boolean,
  },
  scriptCode: { type: String },
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