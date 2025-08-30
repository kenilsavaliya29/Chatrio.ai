'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function WidgetPreviewContent() {
  const searchParams = useSearchParams();
  const configParam = searchParams.get('config');

  useEffect(() => {
    let config = {};
    if (configParam) {
      try {
        config = JSON.parse(decodeURIComponent(configParam));
      } catch (e) {
        console.error('Error parsing config from URL:', e);
      }
    }

    // Load core CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/widget/styles/core.css';
    document.head.appendChild(link);

    // Enhanced theme variables with all customization options
    const themeVars = document.createElement('style');
    themeVars.textContent = `:root { 
      --chatrio-bg: ${config.backgroundColor || '#ffffff'};
      --chatrio-text: ${config.textColor || '#1a1a1a'};
      --chatrio-border-color: ${config.borderColor || '#e5e5e5'};
      --chatrio-header-bg: ${config.headerBg || '#667eea'};
      --chatrio-header-text: ${config.headerText || '#fff'};
      --chatrio-messages-bg: ${config.messagesBg || '#f8fafc'};
      --chatrio-input-bg: ${config.inputBg || '#fff'};
      --chatrio-user-bg: ${config.userBg || '#667eea'};
      --chatrio-user-text: ${config.userText || '#fff'};
      --chatrio-assistant-bg: ${config.assistantBg || '#ffffff'};
      --chatrio-assistant-text: ${config.assistantText || '#1a1a1a'};
      --chatrio-send-button-bg: ${config.sendButtonBg || '#667eea'};
      --chatrio-send-button-text: ${config.sendButtonText || '#fff'};
      --chatrio-launcher-bg: ${config.launcherBg || '#667eea'};
      --chatrio-launcher-text: ${config.launcherText || '#fff'};
      
      /* Typography */
      --chatrio-font-family: ${config.fontFamily || 'Inter'}, -apple-system, BlinkMacSystemFont, sans-serif;
      --chatrio-font-size: ${config.fontSize || '14px'};
      --chatrio-header-font-size: ${config.headerFontSize || '16px'};
      --chatrio-message-font-size: ${config.messageFontSize || '14px'};
      --chatrio-font-weight: ${config.fontWeight || '400'};
      
      /* Sizing */
      --chatrio-widget-width: ${config.widgetWidth || '380px'};
      --chatrio-widget-height: ${config.widgetHeight || '400px'};
      --chatrio-border-radius: ${config.borderRadius || '14px'};
      --chatrio-message-border-radius: ${config.messageBorderRadius || '18px'};
      --chatrio-launcher-size: ${config.launcherSize || '64px'};
      
      /* Behavior */
      --chatrio-opacity: ${config.opacity || 1};
      
      /* Animation */
      --chatrio-animation-duration: ${config.animationDuration || '0.4s'};
      --chatrio-animation-easing: ${config.animationEasing || 'cubic-bezier(0.25, 0.8, 0.25, 1)'};
    }`;
    document.head.appendChild(themeVars);

    // UI Building
    const rootDiv = document.createElement('div');
    rootDiv.id = 'chatrio-root';
    document.body.appendChild(rootDiv);

    const launcher = document.createElement('div');
    launcher.className = 'chatrio-launcher';
    
    if (config.launcherIconUrl) {
      const launcherImg = document.createElement('img');
      launcherImg.src = config.launcherIconUrl;
      launcherImg.alt = 'Chat';
      launcherImg.style.width = '60%';
      launcherImg.style.height = '60%';
      launcherImg.style.objectFit = 'contain';
      launcher.appendChild(launcherImg);
    } else {
      launcher.innerHTML = config.launcherIcon || '💬';
    }
    rootDiv.appendChild(launcher);

    const widget = document.createElement('div');
    widget.className = 'chatrio-widget';
    rootDiv.appendChild(widget);

    // Header
    const header = document.createElement('div');
    header.className = 'chatrio-header';
    
    const headerContent = document.createElement('div');
    headerContent.style.display = 'flex';
    headerContent.style.alignItems = 'center';
    headerContent.style.gap = '10px';
    
    if (config.logoUrl) {
      const logo = document.createElement('img');
      logo.src = config.logoUrl;
      logo.alt = 'Logo';
      logo.style.width = '28px';
      logo.style.height = '28px';
      logo.style.borderRadius = '50%';
      logo.style.objectFit = 'cover';
      headerContent.appendChild(logo);
    }
    
    const botNameSpan = document.createElement('span');
    botNameSpan.textContent = config.botName || 'Chatrio AI Bot';
    headerContent.appendChild(botNameSpan);
    
    header.appendChild(headerContent);
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'chatrio-close-btn';
    closeBtn.innerHTML = '&times;';
    header.appendChild(closeBtn);
    widget.appendChild(header);

    // Messages container
    const messages = document.createElement('div');
    messages.className = 'chatrio-messages';
    widget.appendChild(messages);

    // Input Area
    const inputArea = document.createElement('div');
    inputArea.className = 'chatrio-input-area';
    const input = document.createElement('input');
    input.className = 'chatrio-input';
    input.placeholder = config.inputPlaceholder || 'Type a message...';
    const sendBtn = document.createElement('button');
    sendBtn.className = 'chatrio-send-btn';
    sendBtn.textContent = config.sendButtonIcon || 'Send';
    inputArea.append(input, sendBtn);
    widget.appendChild(inputArea);

    // Helpers
    let conversationHistory = [];
    
    const addMessage = (role, text) => {
      const m = document.createElement('div');
      m.className = `chatrio-message chatrio-message-${role}`;
      m.textContent = text;
      messages.appendChild(m);
      messages.scrollTop = messages.scrollHeight;
      
      conversationHistory.push({ role, content: text });
    };

    // Events
    const toggle = open => {
      if (open) {
        widget.classList.add('open');
        launcher.style.opacity = '0';
        launcher.style.pointerEvents = 'none';
        launcher.style.visibility = 'hidden';
      } else {
        widget.classList.remove('open');
        setTimeout(() => {
          launcher.style.opacity = '1';
          launcher.style.pointerEvents = 'auto';
          launcher.style.visibility = 'visible';
        }, parseFloat(config.animationDuration) * 1000 + 50 || 450);
      }
    };

    launcher.onclick = () => {
      toggle(true);
      resetConversation();
    };
    closeBtn.onclick = () => toggle(false);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') sendBtn.click(); });

    sendBtn.onclick = async () => {
      const msg = input.value.trim();
      if (!msg) return;
      addMessage('user', msg);
      input.value = '';
      
      if (config.showTypingIndicator !== false) {
        addMessage('assistant', '...');
      }
      
      try {
        // In preview, we don't actually send messages to the API
        // Simulate a response
        setTimeout(() => {
          const simulatedResponse = config.greetingMessage || 'Hello! How can I help?';
          if (config.showTypingIndicator !== false && messages.lastChild) {
            messages.lastChild.textContent = simulatedResponse;
            conversationHistory.push({ role: 'assistant', content: simulatedResponse });
          } else {
            addMessage('assistant', simulatedResponse);
          }
        }, 1000); // Simulate network delay
      } catch (err) {
        if (config.showTypingIndicator !== false && messages.lastChild) {
          messages.lastChild.textContent = 'Error in preview simulation.';
          conversationHistory.push({ role: 'assistant', content: 'Error in preview simulation.' });
        } else {
          addMessage('assistant', 'Error in preview simulation.');
        }
      }
    };

    // Auto-open functionality (for preview)
    if (config.autoOpen) {
      setTimeout(() => {
        toggle(true);
      }, config.autoOpenDelay || 3000);
    }

    // Initial greeting message (for preview)
    if (config.greetingMessage) {
      setTimeout(() => {
        addMessage('assistant', config.greetingMessage);
      }, 500);
    }
    
    const resetConversation = () => {
      conversationHistory = [];
      messages.innerHTML = '';
      if (config.greetingMessage) {
        setTimeout(() => {
          addMessage('assistant', config.greetingMessage);
        }, 500);
      }
    };

    // Init closed
    toggle(false);

    // Clean up function
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(themeVars);
      document.body.removeChild(rootDiv);
    };
  }, [configParam]);

  return null; // This page will render the widget directly into the body
}

export default function WidgetPreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Preparing your widget preview</p>
        </div>
      </div>
    }>
      <WidgetPreviewContent />
    </Suspense>
  );
}