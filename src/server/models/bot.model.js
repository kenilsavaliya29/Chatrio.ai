import mongoose from "mongoose";

const botSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required : true},
    botId: { type: String },
    name: { type: String, required: true },
    url: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive', 'processing'], default: 'processing' },
    // Knowledge base and processing artifacts
    ragContext: { type: mongoose.Schema.Types.Mixed },
    scrapingReport: { type: mongoose.Schema.Types.Mixed },
    process: {
        reports: Boolean,
        customization: Boolean,
        deployed: Boolean,
        // Progress tracking for long-running processing
        processing: {
            progressPercent: { type: Number, default: 0 },
            step: { type: String, default: 'queued' },
            message: { type: String },
            status: { type: String, enum: ['processing', 'active', 'inactive', 'error'], default: 'processing' },
            lastUpdated: { type: Date },
        }
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
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Keep updatedAt in sync
botSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.models.Bot || mongoose.model('Bot', botSchema);