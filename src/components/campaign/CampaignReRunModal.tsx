import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users } from 'lucide-react';

interface Group {
    group_id: string;
    name: string;
    contact_count?: number;
}

interface CampaignReRunModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaignName: string;
    initialGroups: Group[];
    allGroups: Group[];
    senderIds: Array<{ sender_id: string; name: string }>;
    onReRun: (data: { groups: string[]; message: string; senderId: string }) => void;
}

const CampaignReRunModal: React.FC<CampaignReRunModalProps> = ({
    isOpen,
    onClose,
    campaignName,
    initialGroups,
    allGroups,
    senderIds,
    onReRun,
}) => {
    const [selectedGroups, setSelectedGroups] = useState<string[]>(
        initialGroups.map(g => g.group_id)
    );
    const [message, setMessage] = useState('');
    const [senderId, setSenderId] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [smsCount, setSmsCount] = useState(1);

    const handleMessageChange = (text: string) => {
        setMessage(text);
        const count = text.length;
        setCharCount(count);
        setSmsCount(Math.ceil(count / 160) || 1);
    };

    const handleGroupToggle = (groupId: string) => {
        setSelectedGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const handleSubmit = () => {
        if (!senderId || !message.trim() || selectedGroups.length === 0) {
            return;
        }
        onReRun({
            groups: selectedGroups,
            message: message.trim(),
            senderId,
        });
        onClose();
    };

    const selectedGroupsData = allGroups.filter(g => selectedGroups.includes(g.group_id));
    const totalContacts = selectedGroupsData.reduce((sum, g) => sum + (g.contact_count || 0), 0);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-[#00333e]">Re-Run Campaign</h2>
                            <p className="text-xs text-gray-500 mt-0.5">{campaignName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {/* Sender ID */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Sender ID</label>
                            <select
                                value={senderId}
                                onChange={(e) => setSenderId(e.target.value)}
                                className="w-full text-sm py-2.5 px-3 border border-gray-200 rounded-md bg-white text-[#004d66] focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors"
                                required
                            >
                                <option value="">Select Sender ID</option>
                                {senderIds.map(sender => (
                                    <option key={sender.sender_id} value={sender.sender_id}>
                                        {sender.name} ({sender.sender_id})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Audience (Groups) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">
                                Audience ({selectedGroups.length} group{selectedGroups.length !== 1 ? 's' : ''}, {totalContacts.toLocaleString()} contacts)
                            </label>
                            <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                                {allGroups.map(group => (
                                    <label
                                        key={group.group_id}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedGroups.includes(group.group_id)}
                                            onChange={() => handleGroupToggle(group.group_id)}
                                            className="w-4 h-4 text-[#004d66] border-gray-300 rounded focus:ring-[#FDD70D]"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-700 truncate">{group.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {(group.contact_count || 0).toLocaleString()} contacts
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-600">Message</label>
                                <span className="text-xs text-gray-500">
                                    {charCount} chars | {smsCount} SMS
                                </span>
                            </div>
                            <textarea
                                value={message}
                                onChange={(e) => handleMessageChange(e.target.value)}
                                className="w-full text-sm p-3 border border-gray-200 rounded-md bg-white text-[#004d66] focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors resize-none"
                                rows={5}
                                placeholder="Type your message here..."
                                required
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!senderId || !message.trim() || selectedGroups.length === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#004d66] hover:bg-[#FDD70D] hover:text-[#004d66] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send Message
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CampaignReRunModal;
