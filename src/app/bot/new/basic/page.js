'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBotCreation } from '@/context/BotCreationContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AlertDialog } from '@/components/ui/AlertDialog'; 

export default function BasicInfoPage() {
    const router = useRouter();
    const { botData = {}, handleInputChange, setProcessedData } = useBotCreation(); 
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [existingBotData, setExistingBotData] = useState(null);
    // Progress state + SSE
    const [progress, setProgress] = useState({ percent: 0, step: 'queued', message: '' });
    const [eventSource, setEventSource] = useState(null);
    const [displayPercent, setDisplayPercent] = useState(0);
    const animFrameRef = useRef(null);


    const validate = () => {
        const newErrors = {};
        if (!botData.name.trim()) newErrors.name = 'Bot name is required';
        
        // More lenient URL validation regex that allows for optional protocol
        const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

        if (!botData.url || !urlPattern.test(botData.url)) {
            newErrors.url = 'Please enter a valid URL';
        }
        if (!botData.consent) newErrors.consent = 'You must agree to the terms';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (!validate()) return;
        
        let correctedUrl = botData.url;
        if (!/^https?:\/\//i.test(correctedUrl)) {
            correctedUrl = 'https://' + correctedUrl;
        }

        setIsProcessing(true);
        setErrors({});

        try {
            // First, check if reports already exist for this URL
            const checkRes = await fetch('/api/bot/check-reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    url: correctedUrl, 
                    name: botData.name 
                }),
            });
            const checkData = await checkRes.json();
            // console.log(checkData)

            if (checkRes.ok) {
                if (checkData.reportsExist) {
                    setExistingBotData(checkData);
                    setIsAlertDialogOpen(true);
                    return;
                } else if (checkData.botId && checkData.progress) {
                    setProgress({
                        percent: checkData.progress.percent ?? 0,
                        step: checkData.progress.step || 'queued',
                        message: checkData.progress.message || ''
                    });
                }
            }

            await initiateProcessing(correctedUrl, botData.name, checkData.botId);

        } catch (error) {
            setErrors({ general: 'An error occurred. Please try again.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmExistingBot = () => {
        setIsAlertDialogOpen(false);
        if (existingBotData) {
            handleInputChange('url', null, existingBotData.url || ''); 
            setProcessedData(existingBotData); 
            router.push(`/bot/new/customize?botId=${existingBotData.botId}&status=${existingBotData.status}`);
        }
    };

    const initiateProcessing = async (urlToProcess, nameToProcess, botIdToUse) => {
        setIsProcessing(true);
        setErrors({});
        try {
            // If we have an existing draft botId, open SSE to stream progress
            if (botIdToUse) {
                const es = new EventSource(`/api/bot/progress/stream?botId=${encodeURIComponent(botIdToUse)}`);
                es.addEventListener('progress', (e) => {
                    try {
                        const data = JSON.parse(e.data || '{}');
                        setProgress({ percent: data.percent ?? 0, step: data.step || 'queued', message: data.message || '' });
                    } catch {}
                });
                es.addEventListener('error', () => {
                    // stream may close on completion
                });
                setEventSource(es);
            }
            const res = await fetch('/api/bot/process-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: urlToProcess,
                    name: nameToProcess,
                    botId: botIdToUse 
                }),
            });
            const data = await res.json();
            // console.log(data)
            
            if (res.ok && data.success) {
                handleInputChange('url', null, urlToProcess);
                if (eventSource) {
                    try { eventSource.close(); } catch {}
                    setEventSource(null);
                }
                router.push(`/bot/new/customize?botId=${data.botId}&status=${data.status}`);
            } else {
                setErrors({ general: data.error || 'Failed to initiate processing.' });
            }
        } catch (error) {
            setErrors({ general: 'An error occurred while initiating processing. Please try again.' });
        } finally {
            setIsProcessing(false);
        }
    };

    // Cleanup SSE + animations
    useEffect(() => {
        return () => {
            if (eventSource) {
                try { eventSource.close(); } catch {}
            }
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [eventSource]);

    // Smooth progress animation
    useEffect(() => {
        const start = displayPercent;
        const end = Math.max(0, Math.min(100, Number(progress.percent) || 0));
        if (end === start) return;
        const duration = 800;
        let startTs = null;
        const step = (ts) => {
            if (startTs === null) startTs = ts;
            const t = Math.min(1, (ts - startTs) / duration);
            const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            const value = start + (end - start) * eased;
            setDisplayPercent(value);
            if (t < 1) {
                animFrameRef.current = requestAnimationFrame(step);
            } else {
                setDisplayPercent(end);
            }
        };
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = requestAnimationFrame(step);
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [progress.percent]);

    return (
        <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="space-y-6 max-w-lg mx-auto p-6 sm:p-8"
        >
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
                <h2 className="text-2xl font-bold text-foreground">Name Your Chatbot</h2>
                <p className="text-muted-foreground mb-4">Give your chatbot a unique name.</p>
                <div className="relative">
                    <input
                        id="bot-name-input"
                        type="text"
                        value={botData.name}
                        onChange={(e) => handleInputChange('name', null, e.target.value)}
                        className={`peer mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-destructive' : 'border-border'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background`}
                        placeholder=" "
                        required
                    />
                    <label htmlFor="bot-name-input" className="pointer-events-none absolute text-sm text-muted-foreground duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-background px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
                        Bot Name
                    </label>
                    {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
                <h2 className="text-2xl font-bold text-foreground">Website URL</h2>
                <p className="text-muted-foreground mb-4">Enter the website your bot will learn from.</p>
                <div className="relative">
                    <input
                        id="bot-url-input"
                        type="url"
                        value={botData.url}
                        onChange={(e) => handleInputChange('url', null, String(e.target.value || ''))}
                        className={`peer mt-1 block w-full px-3 py-2 border ${errors.url ? 'border-destructive' : 'border-border'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background`}
                        placeholder=" "
                        required
                    />
                    <label htmlFor="bot-url-input" className="pointer-events-none absolute text-sm text-muted-foreground duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-background px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
                        Website URL
                    </label>
                    {errors.url && <p className="mt-1 text-sm text-destructive">{errors.url}</p>}
                </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
                <div className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        checked={botData.consent}
                        onChange={(e) => handleInputChange('consent', null, e.target.checked)}
                        className={`h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded ${errors.consent ? 'border-destructive' : ''}`}
                        required
                    />
                    <label className="text-sm text-foreground">
                        I allow Chatrio.ai to scrape my site for training. <Link href="/terms" className="text-primary hover:underline">Terms</Link>
                    </label>
                </div>
                {errors.consent && <p className="mt-2 text-sm text-destructive">{errors.consent}</p>}
            </div>

            {errors.general && <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{errors.general}</div>}

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={isProcessing}
                className="w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
                {isProcessing ? `Processing ${Math.max(0, Math.min(100, Math.round(displayPercent)))}%` : 'Next Step'}
            </motion.button>

            {isProcessing && (
                <div className="w-full">
                    <div className="w-full h-2 bg-muted rounded overflow-hidden">
                        <div
                            className="h-2 bg-primary rounded transition-[width] duration-500 ease-in-out"
                            style={{ width: `${Math.max(0, Math.min(100, Math.round(displayPercent)))}%` }}
                        />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                        {progress.step}{progress.message ? ` • ${progress.message}` : ''}
                    </div>
                </div>
            )}

            <AlertDialog
                isOpen={isAlertDialogOpen}
                onClose={() => setIsAlertDialogOpen(false)}
                onConfirm={handleConfirmExistingBot}
                title="Existing Bot Data Found"
                message="A bot with processed data for this URL already exists. Do you want to proceed to the customization page with this data?"
                confirmText="Proceed with Existing Data"
                cancelText="Start New Processing"
            />
        </motion.div>
    );
} 