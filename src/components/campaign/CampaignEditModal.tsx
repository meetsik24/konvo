import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';

interface CampaignEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: {
        campaign_id: string;
        name: string;
        description?: string;
    } | null;
    onUpdate: (campaignId: string, data: { name: string; description: string }) => Promise<void>;
}

const CampaignEditModal: React.FC<CampaignEditModalProps> = ({
    isOpen,
    onClose,
    campaign,
    onUpdate,
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (campaign) {
            setName(campaign.name);
            setDescription(campaign.description || '');
        }
    }, [campaign]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!campaign) return;

        setIsSubmitting(true);
        try {
            await onUpdate(campaign.campaign_id, { name, description });
            onClose();
        } catch (error) {
            console.error('Failed to update campaign:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !campaign) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-[#00333e] text-white">
                        <h2 className="text-lg font-semibold">Edit Campaign</h2>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Campaign Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004d66] focus:border-transparent text-gray-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004d66] focus:border-transparent resize-none text-gray-900"
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#004d66] hover:bg-[#003d52] rounded-md transition-colors disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CampaignEditModal;
