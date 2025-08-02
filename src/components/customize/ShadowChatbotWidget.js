import { useEffect, useRef } from 'react';

export function ShadowChatbotWidget({ botData, isOpen, setIsOpen }) {
    const shadowRef = useRef(null);
    const widgetRef = useRef(null);
    const themeVarsRef = useRef(null);
    const botNameSpanRef = useRef(null);
    const logoRef = useRef(null);
    const inputRef = useRef(null);
    const sendBtnRef = useRef(null);
    const greetingMessageRef = useRef(null);
    const launcherRef = useRef(null);

    useEffect(() => {
        if (!shadowRef.current) return;

        const shadowRoot = shadowRef.current.shadowRoot || shadowRef.current.attachShadow({ mode: 'open' });

        // Initial setup: only run once to create the basic structure
        if (!shadowRoot.querySelector('link[href="/widget/styles/core.css"]')) {
            shadowRoot.innerHTML = ''; // Clear previous content

            // Load core CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/widget/styles/core.css';
            shadowRoot.appendChild(link);

            // Create theme variables style tag
            const themeVars = document.createElement('style');
            themeVarsRef.current = themeVars;
            shadowRoot.appendChild(themeVars);

            // Add preview-specific styles if the host has the preview class
            // This is for positioning the widget/launcher within the preview container
            const previewPositionStyle = document.createElement('style');
            previewPositionStyle.textContent = `
                .chatrio-widget {
                    position: absolute !important;
                }
                .chatrio-launcher {
                    position: absolute !important;
                }
            `;
            shadowRoot.appendChild(previewPositionStyle);

            // Create and append widget elements
            const widgetDiv = document.createElement('div');
            widgetDiv.className = 'chatrio-widget';
            widgetRef.current = widgetDiv;
            shadowRoot.appendChild(widgetDiv);

            // Create and append launcher element
            const launcherDiv = document.createElement('div');
            launcherDiv.className = 'chatrio-launcher';
            launcherRef.current = launcherDiv;
            shadowRoot.appendChild(launcherDiv);

            // Header
            const header = document.createElement('div');
            header.className = 'chatrio-header';
            const headerContent = document.createElement('div');
            headerContent.style.display = 'flex';
            headerContent.style.alignItems = 'center';
            headerContent.style.gap = '10px';
            
            const logo = document.createElement('img');
            logo.alt = 'Logo';
            logo.style.width = '28px';
            logo.style.height = '28px';
            logo.style.borderRadius = '50%';
            logo.style.objectFit = 'cover';
            logoRef.current = logo;
            headerContent.appendChild(logo);
            
            const botNameSpan = document.createElement('span');
            botNameSpanRef.current = botNameSpan;
            headerContent.appendChild(botNameSpan);
            header.appendChild(headerContent);
            const closeBtn = document.createElement('button');
            closeBtn.className = 'chatrio-close-btn';
            closeBtn.innerHTML = '&times;';
            closeBtn.onclick = () => setIsOpen(false);
            header.appendChild(closeBtn);
            widgetDiv.appendChild(header);

            // Messages container
            const messages = document.createElement('div');
            messages.className = 'chatrio-messages';
            widgetDiv.appendChild(messages);

            // Sample messages
            const addMessage = (role, text, ref) => {
                const m = document.createElement('div');
                m.className = `chatrio-message chatrio-message-${role}`;
                m.textContent = text;
                if (ref) ref.current = m;
                messages.appendChild(m);
                messages.scrollTop = messages.scrollHeight;
            };

            addMessage('assistant', '', greetingMessageRef); 
            addMessage('user', "This is a sample message!");

            // Input Area
            const inputArea = document.createElement('div');
            inputArea.className = 'chatrio-input-area';
            const input = document.createElement('input');
            input.className = 'chatrio-input';
            input.disabled = true;
            inputRef.current = input;
            const sendBtn = document.createElement('button');
            sendBtn.className = 'chatrio-send-btn';
            sendBtnRef.current = sendBtn;
            inputArea.append(input, sendBtn);
            widgetDiv.appendChild(inputArea);
        }

        // Update logic: runs on botData or isOpen changes
        if (botData) {
            // Update theme variables
            if (themeVarsRef.current) {
                themeVarsRef.current.textContent = `:host { 
                    --chatrio-bg: ${botData.backgroundColor || '#fff'};
                    --chatrio-text: ${botData.textColor || '#000'};
                    --chatrio-border-color: ${botData.borderColor || '#e5e5e5'};
                    --chatrio-header-bg: ${botData.headerBg || '#000'};
                    --chatrio-header-text: ${botData.headerText || '#fff'};
                    --chatrio-messages-bg: ${botData.messagesBg || '#fafbfc'};
                    --chatrio-input-bg: ${botData.inputBg || '#fff'};
                    --chatrio-user-bg: ${botData.userBg || '#e6f0ff'};
                    --chatrio-user-text: ${botData.userText || '#222'};
                    --chatrio-assistant-bg: ${botData.assistantBg || '#f3f3f3'};
                    --chatrio-assistant-text: ${botData.assistantText || '#444'};
                    --chatrio-send-button-bg: ${botData.sendButtonBg || '#000'};
                    --chatrio-send-button-text: ${botData.sendButtonText || '#fff'};
                    --chatrio-launcher-bg: ${botData.launcherBg || '#000'};
                    --chatrio-launcher-text: ${botData.launcherText || '#fff'};
                    
                    /* Typography */
                    --chatrio-font-family: ${botData.fontFamily || 'Inter'}, Arial, sans-serif;
                    --chatrio-font-size: ${botData.fontSize || '14px'};
                    --chatrio-header-font-size: ${botData.headerFontSize || '16px'};
                    --chatrio-message-font-size: ${botData.messageFontSize || '14px'};
                    --chatrio-font-weight: ${botData.fontWeight || '400'};
                    
                    /* Sizing */
                    --chatrio-widget-width: ${botData.widgetWidth || '350px'};
                    --chatrio-widget-height: ${botData.widgetHeight || '500px'};
                    --chatrio-border-radius: ${botData.borderRadius || '16px'};
                    --chatrio-message-border-radius: ${botData.messageBorderRadius || '12px'};
                    --chatrio-launcher-size: ${botData.launcherSize || '60px'};
                    
                    /* Behavior */
                    --chatrio-opacity: ${botData.opacity || 1};
                    
                    /* Animation */
                    --chatrio-animation-duration: ${botData.animationDuration || '0.4s'};
                    --chatrio-animation-easing: ${botData.animationEasing || 'cubic-bezier(0.25, 0.8, 0.25, 1)'};
                }`;
            }

            // Update header content
            if (botData.logoUrl) {
                if (logoRef.current) {
                    logoRef.current.src = botData.logoUrl;
                    logoRef.current.style.display = 'inline-block';
                }
            } else {
                if (logoRef.current) {
                    logoRef.current.style.display = 'none';
                }
            }
            if (botNameSpanRef.current) {
                botNameSpanRef.current.textContent = botData.botName || 'Chatrio AI Bot';
            }

            // Update input area
            if (inputRef.current) {
                inputRef.current.placeholder = botData.inputPlaceholder || 'Type a message...';
            }
            if (sendBtnRef.current) {
                sendBtnRef.current.textContent = botData.sendButtonIcon || 'Send';
            }

            // Update greeting message
            if (greetingMessageRef.current) {
                greetingMessageRef.current.textContent = botData.greetingMessage || "Hello! How can I help?";
            }

            // Update launcher icon/text
            if (launcherRef.current) {
                if (botData.launcherIconUrl) {
                    launcherRef.current.innerHTML = ''; // Clear previous content
                    const launcherImg = document.createElement('img');
                    launcherImg.src = botData.launcherIconUrl;
                    launcherImg.alt = 'Chat';
                    launcherImg.style.width = '60%';
                    launcherImg.style.height = '60%';
                    launcherImg.style.objectFit = 'contain';
                    launcherRef.current.appendChild(launcherImg);
                } else {
                    launcherRef.current.innerHTML = botData.launcherIcon || '💬';
                }
            }

            // Update widget open/close state
            if (widgetRef.current) {
                if (isOpen) {
                    widgetRef.current.classList.add('open');
                } else {
                    widgetRef.current.classList.remove('open');
                }
            }
        }

        // Handle animation events for preview
        const handleAnimationTrigger = (event) => {
            const { type } = event.detail;
            if (widgetRef.current) {
                widgetRef.current.classList.remove('scale', 'slide', 'fade', 'bounce'); // Remove previous
                widgetRef.current.classList.add(type);
                setTimeout(() => {
                    widgetRef.current.classList.remove(type);
                }, parseFloat(botData.animationDuration) * 1000);
            }
        };
        window.addEventListener('triggerChatbotAnimation', handleAnimationTrigger);

        return () => {
            window.removeEventListener('triggerChatbotAnimation', handleAnimationTrigger);
        };

    }, [botData, isOpen]); // botData and isOpen are dependencies

    // Handle launcher toggle (separate useEffect for clarity and dependency management)
    useEffect(() => {
        if (!launcherRef.current || !widgetRef.current || !botData) return;

        const launcher = launcherRef.current;
        const widget = widgetRef.current;

        if (isOpen) {
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
            }, parseFloat(botData.animationDuration) * 1000 + 50 || 450);
        }
    }, [isOpen, botData]);

    // Attach click handler to launcher (only once)
    useEffect(() => {
        if (launcherRef.current) {
            launcherRef.current.onclick = () => setIsOpen(true);
        }
    }, [setIsOpen]);

    return (
        <div ref={shadowRef} className="absolute chatrio-preview-container" style={{
            bottom: '24px', right: '24px',
            width: botData.launcherSize || '60px', height: botData.launcherSize || '60px',
            zIndex: 50
        }}>
            {/* Shadow DOM content will be rendered here */}
        </div>
    );
}