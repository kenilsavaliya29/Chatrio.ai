'use client';

import { useState, useEffect, memo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowsPointingOutIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import CustomizePanel from '@/components/customize/CustomizePanel';
import { Loader2 } from 'lucide-react';

// This is the full ChatbotPreview component, now co-located with the editor that uses it.
const ChatbotPreview = memo(({ botData }) => {
    const [isOpen, setIsOpen] = useState(true);
    const previewUrl = botData?.url || '';

    if (!botData) {
        return <div className="w-full h-full flex items-center justify-center bg-gray-100"><Loader2 className="w-6 h-6 animate-spin" /></div>;
    }
    
    return (
        <div className="relative w-full h-full bg-gray-100 rounded-xl overflow-hidden">
            <div className="absolute inset-0">
                {previewUrl ? (
                    <iframe src={previewUrl} title="Website Preview" className="w-full h-full" sandbox="allow-scripts allow-same-origin" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center"><p className="text-muted-foreground">No URL provided</p></div>
                )}
            </div>
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />
            <motion.div
                className="absolute flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:scale-105"
                style={{
                    bottom: '24px', right: '24px',
                    width: botData.sizing?.launcherSize || '60px', height: botData.sizing?.launcherSize || '60px',
                    background: botData.colors?.launcherBg, color: botData.colors?.launcherText,
                    borderRadius: '50%', fontFamily: botData.typography?.fontFamily, zIndex: 50
                }}
                onClick={() => setIsOpen(true)}
                animate={isOpen ? "closed" : "open"}
                variants={{ open: { opacity: 1, scale: 1 }, closed: { opacity: 0, scale: 0 } }}
            >
                {botData.branding?.launcherIconUrl ? <img src={botData.branding.launcherIconUrl} alt="Launcher" className="w-3/5 h-3/5 object-contain" /> : (botData.branding?.launcherIcon || '💬')}
            </motion.div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="absolute shadow-2xl flex flex-col"
                        style={{
                            bottom: '24px', right: '24px', maxWidth: '90vw',
                            width: botData.sizing?.widgetWidth, height: botData.sizing?.widgetHeight,
                            fontFamily: botData.typography?.fontFamily, opacity: botData.behavior?.opacity,
                            borderRadius: botData.sizing?.borderRadius, border: `1px solid ${botData.colors?.borderColor}`,
                            background: botData.colors?.backgroundColor, zIndex: 50
                        }}
                        initial={{ scale: 0, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0, y: 50 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <div className="p-3 flex items-center justify-between flex-shrink-0" style={{ background: botData.colors?.headerBg, color: botData.colors?.headerText, fontSize: botData.typography?.headerFontSize, fontWeight: 'bold' }}>
                            <div className="flex items-center gap-2 truncate">
                                {botData.branding?.logoUrl && <img src={botData.branding.logoUrl} alt="Logo" className="w-7 h-7 rounded-full" />}
                                <span className="truncate">{botData.botName}</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-xl leading-none opacity-80 hover:opacity-100">&times;</button>
                        </div>
                        <div className="flex-1 p-3 space-y-3 overflow-y-auto" style={{ background: botData.colors?.messagesBg }}>
                            <div className="flex justify-start"><div className="px-3 py-2" style={{ background: botData.colors?.assistantBg, color: botData.colors?.assistantText, borderRadius: botData.sizing?.messageBorderRadius, fontSize: botData.typography?.messageFontSize }}>{botData.greetingMessage || "Hello! How can I help?"}</div></div>
                            <div className="flex justify-end"><div className="px-3 py-2" style={{ background: botData.colors?.userBg, color: botData.colors?.userText, borderRadius: botData.sizing?.messageBorderRadius, fontSize: botData.typography?.messageFontSize }}>This is a sample message!</div></div>
                        </div>
                        <div className="flex border-t" style={{ borderColor: botData.colors?.borderColor, background: botData.colors?.inputBg }}>
                            <input className="flex-1 px-4 py-3 outline-none bg-transparent" placeholder={botData.inputPlaceholder} style={{ color: botData.colors?.textColor, fontSize: botData.typography?.fontSize }} disabled />
                            <button className="px-4 py-3 font-medium" style={{ background: botData.colors?.sendButtonBg, color: botData.colors?.sendButtonText }}>{botData.branding?.sendButtonIcon}</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
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
                    setBotData({ ...data.config, botName: data.name, url: data.url });
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
            if (key) {
                newState[field] = { ...(newState[field] || {}), [key]: value };
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
                router.push('/dashboard?tab=customize');
            } else {
                console.error("Failed to save bot changes");
            }
        } catch (error) {
            console.error("Error saving bot:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || !botData) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="flex h-full w-full " style={{ height: 'calc(100vh - 90px)'}}>
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