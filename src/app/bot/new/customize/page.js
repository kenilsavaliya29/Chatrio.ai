'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBotCreation } from '@/context/BotCreationContext';
import { motion } from 'framer-motion';

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
    const { botData, handleInputChange, setEmbedCode, processedData, clearBotData } = useBotCreation();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCreateBot = async () => {
        setIsProcessing(true);
        try {

            const finalBotData = {
                botId: processedData.botId,
                botName: botData.botName,
                greetingMessage: botData.greetingMessage,
                tone: botData.tone,
                headerBg: botData.headerBg,
                launcherBg: botData.launcherBg,
            };

            const res = await fetch('/api/bot/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalBotData),
            });

            const data = await res.json();
            if (res.ok && data.embedCode) {
                setEmbedCode(data.embedCode);
                router.push('/bot/new/deploy');
            } else {
                console.error("Failed to create bot:", data.error);
            }
        } catch (error) {
            console.error("Error creating bot:", error);
        } finally {
            setIsProcessing(false);
        }
    };

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
                onClick={handleCreateBot}
                disabled={isProcessing}
                className="w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
                {isProcessing ? 'Creating...' : 'Finish & Deploy'}
            </motion.button>
        </motion.div>
    );
} 