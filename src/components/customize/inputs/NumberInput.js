import { useState, useEffect } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export function NumberInput({ label, value, onChange, min, max, step = 1, unit = '' }) {
    // localValue should always be a number
    const [localValue, setLocalValue] = useState(() => parseFloat(value) || 0);

    useEffect(() => {
        // When the external value prop changes, update localValue, ensuring it's a number
        setLocalValue(parseFloat(value) || 0);
    }, [value]);

    const handleChange = (newValue) => {
        const parsed = parseFloat(newValue);
        // Only proceed if it's a valid number
        if (isNaN(parsed)) {
            // Optionally, set localValue to an empty string or previous valid number
            // to clear the input if invalid text is typed. For now, we'll just return.
            return;
        }
        
        const clamped = Math.min(Math.max(parsed, min), max);
        setLocalValue(clamped); // Update internal state with the number
        onChange(clamped); // Pass the number back to the parent
    };

    const increment = () => handleChange(parseFloat(localValue) + step);
    const decrement = () => handleChange(parseFloat(localValue) - step);

    return (
        <div>
            <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
            <div className="relative flex items-center">
                <input
                    type="number"
                    // Display localValue (which is always a number)
                    value={localValue}
                    onChange={(e) => handleChange(e.target.value)}
                    min={min}
                    max={max}
                    step={step}
                    className="w-full px-3 py-2 pr-16 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
                <div className="absolute right-0 h-full flex flex-col border-l border-border">
                    <button
                        onClick={increment}
                        className="flex-1 px-2 hover:bg-muted rounded-tr-md"
                        type="button"
                    >
                        <ChevronUpIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={decrement}
                        className="flex-1 px-2 hover:bg-muted rounded-br-md border-t border-border"
                        type="button"
                    >
                        <ChevronDownIcon className="w-4 h-4" />
                    </button>
                </div>
                {unit && (
                    <span className="absolute right-12 text-sm text-muted-foreground">
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
} 