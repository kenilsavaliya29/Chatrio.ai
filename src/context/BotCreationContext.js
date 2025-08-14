'use client';

import { createContext, useState, useContext, useEffect } from 'react';

const BotCreationContext = createContext();

const initialBotData = {
    // Basic Info
    name: '',
    url: '',
    consent: false,

    // Bot Identity
    Identity: {
        botName: 'Chatrio AI',
        greetingMessage: 'Hi there! How can I help you today?',
        tone: 'helpful',
        inputPlaceholder: 'Type a message...',
        additionalContent: '',
    },

    Branding: {
        logoUrl: '',
        launcherIcon: '💬',
        launcherIconUrl: '',
        sendButtonIcon: 'Send',
    },

    Colors: {
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
    typography: {
        fontFamily: 'Inter',
        fontSize: '14px',
        headerFontSize: '16px',
        messageFontSize: '14px',
        fontWeight: '400',
    },

    Sizing: {
        widgetWidth: '350px',
        widgetHeight: '500px',
        borderRadius: '16px',
        messageBorderRadius: '12px',
        launcherSize: '60px',
    },

    Behavior: {
        opacity: 1,
        autoOpen: false,
        autoOpenDelay: 3000,
        showTypingIndicator: true,
        soundEnabled: false,
    },

    Animation: {
        animationType: 'scale',
        animationDuration: '0.3s',
        animationEasing: 'ease-out',
        slideDirection: 'bottom-right',
        scriptCode: '',
    }
};

export function BotCreationProvider({ children }) {
    // Track which bot we are editing (null means draft/new)
    const [activeBotId, setActiveBotId] = useState(null);

    // Helper to compute storage key per bot
    const getStorageKey = (botId) => `botCreationData:${botId || 'draft'}`;

    const [botData, setBotData] = useState(() => {
        // Initial load: attempt to load the draft key for new flow
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(getStorageKey(null));
            if (saved && saved !== 'null') {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error("Error parsing botCreationData draft from localStorage:", e);
                    return initialBotData;
                }
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

    // When activeBotId changes, try loading a saved draft for that bot
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const key = getStorageKey(activeBotId);
        const saved = localStorage.getItem(key);
        if (saved && saved !== 'null') {
            try {
                setBotData(JSON.parse(saved));
            } catch (e) {
                console.error("Error parsing per-bot botCreationData from localStorage:", e);
            }
        }
    }, [activeBotId]);

    // Save to localStorage whenever botData changes, scoped by activeBotId
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const key = getStorageKey(activeBotId);
        localStorage.setItem(key, JSON.stringify(botData));
    }, [botData, activeBotId]);

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
        // Clear both the current bot key and the draft key to avoid stale state
        try {
            localStorage.removeItem(getStorageKey(activeBotId));
            localStorage.removeItem(getStorageKey(null));
        } catch {}
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
        setBotData(prev => {
            const newState = { ...prev };

            if (category === 'consent' || category === 'name' || category === 'url') {
                newState[category] = value;
            } else if (newState[category] && field) {
                // Handle nested properties
                if (['widgetWidth', 'widgetHeight', 'borderRadius', 'messageBorderRadius', 'launcherSize'].includes(field) && typeof value === 'number') {
                    newState[category][field] = `${value}px`;
                } else {
                    newState[category][field] = value;
                }
            } else {
                // Handle top-level properties or if field is null/undefined
                newState[category] = value;
            }
            return newState;
        });
    };

    return (
        <BotCreationContext.Provider value={{
            botData,
            setBotData,
            activeBotId,
            setActiveBotId,
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