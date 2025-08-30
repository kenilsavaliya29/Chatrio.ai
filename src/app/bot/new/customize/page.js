'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useBotCreation } from '@/context/BotCreationContext';
import { useSearchParams } from 'next/navigation';
import { HexColorPicker } from 'react-colorful';

function CustomizeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const botId = searchParams.get('botId');
    const { botData, handleInputChange, setEmbedCode, setActiveBotId, setBotData } = useBotCreation();

    const [isProcessing, setIsProcessing] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(null);
    const [mounted, setMounted] = useState(false);

    // Tone options for the chatbot
    const toneOptions = [
        { value: 'helpful', label: 'Helpful & Supportive' },
        { value: 'friendly', label: 'Friendly & Casual' },
        { value: 'professional', label: 'Professional & Formal' },
        { value: 'enthusiastic', label: 'Enthusiastic & Energetic' },
        { value: 'empathetic', label: 'Empathetic & Caring' }
    ];

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!botId) {
            router.push('/bot/new/basic');
            return;
        }
        // Set active botId for namespaced draft storage
        setActiveBotId(botId);

        // Hydrate from server so DB is source of truth when botId exists
        let aborted = false;
        (async () => {
            try {
                const res = await fetch(`/api/bot/${botId}`);
                if (!res.ok) return; // fallback to local draft if needed
                const data = await res.json();
                if (aborted) return;
                const cfg = data?.config || {};
                // Merge nested config and also mirror a few flat keys used by this page
                setBotData(prev => ({
                    ...prev,
                    ...cfg,
                    botName: cfg.Identity?.botName ?? prev.botName,
                    greetingMessage: cfg.Identity?.greetingMessage ?? prev.greetingMessage,
                    inputPlaceholder: cfg.Identity?.inputPlaceholder ?? prev.inputPlaceholder,
                    tone: cfg.Identity?.tone ?? prev.tone,
                }));
            } catch (e) {
                // Ignore and keep local state
            }
        })();
        return () => { aborted = true; };
    }, [botId, setActiveBotId, setBotData]);

    const handleColorChange = (colorKey, value) => {
        handleInputChange('Colors', colorKey, value);
    };

    const handleSaveAndDeploy = async () => {
        setIsProcessing(true);
        try {
            // Save the bot configuration
            const resUpdate = await fetch(`/api/bot/${botId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(botData),
            });

            if (resUpdate.ok) {
                // Generate embed code
                const resCreate = await fetch('/api/bot/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ botId: botId, ...botData }),
                });

                const dataCreate = await resCreate.json();

                if (resCreate.ok && dataCreate.success) {
                    setEmbedCode(dataCreate.embedCode);
                    router.push('/bot/new/deploy');
                } else {
                    alert(dataCreate.error || 'Failed to generate embed code.');
                }
            } else {
                const errorData = await resUpdate.json();
                alert(errorData.error || 'Failed to save bot configuration.');
            }
        } catch (error) {
            alert('An unexpected error occurred.');
            console.error("Error saving bot:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!mounted) return null;

    // Get the header color with a safe fallback
    console.log(botData)
    const headerColor = botData.Colors.headerBg || '#fff';

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto space-y-6"
                >
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-2">Customize Your Chatbot</h1>
                        <p className="text-muted-foreground">
                            Personalize the appearance and behavior of your AI chatbot
                        </p>
                    </div>

                    {/* Identity Section */}
                    <div className="bg-card rounded-lg p-6 border border-border">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Identity & Behavior</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Greeting Message
                                </label>
                                <textarea
                                    value={botData.greetingMessage || ''}
                                    onChange={(e) => handleInputChange('greetingMessage', null, e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                    placeholder="Hi there! How can I help you today?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Tone & Personality
                                </label>
                                <select
                                    value={botData.tone || 'helpful'}
                                    onChange={(e) => handleInputChange('tone', null, e.target.value)}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                >
                                    {toneOptions.map((tone) => (
                                        <option key={tone.value} value={tone.value}>
                                            {tone.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Colors Section */}
                    <div className="bg-card rounded-lg p-6 border border-border">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Colors & Styling</h2>
                        
                        <div className="space-y-4">
                            {/* Single Color Picker */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Choose Color
                                </label>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowColorPicker('headerBg')}
                                        className="w-full h-12 border border-border rounded-md flex items-center justify-center hover:border-primary transition-colors"
                                        style={{ backgroundColor: headerColor }}
                                    >
                                        <span className="text-white text-sm font-medium">
                                            {headerColor}
                                        </span>
                                    </button>
                                    {showColorPicker === 'headerBg' && (
                                        <div className="absolute z-50 mt-2">
                                            <div className="fixed inset-0" onClick={() => setShowColorPicker(null)} />
                                            <div className="relative bg-background rounded-lg shadow-xl p-4">
                                                <HexColorPicker
                                                    color={headerColor}
                                                    onChange={(color) => handleColorChange('headerBg', color)}
                                                />
                                                <input
                                                    type="text"
                                                    value={headerColor}
                                                    onChange={(e) => handleColorChange('headerBg', e.target.value)}
                                                    className="mt-2 w-full px-2 py-1 text-sm border rounded"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-card rounded-lg p-6 border border-border">
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/bot/new/basic')}
                                className="w-full py-3 px-4 border border-border rounded-lg text-foreground hover:bg-background/50 transition-colors"
                            >
                                Back to Basic Info
                            </button>
                            
                            <button
                                onClick={handleSaveAndDeploy}
                                disabled={isProcessing}
                                className="w-full py-3 px-4 bg-primary text-background rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                            >
                                {isProcessing ? 'Processing...' : 'Save & Deploy'}
                            </button>
                        </div>
                        
                        <p className="text-xs text-muted-foreground text-center mt-3">
                            Click "Save & Deploy" to generate your chatbot and get the embed code
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function CustomizePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Loading...</h1>
                    <p className="text-muted-foreground">Preparing customization options</p>
                </div>
                </div>
        }>
            <CustomizeContent />
        </Suspense>
    );
} 