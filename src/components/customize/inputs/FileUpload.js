import { useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export function FileUpload({ label, accept, onChange, preview }) {
    const fileInputRef = useRef(null);

    const handleFile = (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('File size should be less than 2MB');
            return;
        }

        // Process the file
        onChange(file);
    };

    const handleRemove = () => {
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">{label}</label>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                >
                    Upload Image
                </button>
                {preview && (
                    <div className="relative w-10 h-10">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-contain rounded"
                        />
                        <button
                            onClick={handleRemove}
                            className="absolute -top-1 -right-1 p-0.5 bg-background border border-border rounded-full hover:bg-muted"
                        >
                            <XMarkIcon className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
            />
        </div>
    );
} 