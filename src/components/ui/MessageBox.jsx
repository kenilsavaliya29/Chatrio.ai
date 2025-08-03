import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export function MessageBox({ type, message, onClose, duration = 5000 }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onClose) onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [type, duration, onClose]);

    if (!isVisible || !message) return null;

    let bgColorClass = '';
    let textColorClass = '';
    let icon = null;

    switch (type) {
        case 'success':
            bgColorClass = 'bg-green-100 border-green-400';
            textColorClass = 'text-green-700';
            icon = <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            break;
        case 'error':
            bgColorClass = 'bg-red-100 border-red-400';
            textColorClass = 'text-red-700';
            icon = <XCircleIcon className="h-5 w-5 text-red-500" />;
            break;
        case 'warning':
            bgColorClass = 'bg-yellow-100 border-yellow-400';
            textColorClass = 'text-yellow-700';
            icon = <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
            break;
        case 'info':
            bgColorClass = 'bg-blue-100 border-blue-400';
            textColorClass = 'text-blue-700';
            icon = <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
            break;
        default:
            bgColorClass = 'bg-gray-100 border-gray-400';
            textColorClass = 'text-gray-700';
            icon = <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }

    return (
        <div className={`p-4 rounded-md border ${bgColorClass} flex items-center justify-between shadow-sm`}>
            <div className="flex items-center">
                {icon}
                <p className={`ml-3 text-sm font-medium ${textColorClass}`}>{message}</p>
            </div>
            <button
                onClick={() => {
                    setIsVisible(false);
                    if (onClose) onClose();
                }}
                className={`ml-4 p-1 rounded-full ${textColorClass} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-opacity-50`}
            >
                <XCircleIcon className="h-4 w-4" />
            </button>
        </div>
    );
}