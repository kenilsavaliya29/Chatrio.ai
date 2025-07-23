import { useEffect } from 'react';
import '@fontsource/inter';
import '@fontsource/roboto';
import '@fontsource/open-sans';
import '@fontsource/lato';
import '@fontsource/poppins';
import '@fontsource/montserrat';

const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Montserrat', label: 'Montserrat' }
];

export function FontSelect({ value, onChange }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Font Family</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                style={{ fontFamily: value }}
            >
                {fontOptions.map(font => (
                    <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                        {font.label} - The quick brown fox jumps over the lazy dog
                    </option>
                ))}
            </select>
        </div>
    );
} 