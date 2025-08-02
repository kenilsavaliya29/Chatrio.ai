(async function () {
  if (!window.chatrioConfig || !window.chatrioConfig.apiUrl || !window.chatrioConfig.botId) {
    console.error('Chatrio: Missing configuration.');
    return;
  }

  const baseUrl = (window.chatrioConfig.apiUrl.split('/api/bot/chat')[0] || window.location.origin).replace(/\/$/, '');

  // Fetch bot configuration
  let config = {};
  try {
    const res = await fetch(`${baseUrl}/api/bot/config?botId=${window.chatrioConfig.botId}`);
    config = await res.json();
  } catch (err) {
    console.warn('Chatrio: Could not fetch config, using defaults.', err);
  }

  /* ---------------- Shadow DOM setup ---------------- */
  const container = document.createElement('div');
  document.body.appendChild(container);
  const shadow = container.attachShadow({ mode: 'open' });

  // Load core CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `${baseUrl}/widget/styles/core.css`;
  shadow.appendChild(link);

  // Enhanced theme variables with all customization options
  const themeVars = document.createElement('style');
  themeVars.textContent = `:host { 
    --chatrio-bg: ${config.backgroundColor || '#fff'};
    --chatrio-text: ${config.textColor || '#000'};
    --chatrio-border-color: ${config.borderColor || '#e5e5e5'};
    --chatrio-header-bg: ${config.headerBg || '#000'};
    --chatrio-header-text: ${config.headerText || '#fff'};
    --chatrio-messages-bg: ${config.messagesBg || '#fafbfc'};
    --chatrio-input-bg: ${config.inputBg || '#fff'};
    --chatrio-user-bg: ${config.userBg || '#e6f0ff'};
    --chatrio-user-text: ${config.userText || '#222'};
    --chatrio-assistant-bg: ${config.assistantBg || '#f3f3f3'};
    --chatrio-assistant-text: ${config.assistantText || '#444'};
    --chatrio-send-button-bg: ${config.sendButtonBg || '#000'};
    --chatrio-send-button-text: ${config.sendButtonText || '#fff'};
    --chatrio-launcher-bg: ${config.launcherBg || '#000'};
    --chatrio-launcher-text: ${config.launcherText || '#fff'};
    
    /* Typography */
    --chatrio-font-family: ${config.fontFamily || 'Inter'}, Arial, sans-serif;
    --chatrio-font-size: ${config.fontSize || '14px'};
    --chatrio-header-font-size: ${config.headerFontSize || '16px'};
    --chatrio-message-font-size: ${config.messageFontSize || '14px'};
    --chatrio-font-weight: ${config.fontWeight || '400'};
    
    /* Sizing */
    --chatrio-widget-width: ${config.widgetWidth || '350px'};
    --chatrio-widget-height: ${config.widgetHeight || '500px'};
    --chatrio-border-radius: ${config.borderRadius || '16px'};
    --chatrio-message-border-radius: ${config.messageBorderRadius || '12px'};
    --chatrio-launcher-size: ${config.launcherSize || '60px'};
    
    /* Behavior */
    --chatrio-opacity: ${config.opacity || 1};
    
    /* Animation */
    --chatrio-animation-duration: ${config.animationDuration || '0.4s'};
    --chatrio-animation-easing: ${config.animationEasing || 'cubic-bezier(0.25, 0.8, 0.25, 1)'};
  }`;
  shadow.appendChild(themeVars);

  /* ---------------- UI Building ---------------- */
  const launcher = document.createElement('div');
  launcher.className = 'chatrio-launcher';
  
  // Use custom launcher icon or default
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
  
  shadow.appendChild(launcher);

  const widget = document.createElement('div');
  widget.className = 'chatrio-widget';
  shadow.appendChild(widget);

  // Header
  const header = document.createElement('div');
  header.className = 'chatrio-header';
  
  // Logo and bot name container
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

  /* ---------------- Helpers ---------------- */
  // Track conversation history
  let conversationHistory = [];
  
  const addMessage = (role, text) => {
    const m = document.createElement('div');
    m.className = `chatrio-message chatrio-message-${role}`;
    m.textContent = text;
    messages.appendChild(m);
    messages.scrollTop = messages.scrollHeight;
    
    // Add to conversation history
    conversationHistory.push({ role, content: text });
  };

  /* ---------------- Animation Logic ---------------- */
  // Removed getAnimationClass as animations will be purely CSS-driven

  /* ---------------- Events ---------------- */
  const toggle = open => {
    if (open) {
      widget.classList.add('open');
      launcher.style.opacity = '0'; // Fade out launcher immediately
      launcher.style.pointerEvents = 'none'; // Disable interaction during fade
      launcher.style.visibility = 'hidden'; // Hide launcher after fade out
    } else {
      widget.classList.remove('open');
      // Delay showing the launcher until the widget animation is complete
      setTimeout(() => {
        launcher.style.opacity = '1'; // Fade in launcher
        launcher.style.pointerEvents = 'auto'; // Enable interaction
        launcher.style.visibility = 'visible'; // Show launcher after fade in
      }, parseFloat(config.animationDuration) * 1000 + 50 || 450); // Match widget closing animation duration + buffer
    }
  };

  launcher.onclick = () => {
    toggle(true);
    // Reset conversation when opening widget
    resetConversation();
  };
  closeBtn.onclick = () => toggle(false);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendBtn.click(); });

  sendBtn.onclick = async () => {
    const msg = input.value.trim();
    if (!msg) return;
    addMessage('user', msg);
    input.value = '';
    
    // Show typing indicator if enabled
    if (config.showTypingIndicator !== false) {
      addMessage('assistant', '...');
    }
    
    try {
      const res = await fetch(window.chatrioConfig.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: msg, 
          botId: window.chatrioConfig.botId,
          conversationHistory: conversationHistory
        })
      });
      const data = await res.json();
      
      // Replace typing indicator or add new message
      if (config.showTypingIndicator !== false && messages.lastChild) {
        messages.lastChild.textContent = data.response || 'No response';
        // Update conversation history for assistant response
        conversationHistory.push({ role: 'assistant', content: data.response || 'No response' });
      } else {
        addMessage('assistant', data.response || 'No response');
      }
    } catch (err) {
      if (config.showTypingIndicator !== false && messages.lastChild) {
        messages.lastChild.textContent = 'Error contacting AI bot.';
        conversationHistory.push({ role: 'assistant', content: 'Error contacting AI bot.' });
      } else {
        addMessage('assistant', 'Error contacting AI bot.');
      }
    }
  };

  // Auto-open functionality
  if (config.autoOpen) {
    setTimeout(() => {
      toggle(true);
    }, config.autoOpenDelay || 3000);
  }

  // Initial greeting message
  if (config.greetingMessage) {
    setTimeout(() => {
      addMessage('assistant', config.greetingMessage);
    }, 500);
  }
  
  // Reset conversation history when widget is closed and reopened
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
})(); 