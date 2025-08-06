'use client';

import { createContext, useState, useContext, useEffect } from 'react';

const BotCreationContext = createContext();

const initialBotData = {
    // Basic Info
    name: '',
    url: '',
    consent: false,
    
    // Bot Identity
    botName: 'Chatrio AI',
    greetingMessage: 'Hi there! How can I help you today?',
    tone: 'helpful',
    inputPlaceholder: 'Type a message...',
    additionalContent: '',
    
    // Branding
    logoUrl: '',
    launcherIcon: '💬',
    launcherIconUrl: '',
    sendButtonIcon: 'Send',
    
    // Colors
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
    
    // Typography
    fontFamily: 'Inter',
    fontSize: '14px',
    headerFontSize: '16px',
    messageFontSize: '14px',
    fontWeight: '400',
    
    // Sizing
    widgetWidth: '350px',
    widgetHeight: '500px',
    borderRadius: '16px',
    messageBorderRadius: '12px',
    launcherSize: '60px',
    
    // Behavior
    opacity: 1,
    autoOpen: false,
    autoOpenDelay: 3000,
    showTypingIndicator: true,
    soundEnabled: false,
    
    // Animation
    animationType: 'scale',
    animationDuration: '0.3s',
    animationEasing: 'ease-out',
    slideDirection: 'bottom-right',
    scriptCode: '', 
};

export function BotCreationProvider({ children }) {
    const [botData, setBotData] = useState(() => {
        // Try to load from localStorage on initial render
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('botCreationData');
            if (saved) {
                return JSON.parse(saved);
            }
        }
        return initialBotData;
    });

    // Persisted processedData (result from /process-data)
    const [processedData, setProcessedData] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('botProcessedData');
            if (saved) {
                return JSON.parse(saved);
            }
        }
        return null;
    });

    // Persisted embedCode (result from /create)
    const [embedCode, setEmbedCode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('botEmbedCode') || '';
        }
        return '';
    });
    
    // Save to localStorage whenever botData changes
    useEffect(() => {
        localStorage.setItem('botCreationData', JSON.stringify(botData));
    }, [botData]);

    // Persist processedData
    useEffect(() => {
        if (processedData) {
            localStorage.setItem('botProcessedData', JSON.stringify(processedData));
        } else {
            localStorage.removeItem('botProcessedData');
        }
    }, [processedData]);

    // Persist embedCode
    useEffect(() => {
        if (embedCode) {
            localStorage.setItem('botEmbedCode', embedCode);
        } else {
            localStorage.removeItem('botEmbedCode');
        }
    }, [embedCode]);

    // Clear data when bot creation is complete
    const clearBotData = () => {
        localStorage.removeItem('botCreationData');
        localStorage.removeItem('botProcessedData');
        localStorage.removeItem('botEmbedCode');
        setBotData(initialBotData);
        setProcessedData(null);
        setEmbedCode('');
    };

    const updateBotData = (newData) => {
        setBotData(prev => ({ ...prev, ...newData }));
    };

    const handleInputChange = (category, field, value) => {
        if (field) { 
            setBotData(prev => ({
                ...prev,
                [category]: {
                    ...prev[category],
                    [field]: value
                }
            }));
        } else { 
            setBotData(prev => ({
                ...prev,
                [category]: value
            }));
        }
    };
    
    return (
        <BotCreationContext.Provider value={{ 
            botData, 
            setBotData, 
            clearBotData,
            updateBotData, 
            handleInputChange,
            processedData, 
            setProcessedData,
            embedCode,
            setEmbedCode
        }}>
            {children}
        </BotCreationContext.Provider>
    );
}

export function useBotCreation() {
    return useContext(BotCreationContext);
} 