import { useState, useEffect } from 'react';
import {
    UserIcon,
    PaintBrushIcon,
    SwatchIcon,
    DocumentTextIcon,
    ArrowsPointingOutIcon,
    Cog6ToothIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import { HexColorPicker } from 'react-colorful';
import { NumberInput } from './inputs/NumberInput';
import { FileUpload } from './inputs/FileUpload';
import { FontSelect } from './inputs/FontSelect';
import { useDebounce } from 'use-debounce';

const customizationTabs = [
    { id: 'identity', label: 'Identity', icon: UserIcon },
    { id: 'branding', label: 'Branding', icon: PaintBrushIcon },
    { id: 'colors', label: 'Colors', icon: SwatchIcon },
    { id: 'typography', label: 'Typography', icon: DocumentTextIcon },
    { id: 'sizing', label: 'Sizing', icon: ArrowsPointingOutIcon },
    { id: 'behavior', label: 'Behavior', icon: Cog6ToothIcon },
    { id: 'animation', label: 'Animation', icon: SparklesIcon }
];

const animationOptions = [
    { value: 'scale', label: 'Scale (Zoom)' },
    { value: 'slide', label: 'Slide' },
    { value: 'fade', label: 'Fade' },
    { value: 'bounce', label: 'Bounce' }
];

const TextInput = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
        <input 
            type="text" 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder} 
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background" 
        />
    </div>
);

const TextareaInput = ({ label, value, onChange, placeholder, rows = 2 }) => (
    <div>
        <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
        <textarea 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder} 
            rows={rows} 
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background" 
        />
    </div>
);

const SelectInput = ({ label, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
        <select 
            value={value} 
            onChange={onChange} 
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        >
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const SwitchInput = ({ label, checked, onChange, description }) => (
    <div className="flex items-center justify-between">
        <div>
            <span className="text-sm font-medium text-foreground">{label}</span>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-focus dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
        </label>
    </div>
);

const ColorPickerPopover = ({ color, onChange, onClose }) => (
    <div className="absolute z-50 mt-2">
        <div className="fixed inset-0" onClick={onClose} />
        <div className="relative bg-background rounded-lg shadow-xl p-4">
            <HexColorPicker color={color} onChange={onChange} />
            <input
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="mt-2 w-full px-2 py-1 text-sm border rounded"
            />
        </div>
    </div>
);

const ColorPalette = ({ colors, onChange }) => {
    const [selectedColor, setSelectedColor] = useState(null);
    const [localColors, setLocalColors] = useState(colors);
    const [debouncedColors] = useDebounce(localColors, 300);

    useEffect(() => {
        Object.entries(debouncedColors).forEach(([key, value]) => {
            if (colors[key] !== value) {
                onChange(key, value);
            }
        });
    }, [debouncedColors]);

    const handleColorChange = (hex) => {
        if (selectedColor) {
            setLocalColors(prev => ({
                ...prev,
                [selectedColor]: hex
            }));
        }
    };

    const colorGroups = [
        {
            title: 'Widget',
            colors: [
                { key: 'headerBg', label: 'Header Background' },
                { key: 'headerText', label: 'Header Text' },
                { key: 'messagesBg', label: 'Messages Background' }
            ]
        },
        {
            title: 'Messages',
            colors: [
                { key: 'userBg', label: 'User Message Background' },
                { key: 'userText', label: 'User Message Text' },
                { key: 'assistantBg', label: 'Bot Message Background' },
                { key: 'assistantText', label: 'Bot Message Text' }
            ]
        },
        {
            title: 'Actions',
            colors: [
                { key: 'sendButtonBg', label: 'Send Button Background' },
                { key: 'sendButtonText', label: 'Send Button Text' },
                { key: 'launcherBg', label: 'Launcher Background' }
            ]
        }
    ];

    return (
        <div className="space-y-4">
            {/* Color Picker */}
            <div className="border rounded-lg p-4 bg-background/50">
                <HexColorPicker
                    color={selectedColor ? localColors[selectedColor] : '#000000'}
                    onChange={handleColorChange}
                    style={{ width: '100%', height: '150px' }}
                    className={!selectedColor ? 'opacity-50' : ''}
                />
                {selectedColor && (
                    <div className="mt-2">
                        <input
                            type="text"
                            value={localColors[selectedColor]}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="#000000"
                        />
                    </div>
                )}
            </div>

            {/* Color Groups */}
            <div className="space-y-6">
                {colorGroups.map(group => (
                    <div key={group.title} className="space-y-2">
                        <h3 className="text-sm font-medium text-foreground">{group.title}</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {group.colors.map(({ key, label }) => (
                                <button
                                    key={key}
                                    className={`flex items-center gap-2 p-2 rounded border transition-colors ${
                                        selectedColor === key
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                    onClick={() => setSelectedColor(key)}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full border shadow-sm"
                                        style={{ backgroundColor: localColors[key] }}
                                    />
                                    <span className="text-xs truncate">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function CustomizePanel({ botData, handleInputChange, onBack, onDeploy, isProcessing }) {
    const [activeTab, setActiveTab] = useState('identity');
    const [showTypingPreview, setShowTypingPreview] = useState(false);

    const handleFileUpload = async (type, file) => {
        // TODO: Implement file upload logic
        console.log('File upload:', type, file);
    };

    return (
        <div className="w-[25%] h-full flex flex-col bg-background border-l border-border/40">
            {/* Header */}
            <div className="p-4 border-b border-border/40">
                <h1 className="text-lg font-semibold bg-text-gradient">Customize Chatbot</h1>
                <p className="text-sm text-muted-foreground">Customize the appearance and behavior</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border/40 bg-background/50">
                <div className="flex overflow-x-auto hide-scrollbar flex-wrap">
                    {customizationTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`p-3 flex items-center gap-2 text-sm font-medium shrink-0 border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                            }`}
                        >
                            {tab.icon && <tab.icon className="w-4 h-4" />}
                            <span className="whitespace-nowrap">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                    {activeTab === 'identity' && (
                        <div className="space-y-4">
                            <TextInput
                                label="Bot Name"
                                value={botData.botName}
                                onChange={(e) => handleInputChange('botName', null, e.target.value)}
                                placeholder="Chatrio AI"
                            />
                            <TextareaInput
                                label="Greeting Message"
                                value={botData.greetingMessage}
                                onChange={(e) => handleInputChange('greetingMessage', null, e.target.value)}
                                placeholder="Hi there! How can I help?"
                            />
                            <SelectInput
                                label="Tone/Persona"
                                value={botData.tone}
                                onChange={(e) => handleInputChange('tone', null, e.target.value)}
                                options={[
                                    { value: 'helpful', label: 'Helpful & Supportive' },
                                    { value: 'friendly', label: 'Friendly & Casual' },
                                    { value: 'professional', label: 'Professional & Formal' }
                                ]}
                            />
                        </div>
                    )}

                    {activeTab === 'branding' && (
                        <div className="space-y-4 flex gap-3 flex-wrap">
                            <FileUpload
                                label="Company Logo"
                                accept="image/*"
                                onChange={(file) => handleFileUpload('logo', file)}
                                preview={botData.logoUrl}
                            />
                            <FileUpload
                                label="Launcher Icon"
                                accept="image/*"
                                onChange={(file) => handleFileUpload('launcher', file)}
                                preview={botData.launcherIconUrl}
                            />
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Send Button</label>
                                <div className="flex gap-4">
                                    <button
                                        className={`px-3 py-1 rounded ${
                                            !botData.sendButtonIsImage
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                        }`}
                                        onClick={() => handleInputChange('sendButtonIsImage', null, false)}
                                    >
                                        Text
                                    </button>
                                    <button
                                        className={`px-3 py-1 rounded ${
                                            botData.sendButtonIsImage
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                        }`}
                                        onClick={() => handleInputChange('sendButtonIsImage', null, true)}
                                    >
                                        Image
                                    </button>
                                </div>
                                {botData.sendButtonIsImage ? (
                                    <FileUpload
                                        accept="image/*"
                                        onChange={(file) => handleFileUpload('sendButton', file)}
                                        preview={botData.sendButtonIcon}
                                    />
                                ) : (
                                    <TextInput
                                        value={botData.sendButtonIcon}
                                        onChange={(e) => handleInputChange('sendButtonIcon', null, e.target.value)}
                                        placeholder="Send"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'colors' && (
                        <ColorPalette
                            colors={{
                                headerBg: botData.headerBg,
                                headerText: botData.headerText,
                                backgroundColor: botData.backgroundColor,
                                textColor: botData.textColor,
                                borderColor: botData.borderColor,
                                messagesBg: botData.messagesBg,
                                inputBg: botData.inputBg,
                                userBg: botData.userBg,
                                userText: botData.userText,
                                assistantBg: botData.assistantBg,
                                assistantText: botData.assistantText,
                                sendButtonBg: botData.sendButtonBg,
                                sendButtonText: botData.sendButtonText,
                                launcherBg: botData.launcherBg,
                                launcherText: botData.launcherText,
                            }}
                            onChange={(key, value) => handleInputChange(key, null, value)}
                        />
                    )}

                    {activeTab === 'typography' && (
                        <div className="space-y-4">
                            <FontSelect
                                value={botData.fontFamily}
                                onChange={(font) => handleInputChange('fontFamily', null, font)}
                            />
                        </div>
                    )}

                    {activeTab === 'sizing' && (
                        <div className="space-y-4">
                            <NumberInput
                                label="Widget Width"
                                value={botData.widgetWidth}
                                onChange={(value) => handleInputChange('widgetWidth', null, value)}
                                min={200}
                                max={500}
                                step={10}
                                unit="px"
                            />
                            <NumberInput
                                label="Widget Height"
                                value={botData.widgetHeight}
                                onChange={(value) => handleInputChange('widgetHeight', null, value)}
                                min={300}
                                max={800}
                                step={10}
                                unit="px"
                            />
                            <NumberInput
                                label="Border Radius"
                                value={botData.borderRadius}
                                onChange={(value) => handleInputChange('borderRadius', null, value)}
                                min={0}
                                max={24}
                                step={1}
                                unit="px"
                            />
                            <NumberInput
                                label="Message Border Radius"
                                value={botData.messageBorderRadius}
                                onChange={(value) => handleInputChange('messageBorderRadius', null, value)}
                                min={0}
                                max={20}
                                step={1}
                                unit="px"
                            />
                            <NumberInput
                                label="Launcher Size"
                                value={botData.launcherSize}
                                onChange={(value) => handleInputChange('launcherSize', null, value)}
                                min={40}
                                max={80}
                                step={4}
                                unit="px"
                            />
                        </div>
                    )}

                    {activeTab === 'behavior' && (
                        <div className="space-y-4">
                            <SwitchInput
                                label="Auto-open on page load"
                                checked={botData.autoOpen}
                                onChange={(e) => handleInputChange('autoOpen', null, e.target.checked)}
                            />
                            <NumberInput
                                label="Auto-open delay"
                                value={botData.autoOpenDelay}
                                onChange={(value) => handleInputChange('autoOpenDelay', null, value)}
                                min={0}
                                max={10000}
                                step={500}
                                unit="ms"
                            />
                            <SwitchInput
                                label="Show typing indicator"
                                checked={botData.showTypingIndicator}
                                onChange={(e) => {
                                    handleInputChange('showTypingIndicator', null, e.target.checked);
                                    setShowTypingPreview(e.target.checked);
                                }}
                            />
                        </div>
                    )}

                    {activeTab === 'animation' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-foreground">Animation Type</label>
                                <select
                                    value={botData.animationType}
                                    onChange={(e) => {
                                        handleInputChange('animationType', null, e.target.value);
                                        // Trigger animation in preview
                                        const event = new CustomEvent('triggerChatbotAnimation', {
                                            detail: { type: e.target.value }
                                        });
                                        window.dispatchEvent(event);
                                    }}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                >
                                    {animationOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    The animation will be demonstrated in the chatbot preview
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-border/40 bg-background">
                <div className="flex gap-2">
                    <button
                        onClick={onBack}
                        className="flex-1 py-2 px-3 border border-border/40 rounded-md text-sm font-medium hover:bg-background/50 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={onDeploy}
                        disabled={isProcessing}
                        className="flex-1 py-2 px-3 bg-primary text-background hover:text-white rounded-md disabled:opacity-50 text-sm font-medium btn-primary-gradient-hover"
                    >
                        {isProcessing ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
} 