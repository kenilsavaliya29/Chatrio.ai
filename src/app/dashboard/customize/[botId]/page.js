'use client';

import { useState, useEffect, memo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CustomizePanel from '@/components/customize/CustomizePanel';
import { Loader2 } from 'lucide-react';
import { ShadowChatbotWidget } from '@/components/customize/ShadowChatbotWidget';


const ChatbotPreview = memo(({ botData }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [iframeLoadFailed, setIframeLoadFailed] = useState(false);
    const previewUrl = botData?.url || '';

    return (
        <div className="relative w-full h-full bg-gray-100 rounded-xl overflow-hidden">
            <div className="absolute inset-0">
                {previewUrl ? (
                    <iframe src={previewUrl} title="Website Preview" className="w-full h-full" sandbox="allow-scripts allow-same-origin" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center"><p className="text-muted-foreground">No URL provided</p></div>
                )}
                {iframeLoadFailed && previewUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white text-center p-4">
                        <p>
                            Could not load "{previewUrl}". This might be due to security restrictions (e.g., Content Security Policy). <br />
                            Displaying <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="underline">example.com</a> instead.
                        </p>
                    </div>
                )}
            </div>
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />
            <ShadowChatbotWidget botData={botData} isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
    );
});
ChatbotPreview.displayName = 'ChatbotPreview';

export default function EditBotPage() {
    const router = useRouter();
    const params = useParams();
    const { botId } = params;

    const [botData, setBotData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!botId) return;
        const fetchBotData = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/bot/${botId}`);
                if (res.ok) {
                    const data = await res.json();

                    const convertOldToNew = (oldConfig) => {
                        if (!oldConfig) return {};

                        // Flatten nested DB config into the flat shape used by UI and preview
                        return {
                            // Bot Identity
                            botName: oldConfig.Identity?.botName || 'Chatrio AI',
                            greetingMessage: oldConfig.Identity?.greetingMessage || 'Hi there! How can I help you today?',
                            inputPlaceholder: oldConfig.Identity?.inputPlaceholder || 'Type a message...',
                            tone: oldConfig.Identity?.tone || 'helpful',
                            additionalContent: oldConfig.Identity?.additionalContent || '',

                            // Branding
                            logoUrl: oldConfig.Branding?.logoUrl || '',
                            launcherIcon: oldConfig.Branding?.launcherIcon || '💬',
                            launcherIconUrl: oldConfig.Branding?.launcherIconUrl || '',
                            sendButtonIcon: oldConfig.Branding?.sendButtonIcon || 'Send',

                            // Colors
                            headerBg: oldConfig.Colors?.headerBg || '#000000',
                            headerText: oldConfig.Colors?.headerText || '#ffffff',
                            backgroundColor: oldConfig.Colors?.backgroundColor || '#ffffff',
                            textColor: oldConfig.Colors?.textColor || '#000000',
                            borderColor: oldConfig.Colors?.borderColor || '#e5e5e5',
                            messagesBg: oldConfig.Colors?.messagesBg || '#fafbfc',
                            inputBg: oldConfig.Colors?.inputBg || '#ffffff',
                            userBg: oldConfig.Colors?.userBg || '#e6f0ff',
                            userText: oldConfig.Colors?.userText || '#222222',
                            assistantBg: oldConfig.Colors?.assistantBg || '#f3f3f3',
                            assistantText: oldConfig.Colors?.assistantText || '#444444',
                            sendButtonBg: oldConfig.Colors?.sendButtonBg || '#000000',
                            sendButtonText: oldConfig.Colors?.sendButtonText || '#fff',
                            launcherBg: oldConfig.Colors?.launcherBg || '#000000',
                            launcherText: oldConfig.Colors?.launcherText || '#fff',

                            // Typography
                            fontFamily: oldConfig.Typography?.fontFamily || 'Inter',
                            fontSize: oldConfig.Typography?.fontSize || '14px',
                            headerFontSize: oldConfig.Typography?.headerFontSize || '16px',
                            messageFontSize: oldConfig.Typography?.messageFontSize || '14px',
                            fontWeight: oldConfig.Typography?.fontWeight || '400',

                            // Sizing
                            widgetWidth: oldConfig.Sizing?.widgetWidth || '350px',
                            widgetHeight: oldConfig.Sizing?.widgetHeight || '500px',
                            borderRadius: oldConfig.Sizing?.borderRadius || '16px',
                            messageBorderRadius: oldConfig.Sizing?.messageBorderRadius || '12px',
                            launcherSize: oldConfig.Sizing?.launcherSize || '60px',

                            // Behavior
                            opacity: typeof oldConfig.Behavior?.opacity === 'number' ? oldConfig.Behavior.opacity : 1,
                            autoOpen: oldConfig.Behavior?.autoOpen || false,
                            autoOpenDelay: typeof oldConfig.Behavior?.autoOpenDelay === 'number' ? oldConfig.Behavior.autoOpenDelay : 3000,
                            showTypingIndicator: oldConfig.Behavior?.showTypingIndicator !== false,
                            soundEnabled: !!oldConfig.Behavior?.soundEnabled,

                            // Animation
                            animationType: oldConfig.Animation?.animationType || 'scale',
                            animationDuration: oldConfig.Animation?.animationDuration || '0.3s',
                            animationEasing: oldConfig.Animation?.animationEasing || 'ease-out',
                            slideDirection: oldConfig.Animation?.slideDirection || 'bottom-right',
                        };
                    };

                    // Convert the config and ensure all required fields have default values
                    const convertedConfig = convertOldToNew(data.config);
                    const botDataWithDefaults = {
                        ...convertedConfig,
                        // Additional data
                        url: data.url,
                    };

                    console.log('Converted config:', convertedConfig);
                    setBotData(botDataWithDefaults);
                } else {
                    router.push('/dashboard?tab=customize');
                }
            } catch (error) {
                console.error("Failed to fetch bot data:", error);
                router.push('/dashboard?tab=customize');
            } finally {
                setLoading(false);
            }
        };
        fetchBotData();
    }, [botId, router]);

    const handleInputChange = (field, key, value) => {
        setBotData(prev => {
            const newState = { ...prev };
            // Ensure sizing properties always have 'px' unit if they are numeric
            if (['widgetWidth', 'widgetHeight', 'borderRadius', 'messageBorderRadius', 'launcherSize'].includes(field) && typeof value === 'number') {
                newState[field] = `${value}px`;
            } else {
                newState[field] = value;
            }
            return newState;
        });
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/bot/${botId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(botData),
            });
            if (res.ok) {
                router.push('/dashboard?tab=customize&message=Changes saved successfully!&type=success');
            } else {
                // For errors, stay on the page and show a temporary message
                const errorData = await res.json();
                alert(errorData.error || 'Failed to save bot changes.'); // Use alert for now, can be replaced by a local message box if needed
                console.error("Failed to save bot changes", errorData);
            }
        } catch (error) {
            alert('An unexpected error occurred.'); // Use alert for now
            console.error("Error saving bot:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || !botData) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    // console.log('BotData for preview:', botData);

    return (
        <div className="flex h-full w-full " style={{ height: 'calc(100vh - 90px)' }}>
            <div className="w-[75%] h-full relative">
                <ChatbotPreview botData={botData} />
            </div>
            <CustomizePanel
                botData={botData}
                handleInputChange={handleInputChange}
                onBack={() => router.push('/dashboard?tab=customize')}
                onDeploy={handleSaveChanges}
                isProcessing={isSaving}
                deployButtonText="Save Changes"
            />
        </div>
    );
} 