import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/server/utils/jwt.utils';
import User from '@/server/models/user.model';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
    try {
        await connectDB();

        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { botId, ...requestData } = await req.json();
        if (!botId) {
            return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const bot = user.bots.find(b => b.botId === botId);
        if (!bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        // Structure the configuration from the request data
        const config = {
            // Bot Identity
            botName: requestData.botName || 'Chatrio AI',
            greetingMessage: requestData.greetingMessage || 'Hi there! How can I help you today?',
            tone: requestData.tone || 'helpful',
            inputPlaceholder: requestData.inputPlaceholder || 'Type a message...',
            additionalContent: requestData.additionalContent || '',
            
            // Nested configurations
            branding: requestData.branding || {
                logoUrl: '',
                launcherIcon: '💬',
                launcherIconUrl: '',
                sendButtonIcon: 'Send',
            },
            
            colors: requestData.colors || {
                headerBg: '#000000',
                headerText: '#ffffff',
                backgroundColor: '#ffffff',
                textColor: '#000000',
                borderColor: '#e5e5e5',
                messagesBg: '#fafbfc',
                inputBg: '#ffffff',
                userBg: '#e6f0ff',
                userText: '#222222',
                assistantBg: '#f3f3f3',
                assistantText: '#444444',
                sendButtonBg: '#000000',
                sendButtonText: '#ffffff',
                launcherBg: '#000000',
                launcherText: '#ffffff',
            },
            
            typography: requestData.typography || {
                fontFamily: 'Inter',
                fontSize: '14px',
                headerFontSize: '16px',
                messageFontSize: '14px',
                fontWeight: '400',
            },
            
            sizing: requestData.sizing || {
                widgetWidth: '350px',
                widgetHeight: '500px',
                borderRadius: '16px',
                messageBorderRadius: '12px',
                launcherSize: '60px',
            },
            
            behavior: requestData.behavior || {
                opacity: 1,
                autoOpen: false,
                autoOpenDelay: 3000,
                showTypingIndicator: true,
                soundEnabled: false,
            },
            
            animation: requestData.animation || {
                type: 'scale',
                duration: '0.3s',
                easing: 'ease-out',
                slideDirection: 'bottom-right',
            },
            
            // Legacy fields for backward compatibility
            colorTheme: requestData.colorTheme,
            darkMode: requestData.darkMode,
        };

        // Update bot with final configuration
        bot.config = config;
        bot.status = 'active';

        await user.save();

        // After user.save();
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');
        const botsDir = path.join(process.cwd(), 'public', 'bots');
        if (!fs.existsSync(botsDir)) {
          fs.mkdirSync(botsDir, { recursive: true });
        }
        const botScriptPath = path.join(botsDir, `${botId}.js`);
        const botScriptContent = `
            window.chatrioConfig = {
            botId: '${botId}',
            apiUrl: '${baseUrl}/api/bot/chat'
            };
            (function(){
            var s = document.createElement('script');
            s.src = '${baseUrl}/widget/index.js';
            s.async = true;
            document.body.appendChild(s);
            })();
        `;
        fs.writeFileSync(botScriptPath, botScriptContent, 'utf8');

        // Remove trailing slash
        const botScriptUrl = `${baseUrl}/bots/${botId}.js`;

        // Option 1: Just the short script
        const embedCode = `<script src="${botScriptUrl}" async></script>`;

        return NextResponse.json({
            success: true,
            message: 'Bot created successfully!',
            botId: botId,
            embedCode: embedCode,
        });

    } catch (error) {
        console.error('Error creating bot:', error);
        return NextResponse.json({ error: error.message || 'Failed to create bot.' }, { status: 500 });
    }
} 