import React from 'react';
import { motion } from 'framer-motion';
import { Users, X } from 'lucide-react';

interface Group {
    group_id: string;
    name: string;
    contact_count?: number;
}

interface StepAudienceSelectionProps {
    groups: Group[];
    selectedGroups: string[];
    onToggleGroup: (groupId: string) => void;
    onSelectAllClick: () => void;
    errors?: string[];
}

const StepAudienceSelection: React.FC<StepAudienceSelectionProps> = ({
    groups,
    selectedGroups,
    onToggleGroup,
    onSelectAllClick,
    errors = []
}) => {
    const totalContacts = groups
        .filter(g => selectedGroups.includes(g.group_id))
        .reduce((sum, g) => sum + (g.contact_count || 0), 0);

    const selectedGroupObjects = groups.filter(g => selectedGroups.includes(g.group_id));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div>
                <h3 className="text-lg font-semibold text-[#00333e] mb-2">Select Audience</h3>
                <p className="text-sm text-gray-600">
                    Choose which groups will receive this campaign.
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

            {/* Audience Summary */}
            <div className="bg-[#00333e] text-white rounded-lg p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-lg">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium opacity-90">Total Audience</p>
                        <p className="text-3xl font-bold">{totalContacts.toLocaleString()}</p>
                        <p className="text-xs opacity-75 mt-1">
                            {selectedGroups.length} group{selectedGroups.length !== 1 ? 's' : ''} selected
                        </p>
                    </div>
                </div>
            </div>

            {/* Selected Groups */}
            {selectedGroups.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Selected Groups</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedGroupObjects.map(group => (
                            <motion.div
                                key={group.group_id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 text-green-800 rounded-lg"
                            >
                                <Users className="w-4 h-4" />
                                <span className="text-sm font-medium">{group.name}</span>
                                <span className="text-xs opacity-75">({group.contact_count || 0})</span>
                                <button
                                    onClick={() => onToggleGroup(group.group_id)}
                                    className="ml-1 text-green-600 hover:text-green-800 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Available Groups */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">Available Groups</p>
                    {groups.length > 0 && (
                        <button
                            onClick={onSelectAllClick}
                            className="text-xs text-[#00333e] hover:underline font-medium"
                        >
                            {selectedGroups.length === groups.length ? 'Deselect All' : 'Select All'}
                        </button>
                    )}
                </div>

                {groups.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">No groups available.</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Create groups in the Contacts page to use them in campaigns.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {groups.map(group => {
                            const isSelected = selectedGroups.includes(group.group_id);
                            return (
                                <div
                                    key={group.group_id}
                                    onClick={() => onToggleGroup(group.group_id)}
                                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                                            ? 'border-[#00333e] bg-[#00333e]/5'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'border-[#00333e] bg-[#00333e]' : 'border-gray-300'
                                            }`}>
                                            {isSelected && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                                                    <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${isSelected ? 'text-[#00333e]' : 'text-gray-700'}`}>
                                                {group.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {group.contact_count || 0} contact{group.contact_count !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <Users className={`w-5 h-5 ${isSelected ? 'text-[#00333e]' : 'text-gray-400'}`} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StepAudienceSelection;
