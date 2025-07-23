import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const animationVariants = {
    scale: {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0, opacity: 0 }
    },
    slide: {
        initial: { x: 100, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -100, opacity: 0 }
    },
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    },
    bounce: {
        initial: { y: 50, opacity: 0 },
        animate: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.5 } },
        exit: { y: 50, opacity: 0 }
    }
};

export function AnimationPreview({ options, selectedAnimation, onSelect }) {
    const [isVisible, setIsVisible] = useState(true);

    const toggleAnimation = (type) => {
        setIsVisible(false);
        setTimeout(() => {
            onSelect(type);
            setIsVisible(true);
        }, 300);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => toggleAnimation(option.value)}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                            selectedAnimation === option.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <div className="h-32 border rounded-lg relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {isVisible && (
                        <motion.div
                            key={selectedAnimation}
                            className="absolute inset-0 flex items-center justify-center bg-primary/5"
                            variants={animationVariants[selectedAnimation]}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                        >
                            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                                Preview
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
} 