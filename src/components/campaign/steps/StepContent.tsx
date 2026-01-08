import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Bot } from 'lucide-react';
import { calculateMessageParts } from '../utils/campaignCalculator';

interface StepContentProps {
    message: string;
    onMessageChange: (value: string) => void;
    senderId: string;
    onSenderIdChange: (value: string) => void;
    senderIds: Array<{ sender_id: string; name: string }>;
    onAIGenerateClick?: () => void;
    errors?: string[];
}

const StepContent: React.FC<StepContentProps> = ({
    message,
    onMessageChange,
    senderId,
    onSenderIdChange,
    senderIds,
    onAIGenerateClick,
    errors = []
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messageParts = calculateMessageParts(message);
    const charLimit = /[^\x00-\x7F]/.test(message) ? 70 : 160;
    const hasUnicode = /[^\x00-\x7F]/.test(message);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div>
                <h3 className="text-lg font-semibold text-[#00333e] mb-2">Campaign Content</h3>
                <p className="text-sm text-gray-600">
                    Select a sender ID and create the message that will be sent to your audience.
                </p>
            </div>

            {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="space-y-4">
                {/* Sender ID Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sender ID <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={senderId}
                        onChange={(e) => onSenderIdChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] transition-all text-sm bg-white"
                    >
                        <option value="">Select Sender ID</option>
                        {senderIds.map((sender) => (
                            <option key={sender.sender_id} value={sender.sender_id}>
                                {sender.name} ({sender.sender_id})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Message <span className="text-red-500">*</span>
                        </label>
                        {onAIGenerateClick && (
                            <button
                                onClick={onAIGenerateClick}
                                className="flex items-center gap-2 text-xs text-[#00333e] hover:text-[#004d5e] font-medium transition-colors"
                            >
                                <Bot className="w-4 h-4" />
                                Generate with AI
                            </button>
                        )}
                    </div>
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => onMessageChange(e.target.value)}
                        placeholder="Type your message here..."
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] transition-all text-sm resize-none font-mono"
                        maxLength={1600}
                    />
                </div>

                {/* Message Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium mb-1">Characters</p>
                        <p className="text-2xl font-bold text-[#00333e]">{message.length}</p>
                        <p className="text-xs text-gray-500 mt-1">of 1,600 max</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium mb-1">Message Parts</p>
                        <p className="text-2xl font-bold text-[#00333e]">{messageParts}</p>
                        <p className="text-xs text-gray-500 mt-1">{charLimit} chars/part</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium mb-1">Encoding</p>
                        <p className="text-lg font-bold text-[#00333e]">{hasUnicode ? 'Unicode' : 'Standard'}</p>
                        <p className="text-xs text-gray-500 mt-1">{hasUnicode ? '70 chars/SMS' : '160 chars/SMS'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium mb-1">Words</p>
                        <p className="text-2xl font-bold text-[#00333e]">
                            {message.trim() ? message.trim().split(/\s+/).length : 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">word count</p>
                    </div>
                </div>

                {/* Message Preview */}
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                        <div className="flex gap-3">
                            <div className="p-2 bg-[#00333e] rounded-lg h-fit">
                                <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 font-medium mb-2">SMS Preview</p>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                    {message || 'Your message will appear here...'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800 font-medium mb-2">💡 Message Tips:</p>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                    <li>Keep messages concise and clear</li>
                    <li>Avoid special characters to reduce message parts</li>
                    <li>Include a clear call-to-action</li>
                    <li>Personalize when possible using placeholders</li>
                </ul>
            </div>
        </motion.div >
    );
};

export default StepContent;
