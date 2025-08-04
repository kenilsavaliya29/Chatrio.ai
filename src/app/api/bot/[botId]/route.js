import { NextResponse } from 'next/server';
import connectDB from '@/server/config/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/server/utils/jwt.utils';
import User from '@/server/models/user.model';

// GET a specific bot's configuration
export async function GET(request, { params }) {
  try {
    const { botId } = await params; 
    if (!botId) {
      return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
    }

    await connectDB();
    const cookieStore = await cookies();
    const token = await cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    
    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const bot = user.bots.find(b => b.botId === botId);
    if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 });

    // Debug: Log the actual bot config from database
    console.log('Bot config from database:', bot.config);

    // Return all necessary bot data for editing
    return NextResponse.json({
        id: bot.botId,
        name: bot.name,
        url: bot.url,
        status: bot.status, 
        config: bot.config,
    });

  } catch (error) {
    console.error(`Error fetching bot ${params.botId}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT (update) a specific bot's configuration
export async function PUT(request, { params }) {
    try {
      const { botId } = await params; 
      if (!botId) {
        return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
      }
  
      const updatedConfig = await request.json();
  
      await connectDB();
      const cookieStore = await cookies();
      const token = await cookieStore.get('token')?.value;
      if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      
      const decoded = verifyToken(token);
      if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      
      const user = await User.findById(decoded.id);
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  
      const botIndex = user.bots.findIndex(b => b.botId === botId);
      if (botIndex === -1) return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
  
      // Update the bot's config
      // Convert flattened config from frontend back to nested structure for DB
      const newNestedConfig = {
          Identity: {
              botName: updatedConfig.botName,
              greetingMessage: updatedConfig.greetingMessage,
              tone: updatedConfig.tone,
              inputPlaceholder: updatedConfig.inputPlaceholder,
              additionalContent: updatedConfig.additionalContent,
          },
          Branding: {
              logoUrl: updatedConfig.logoUrl,
              launcherIcon: updatedConfig.launcherIcon,
              launcherIconUrl: updatedConfig.launcherIconUrl,
              sendButtonIcon: updatedConfig.sendButtonIcon,
          },
          Colors: {
              headerBg: updatedConfig.headerBg,
              headerText: updatedConfig.headerText,
              backgroundColor: updatedConfig.backgroundColor,
              textColor: updatedConfig.textColor,
              borderColor: updatedConfig.borderColor,
              messagesBg: updatedConfig.messagesBg,
              inputBg: updatedConfig.inputBg,
              userBg: updatedConfig.userBg,
              userText: updatedConfig.userText,
              assistantBg: updatedConfig.assistantBg,
              assistantText: updatedConfig.assistantText,
              sendButtonBg: updatedConfig.sendButtonBg,
              sendButtonText: updatedConfig.sendButtonText,
              launcherBg: updatedConfig.launcherBg,
              launcherText: updatedConfig.launcherText,
          },
          Typography: {
              fontFamily: updatedConfig.fontFamily,
              fontSize: updatedConfig.fontSize,
              headerFontSize: updatedConfig.headerFontSize,
              messageFontSize: updatedConfig.messageFontSize,
              fontWeight: updatedConfig.fontWeight,
          },
          Sizing: {
              widgetWidth: updatedConfig.widgetWidth,
              widgetHeight: updatedConfig.widgetHeight,
              borderRadius: updatedConfig.borderRadius,
              messageBorderRadius: updatedConfig.messageBorderRadius,
              launcherSize: updatedConfig.launcherSize,
          },
          Behavior: {
              opacity: updatedConfig.opacity,
              autoOpen: updatedConfig.autoOpen,
              autoOpenDelay: updatedConfig.autoOpenDelay,
              showTypingIndicator: updatedConfig.showTypingIndicator,
              soundEnabled: updatedConfig.soundEnabled,
          },
          Animation: {
              animationType: updatedConfig.animationType,
              animationDuration: updatedConfig.animationDuration,
              animationEasing: updatedConfig.animationEasing,
              slideDirection: updatedConfig.slideDirection,
          },
          // Include legacy fields if they exist and are needed
          colorTheme: updatedConfig.colorTheme,
          darkMode: updatedConfig.darkMode,
      };
      
      // Merge with existing config to preserve any fields not sent from frontend
      user.bots[botIndex].config = { ...user.bots[botIndex].config, ...newNestedConfig };
      user.bots[botIndex].name = updatedConfig.botName || user.bots[botIndex].name;
      
      await user.save();
  
      return NextResponse.json({ success: true, message: 'Bot updated successfully' });
  
    } catch (error) {
      console.error(`Error updating bot ${params.botId}:`, error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 