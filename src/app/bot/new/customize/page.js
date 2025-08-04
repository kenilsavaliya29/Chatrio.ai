'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBotCreation } from '@/context/BotCreationContext';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { useEffect } from 'react'; // Ensure useEffect is imported
import { Loader2 } from 'lucide-react'; // For loading spinner

const TextInput = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
        <input 
            type="text" 
            value={value || ''} 
            onChange={onChange} 
            placeholder={placeholder} 
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background" 
        />
    </div>
);

const SelectInput = ({ label, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
        <select 
            value={value || ''} 
            onChange={onChange} 
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        >
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const ColorInput = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
        <div className="relative">
            <input 
                type="text" 
                value={value || '#000000'} 
                onChange={onChange} 
                className="w-full pl-10 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
            <input 
                type="color" 
                value={value || '#000000'} 
                onChange={onChange}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 p-0 border-none cursor-pointer"
            />
        </div>
    </div>
);

export default function SimpleCustomizePage() {
    const router = useRouter();
    const searchParams = useSearchParams(); // Get search params
    const { botData, handleInputChange, setEmbedCode, processedData, clearBotData } = useBotCreation();
    const [isProcessing, setIsProcessing] = useState(false);

    const [botId, setBotId] = useState(null);
    const [botStatus, setBotStatus] = useState('loading'); // 'loading', 'processing', 'active', 'inactive', 'error'
    const [currentBotConfig, setCurrentBotConfig] = useState(null); // Full bot config from DB
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        const id = searchParams.get('botId');
        const status = searchParams.get('status');

        if (!id) {
            setFetchError('Bot ID is missing from URL.');
            setBotStatus('error');
            return;
        }

        setBotId(id);
        setBotStatus(status || 'loading'); // Set initial status from URL or 'loading'

        const fetchBotConfig = async () => {
            try {
                const res = await fetch(`/api/bot/${id}`);
                const data = await res.json();

                if (res.ok) {
                    setCurrentBotConfig(data.config); // Set the full config
                    setBotStatus(data.status); // Update status from DB
                    // Pre-fill botData context with fetched config for customization
                    handleInputChange('botName', null, data.name);
                    handleInputChange('greetingMessage', null, data.config.Identity?.greetingMessage);
                    handleInputChange('tone', null, data.config.Identity?.tone);
                    handleInputChange('headerBg', null, data.config.Colors?.headerBg);
                    handleInputChange('launcherBg', null, data.config.Colors?.launcherBg);
                    // ... and other fields as needed
                } else {
                    setFetchError(data.error || 'Failed to fetch bot configuration.');
                    setBotStatus('error');
                }
            } catch (err) {
                setFetchError('Network error or failed to fetch bot config.');
                setBotStatus('error');
            }
        };

        if (status === 'processing') {
            // Start polling for status updates
            const pollInterval = setInterval(async () => {
                const res = await fetch(`/api/bot/${id}`);
                const data = await res.json();
                if (res.ok && data.status !== 'processing') {
                    clearInterval(pollInterval);
                    setBotStatus(data.status); // Update to active/inactive
                    setCurrentBotConfig(data.config); // Set the full config
                    // Pre-fill botData context with fetched config for customization
                    handleInputChange('botName', null, data.name);
                    handleInputChange('greetingMessage', null, data.config.Identity?.greetingMessage);
                    handleInputChange('tone', null, data.config.Identity?.tone);
                    handleInputChange('headerBg', null, data.config.Colors?.headerBg);
                    handleInputChange('launcherBg', null, data.config.Colors?.launcherBg);
                    // ... and other fields as needed
                } else if (!res.ok) {
                    clearInterval(pollInterval);
                    setFetchError(data.error || 'Failed to poll bot status.');
                    setBotStatus('error');
                }
            }, 5000); // Poll every 5 seconds
            return () => clearInterval(pollInterval); // Cleanup on unmount
        } else if (id) {
            // If not processing, fetch config immediately
            fetchBotConfig();
        }
    }, [botId, searchParams]); // Re-run if botId or searchParams change

    const handleUpdateBotConfig = async () => {
        setIsProcessing(true);
        try {
            const finalBotData = {
                botName: botData.botName,
                greetingMessage: botData.greetingMessage,
                tone: botData.tone,
                headerBg: botData.headerBg,
                launcherBg: botData.launcherBg,
            };

            const res = await fetch(`/api/bot/${botId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalBotData),
            });

            const data = await res.json();
           
            if (res.ok) {
                console.log("Bot configuration updated successfully!");
                router.push(`/bot/new/deploy?botId=${botId}`);
            } else {
                console.error("Failed to update bot configuration:", data.error);
            }
        } catch (error) {
            console.error("Error updating bot configuration:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Conditional rendering based on botStatus
    if (botStatus === 'loading') {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="ml-2 text-muted-foreground">Loading bot configuration...</p>
            </div>
        );
    }

    if (botStatus === 'processing') {
        return (
            <div className="flex items-center justify-center h-64 flex-col">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Processing Your Bot...</h2>
                <p className="text-muted-foreground text-center">This may take a few minutes as we scrape your website and train the AI.</p>
                <p className="text-muted-foreground text-center text-sm mt-2">You can customize basic settings now, or come back later.</p>
            </div>
        );
    }

    if (botStatus === 'error') {
        return (
            <div className="flex items-center justify-center h-64 flex-col text-destructive">
                <p className="text-lg font-medium">Error: {fetchError || 'Could not load bot.'}</p>
                <p className="text-sm text-muted-foreground mt-2">Please go back to the dashboard and try again.</p>
            </div>
        );
    }

    // Render customization form only if bot is active/inactive
    return (
        <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6 max-w-lg mx-auto p-6 sm:p-8"
        >
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Quick Customize</h2>
                <p className="text-muted-foreground">Just a few details to get your bot ready. You can change everything else later from your dashboard.</p>
                
                <TextInput
                    label="Greeting Message"
                    value={botData.greetingMessage}
                    onChange={(e) => handleInputChange('greetingMessage', null, e.target.value)}
                    placeholder="Hi there! How can I help?"
                />
                
                <SelectInput
                    label="Bot Tone"
                    value={botData.tone}
                    onChange={(e) => handleInputChange('tone', null, e.target.value)}
                    options={[
                        { value: 'helpful', label: 'Helpful & Supportive' },
                        { value: 'friendly', label: 'Friendly & Casual' },
                        { value: 'professional', label: 'Professional & Formal' }
                    ]}
                />

                <ColorInput
                    label="Primary Color"
                    value={botData.headerBg}
                    onChange={(e) => {
                        handleInputChange('headerBg', null, e.target.value);
                        handleInputChange('launcherBg', null, e.target.value);
                    }}
                />
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdateBotConfig} 
                disabled={isProcessing}
                className="w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
                {isProcessing ? 'Saving...' : 'Save & Deploy'}
            </motion.button>
        </motion.div>
    );
} 