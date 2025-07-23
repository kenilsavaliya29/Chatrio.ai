'use client';

import { useBotCreation } from '@/context/BotCreationContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DeployPage() {
    const { embedCode, clearBotData } = useBotCreation();
    const router = useRouter();

    useEffect(() => {
        if (!embedCode) {
            router.push('/bot/new/basic');
        }
    }, [embedCode, router]);

    if (!embedCode) {
        return null;
    }

    const handleNavigation = (path) => {
        clearBotData();
        router.push(path);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(embedCode);
    };

    return (
        <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6 text-center max-w-2xl mx-auto"
        >
            <div className="bg-card rounded-lg p-8 border border-border shadow-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Chatbot Created Successfully!</h2>
                <p className="text-muted-foreground mt-2">
                    Your chatbot is ready. Embed it on your website by pasting the code below.
                </p>

                <div className="mt-8 text-left">
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Embed Code
                    </label>
                    <div className="relative">
                        <pre className="bg-background p-4 rounded-md font-mono text-sm overflow-x-auto border border-border">
                            <code>{embedCode}</code>
                        </pre>
                        <button
                            onClick={copyToClipboard}
                            className="absolute top-2 right-2 p-2 text-muted-foreground hover:text-foreground bg-background/50 backdrop-blur-sm rounded-md"
                        >
                            Copy
                        </button>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Add this code just before the closing <code className="bg-background px-1 py-0.5 rounded">&lt;/body&gt;</code> tag.
                    </p>
                </div>
            </div>

            <div className="mt-8 flex justify-center space-x-4">
                <button
                    onClick={() => handleNavigation('/dashboard')}
                    className="py-3 px-6 border border-border rounded-lg text-sm font-medium text-foreground bg-background hover:bg-accent"
                >
                    Go to Dashboard
                </button>
                <button
                    onClick={() => handleNavigation('/bot/new/basic')}
                    className="py-3 px-6 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90"
                >
                    Create Another Bot
                </button>
            </div>
        </motion.div>
    );
} 