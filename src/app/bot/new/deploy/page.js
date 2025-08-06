'use client';

import { useBotCreation } from '@/context/BotCreationContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DeployPage() {
    const { embedCode, clearBotData, handleInputChange } = useBotCreation();
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!embedCode) {
            router.push('/bot/new/basic');
        } else {
            handleInputChange('scriptCode', null, embedCode);
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
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 5000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-4xl mx-auto px-4 py-12"
            >
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white mb-6 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                        🎉 Your Chatbot is Ready!
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Your AI chatbot has been successfully created and is ready to be embedded on your website. 
                        Copy the code below and add it to your site to start engaging with your visitors.
                    </p>
                </motion.div>

                {/* Main Content Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="bg-card rounded-2xl border border-border/50 shadow-xl backdrop-blur-sm"
                >
                    <div className="p-8">
                        {/* Embed Code Section */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground">Embed Code</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                        Copy & Paste
                                    </span>
                                </div>
                            </div>
                            
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <pre className="relative bg-background/50 p-6 rounded-xl font-mono text-sm border border-border/50 whitespace-pre-wrap backdrop-blur-sm">
                                    <code className="text-foreground/90">{embedCode}</code>
                                </pre>
                                
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={copyToClipboard}
                                    className={`absolute top-4 right-4 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                                        copied 
                                            ? 'bg-green-500 text-white shadow-lg' 
                                            : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
                                    }`}
                                >
                                    {copied ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Copy Code
                                        </>
                                    )}
                                </motion.button>
                            </div>
                            
                            <div className="mt-4 flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border/30">
                                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p className="font-medium text-foreground mb-1">Installation Instructions:</p>
                                    <p>Add this code just before the closing <code className="bg-background/50 px-1.5 py-0.5 rounded text-xs font-mono">{"</body>"}</code> tag of your HTML page.</p>
                                </div>
                            </div>
                        </div>

                        {/* Features Preview */}
                        <div className="grid md:grid-cols-3 gap-4 mb-8">
                            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-200/20">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-foreground mb-1">Smart Conversations</h4>
                                <p className="text-xs text-muted-foreground">AI-powered responses that understand context</p>
                            </div>
                            
                            <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-200/20">
                                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-foreground mb-1">Mobile Ready</h4>
                                <p className="text-xs text-muted-foreground">Responsive design works on all devices</p>
                            </div>
                            
                            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-200/20">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                </div>
                                <h4 className="font-semibold text-foreground mb-1">Analytics</h4>
                                <p className="text-xs text-muted-foreground">Track conversations and user engagement</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNavigation('/dashboard')}
                        className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl border-2 border-border bg-background hover:bg-accent/50 transition-all duration-200 font-medium text-foreground shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Go to Dashboard
                    </motion.button>
                    
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNavigation('/bot/new/basic')}
                        className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium shadow-lg transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Another Bot
                    </motion.button>
                </motion.div>

                {/* Additional Help */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="mt-12 text-center"
                >
                    <p className="text-sm text-muted-foreground">
                        Need help? Check out our <a href="#" className="text-primary hover:underline">documentation</a> or <a href="#" className="text-primary hover:underline">contact support</a>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
} 