import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Users, MessageSquare, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { CostEstimate } from '../utils/campaignCalculator';

interface Group {
    group_id: string;
    name: string;
    contact_count?: number;
}

interface StepReviewProps {
    campaignName: string;
    campaignDescription: string;
    selectedGroups: Group[];
    message: string;
    scheduleType: 'immediate' | 'scheduled';
    startDate?: string;
    startTime?: string;
    frequency?: string;
    endDate?: string;
    costEstimate: CostEstimate;
    onRunInspection?: () => Promise<void>;
    inspectionStatus?: 'idle' | 'running' | 'success' | 'failed';
}

const StepReview: React.FC<StepReviewProps> = ({
    campaignName,
    campaignDescription,
    selectedGroups,
    message,
    scheduleType,
    startDate,
    startTime,
    frequency,
    endDate,
    costEstimate,
    onRunInspection,
    inspectionStatus = 'idle',
}) => {
    const totalContacts = selectedGroups.reduce((sum, g) => sum + (g.contact_count || 0), 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div>
                <h3 className="text-lg font-semibold text-[#00333e] mb-2">Review & Confirm</h3>
                <p className="text-sm text-gray-600">
                    Review all campaign details before launching.
                </p>
            </div>

            {/* Pre-flight Checklist */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <p className="text-sm font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Pre-Flight Checklist
                </p>
                <div className="space-y-2">
                    {[
                        'Campaign name and description set',
                        `${selectedGroups.length} audience group${selectedGroups.length !== 1 ? 's' : ''} selected`,
                        'Message content created and validated',
                        costEstimate.canAfford ? 'Sufficient balance available' : 'Balance check failed',
                        'Schedule configured',
                    ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <CheckCircle className={`w-4 h-4 ${item.includes('failed') ? 'text-red-600' : 'text-green-600'}`} />
                            <span className={`text-sm ${item.includes('failed') ? 'text-red-700' : 'text-green-700'}`}>{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Inspection Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm font-semibold text-[#00333e] flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-[#00333e]" />
                        Pre-Launch Inspection
                    </p>
                    {onRunInspection && (
                        <button
                            onClick={onRunInspection}
                            disabled={inspectionStatus === 'running' || inspectionStatus === 'success'}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${inspectionStatus === 'success'
                                ? 'bg-green-100 text-green-700 cursor-default'
                                : 'bg-[#00333e] text-white hover:bg-[#004d66]'
                                }`}
                        >
                            {inspectionStatus === 'running' ? 'Checking...' : inspectionStatus === 'success' ? 'Passed' : 'Run Inspection'}
                        </button>
                    )}
                </div>
                {inspectionStatus !== 'idle' && (
                    <div className={`text-sm p-3 rounded-md ${inspectionStatus === 'success' ? 'bg-green-100 text-green-800' :
                        inspectionStatus === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-blue-50 text-blue-800'
                        }`}>
                        {inspectionStatus === 'running' && 'Running system checks...'}
                        {inspectionStatus === 'success' && '✓ All systems ready for launch.'}
                        {inspectionStatus === 'failed' && '⚠ Issues detected. Please review basic info and cost.'}
                    </div>
                )}
            </div>

            {/* Campaign Summary */}
            <div className="space-y-4">
                {/* Basic Info */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#00333e] rounded-lg">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium mb-1">Campaign Information</p>
                            <p className="text-base font-semibold text-[#00333e]">{campaignName}</p>
                            {campaignDescription && (
                                <p className="text-sm text-gray-600 mt-1">{campaignDescription}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Audience */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#00333e] rounded-lg">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium mb-1">Audience</p>
                            <p className="text-base font-semibold text-[#00333e]">
                                {totalContacts.toLocaleString()} contacts
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedGroups.map(group => (
                                    <span
                                        key={group.group_id}
                                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                                    >
                                        {group.name} ({group.contact_count || 0})
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#00333e] rounded-lg">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium mb-1">Message Preview</p>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded border border-gray-200">
                                {message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                {message.length} characters • {costEstimate.messageParts} part{costEstimate.messageParts !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Schedule */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#00333e] rounded-lg">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium mb-1">Schedule</p>
                            {scheduleType === 'immediate' ? (
                                <p className="text-sm text-gray-800">
                                    <strong>Launch Immediately</strong> - Campaign will start as soon as you confirm
                                </p>
                            ) : (
                                <div className="text-sm text-gray-800 space-y-1">
                                    <p>
                                        <strong>Scheduled Launch:</strong> {startDate && new Date(startDate).toLocaleDateString()} at {startTime}
                                    </p>
                                    {frequency && frequency !== 'once' && (
                                        <p>
                                            <strong>Frequency:</strong> {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                                            {endDate && ` until ${new Date(endDate).toLocaleDateString()}`}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cost */}
                <div className={`border-2 rounded-lg p-4 ${costEstimate.canAfford ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${costEstimate.canAfford ? 'bg-green-100' : 'bg-red-100'}`}>
                            <DollarSign className={`w-5 h-5 ${costEstimate.canAfford ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium mb-1">Cost Summary</p>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className={costEstimate.canAfford ? 'text-green-800' : 'text-red-800'}>Total Cost:</span>
                                    <span className={`font-bold ${costEstimate.canAfford ? 'text-green-800' : 'text-red-800'}`}>
                                        {costEstimate.totalCost.toLocaleString()} credits
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={costEstimate.canAfford ? 'text-green-700' : 'text-red-700'}>Your Balance:</span>
                                    <span className={`font-semibold ${costEstimate.canAfford ? 'text-green-700' : 'text-red-700'}`}>
                                        {costEstimate.userBalance.toLocaleString()} credits
                                    </span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-gray-300">
                                    <span className={`font-semibold ${costEstimate.canAfford ? 'text-green-800' : 'text-red-800'}`}>
                                        After Campaign:
                                    </span>
                                    <span className={`font-bold ${costEstimate.canAfford ? 'text-green-800' : 'text-red-800'}`}>
                                        {costEstimate.remainingBalance.toLocaleString()} credits
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning if insufficient balance */}
            {!costEstimate.canAfford && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-red-800 mb-1">Cannot Launch Campaign</p>
                            <p className="text-sm text-red-700">
                                You need {(costEstimate.totalCost - costEstimate.userBalance).toLocaleString()} more credits to launch this campaign.
                                Please go back to the cost estimation step to add credits to your account.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Final Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Once you click "Launch Campaign", the campaign will be created and messages will be queued for sending.
                    {scheduleType === 'immediate' ? ' Messages will start sending immediately.' : ' Messages will be sent according to your schedule.'}
                </p>
            </div>
        </motion.div>
    );
};

export default StepReview;
