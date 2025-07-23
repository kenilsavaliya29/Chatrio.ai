import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import User from '@/server/models/user.model';

export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const botId = searchParams.get('botId');
        
        if (!botId) {
            return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
        }

        // Find the bot by botId across all users
        const user = await User.findOne({ 'bots.botId': botId });
        if (!user) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        const bot = user.bots.find(b => b.botId === botId);
        if (!bot || bot.status !== 'active') {
            return NextResponse.json({ error: 'Bot not found or not active' }, { status: 404 });
        }

        // Flatten the configuration for the widget
        const config = bot.config || {};
        const flatConfig = {
            // Bot Identity
            botName: config.botName || 'Chatrio AI',
            greetingMessage: config.greetingMessage || 'Hi there! How can I help you today?',
            inputPlaceholder: config.inputPlaceholder || 'Type a message...',
            
            // Branding
            logoUrl: config.branding?.logoUrl || '',
            launcherIcon: config.branding?.launcherIcon || '💬',
            launcherIconUrl: config.branding?.launcherIconUrl || '',
            sendButtonIcon: config.branding?.sendButtonIcon || 'Send',
            
            // Colors (flattened for widget CSS variables)
            headerBg: config.colors?.headerBg || '#000000',
            headerText: config.colors?.headerText || '#ffffff',
            backgroundColor: config.colors?.backgroundColor || '#ffffff',
            textColor: config.colors?.textColor || '#000000',
            borderColor: config.colors?.borderColor || '#e5e5e5',
            messagesBg: config.colors?.messagesBg || '#fafbfc',
            inputBg: config.colors?.inputBg || '#ffffff',
            userBg: config.colors?.userBg || '#e6f0ff',
            userText: config.colors?.userText || '#222222',
            assistantBg: config.colors?.assistantBg || '#f3f3f3',
            assistantText: config.colors?.assistantText || '#444444',
            sendButtonBg: config.colors?.sendButtonBg || '#000000',
            sendButtonText: config.colors?.sendButtonText || '#ffffff',
            launcherBg: config.colors?.launcherBg || '#000000',
            launcherText: config.colors?.launcherText || '#ffffff',
            
            // Typography
            fontFamily: config.typography?.fontFamily || 'Inter',
            fontSize: config.typography?.fontSize || '14px',
            headerFontSize: config.typography?.headerFontSize || '16px',
            messageFontSize: config.typography?.messageFontSize || '14px',
            fontWeight: config.typography?.fontWeight || '400',
            
            // Sizing
            widgetWidth: config.sizing?.widgetWidth || '350px',
            widgetHeight: config.sizing?.widgetHeight || '500px',
            borderRadius: config.sizing?.borderRadius || '16px',
            messageBorderRadius: config.sizing?.messageBorderRadius || '12px',
            launcherSize: config.sizing?.launcherSize || '60px',
            
            // Behavior
            opacity: config.behavior?.opacity || 1,
            autoOpen: config.behavior?.autoOpen || false,
            autoOpenDelay: config.behavior?.autoOpenDelay || 3000,
            showTypingIndicator: config.behavior?.showTypingIndicator !== false,
            soundEnabled: config.behavior?.soundEnabled || false,
            
            // Animation
            animationType: config.animation?.type || 'scale',
            animationDuration: config.animation?.duration || '0.3s',
            animationEasing: config.animation?.easing || 'ease-out',
            slideDirection: config.animation?.slideDirection || 'bottom-right',
            
            // Legacy fields for backward compatibility
            colorTheme: config.colorTheme,
            darkMode: config.darkMode,
        };

        return NextResponse.json(flatConfig);

    } catch (error) {
        console.error('Error fetching bot config:', error);
        return NextResponse.json({ error: 'Failed to fetch bot configuration' }, { status: 500 });
    }
} 