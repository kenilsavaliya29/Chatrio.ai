import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import Bot from '@/server/models/bot.model';


export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const botId = searchParams.get('botId');
        console.log(botId)

        if (!botId) {
            return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
        }

        // Find the bot by botId
        const bot = await Bot.findOne({ botId }); 
        if (!bot || bot.status !== 'active') {
            return NextResponse.json({ error: 'Bot not found or not active' }, { status: 404 });
        }

        // Return the configuration directly since it's already flattened
        const config = bot.config || {};
        const flatConfig = {
            // Bot Identity
            botName: config.Identity?.botName || 'Chatrio AI',
            greetingMessage: config.Identity?.greetingMessage || 'Hi there! How can I help you today?',
            inputPlaceholder: config.Identity?.inputPlaceholder || 'Type a message...',
            status: bot.status,

            // Branding
            logoUrl: config.Branding?.logoUrl || '',
            launcherIcon: config.Branding?.launcherIcon || '💬',
            launcherIconUrl: config.Branding?.launcherIconUrl || '',
            sendButtonIcon: config.Branding?.sendButtonIcon || 'Send',

            // Colors
            headerBg: config.Colors?.headerBg || '#000000',
            headerText: config.Colors?.headerText || '#ffffff',
            backgroundColor: config.Colors?.backgroundColor || '#ffffff',
            textColor: config.Colors?.textColor || '#000000',
            borderColor: config.Colors?.borderColor || '#e5e5e5',
            messagesBg: config.Colors?.messagesBg || '#fafbfc',
            inputBg: config.Colors?.inputBg || '#ffffff',
            userBg: config.Colors?.userBg || '#e6f0ff',
            userText: config.Colors?.userText || '#222222',
            assistantBg: config.Colors?.assistantBg || '#f3f3f3',
            assistantText: config.Colors?.assistantText || '#444444',
            sendButtonBg: config.Colors?.sendButtonBg || '#000000',
            sendButtonText: config.Colors?.sendButtonText || '#ffffff',
            launcherBg: config.Colors?.launcherBg || '#000000',
            launcherText: config.Colors?.launcherText || '#ffffff',

            // Typography
            fontFamily: config.Typography?.fontFamily || 'Inter',
            fontSize: config.Typography?.fontSize || '14px',
            headerFontSize: config.Typography?.headerFontSize || '16px',
            messageFontSize: config.Typography?.messageFontSize || '14px',
            fontWeight: config.Typography?.fontWeight || '400',

            // Sizing
            widgetWidth: config.Sizing?.widgetWidth || '350px',
            widgetHeight: config.Sizing?.widgetHeight || '500px',
            borderRadius: config.Sizing?.borderRadius || '16px',
            messageBorderRadius: config.Sizing?.messageBorderRadius || '12px',
            launcherSize: config.Sizing?.launcherSize || '60px',

            // Behavior
            opacity: config.Behavior?.opacity || 1,
            autoOpen: config.Behavior?.autoOpen || false,
            autoOpenDelay: config.Behavior?.autoOpenDelay || 3000,
            showTypingIndicator: config.Behavior?.showTypingIndicator !== false,
            soundEnabled: config.Behavior?.soundEnabled || false,

            // Animation
            animationType: config.Animation?.animationType || 'scale',
            animationDuration: config.Animation?.animationDuration || '0.3s',
            animationEasing: config.Animation?.animationEasing || 'ease-out',
            slideDirection: config.Animation?.slideDirection || 'bottom-right',

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