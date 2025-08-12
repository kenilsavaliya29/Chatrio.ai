'use client';

import { BotCreationProvider } from '@/context/BotCreationContext';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const steps = [
    { id: 1, title: 'Basic Info', href: '/bot/new/basic' },
    { id: 2, title: 'Customize', href: '/bot/new/customize' },
    { id: 3, title: 'Deploy', href: '/bot/new/deploy' }
];

const ProgressBar = () => {
    const pathname = usePathname();
    const currentStep = steps.find(step => pathname.startsWith(step.href));
    const currentStepId = currentStep ? currentStep.id : 0;

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center">
                {steps.map((step, idx) => (
                    <div key={step.id} className="flex-1 relative">
                        <div className={`flex flex-col items-center ${idx !== steps.length - 1 ? 'after:content-[""] after:absolute after:w-full after:h-[2px] after:bg-border after:top-5 after:left-1/2 after:-z-10' : ''}`}>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{
                                    scale: currentStepId >= step.id ? 1 : 0.8,
                                    opacity: 1
                                }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStepId > step.id
                                        ? 'bg-red text-primary border-2 border-primary'
                                        : currentStepId === step.id
                                            ? 'bg-background text-primary border-2 border-primary'
                                            : 'bg-primary border-2 border-border text-background'
                                    }`}
                            >
                                {currentStepId > step.id ? '✓' : step.id}
                            </motion.div>
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mt-2 text-center"
                            >
                                <div className={`font-medium text-primary`}>
                                    {step.title}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function NewBotLayout({ children }) {
    return (
        <BotCreationProvider>
            <main className="min-h-screen bg-background">
                <div className="mx-auto px-4 py-12 sm:px-6 lg:px-8 mt-20 md:mt-24">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl f-geist-mono">
                            Create New Chatbot
                        </h1>
                        <p className="mt-3 text-xl text-muted-foreground">
                            Follow the steps below to create and customize your AI chatbot.
                        </p>
                    </motion.div>

                    <ProgressBar />

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-border "
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </BotCreationProvider>
    );
} 