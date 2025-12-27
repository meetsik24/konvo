import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, AlertTriangle, ArrowRight } from 'lucide-react';
import { CostEstimate } from '../utils/campaignCalculator';

interface StepCostEstimationProps {
    estimate: CostEstimate;
    onTopUpClick: () => void;
}

const StepCostEstimation: React.FC<StepCostEstimationProps> = ({ estimate, onTopUpClick }) => {
    const { audienceSize, messageParts, totalMessages, costPerMessage, totalCost, userBalance, remainingBalance, canAfford } = estimate;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div>
                <h3 className="text-lg font-semibold text-[#00333e] mb-2">Cost Estimation</h3>
                <p className="text-sm text-gray-600">
                    Review the estimated cost for your campaign based on audience size and message length.
                </p>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Audience Size</p>
                        <p className="text-2xl font-bold text-[#00333e]">{audienceSize.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">contacts</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Message Parts</p>
                        <p className="text-2xl font-bold text-[#00333e]">{messageParts}</p>
                        <p className="text-xs text-gray-500 mt-1">per message</p>
                    </div>
                </div>

                <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Total Messages</span>
                        <span className="text-sm font-semibold text-[#00333e]">
                            {totalMessages.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Cost per Message</span>
                        <span className="text-sm font-semibold text-[#00333e]">
                            {costPerMessage} credit{costPerMessage !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                        <span className="text-base font-semibold text-[#00333e]">Total Cost</span>
                        <span className="text-2xl font-bold text-[#00333e]">
                            {totalCost.toLocaleString()} credits
                        </span>
                    </div>
                </div>
            </div>

            {/* Balance Check */}
            <div className={`rounded-lg p-6 border-2 ${canAfford ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${canAfford ? 'bg-green-100' : 'bg-red-100'}`}>
                        {canAfford ? (
                            <Wallet className="w-6 h-6 text-green-600" />
                        ) : (
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h4 className={`text-base font-semibold mb-2 ${canAfford ? 'text-green-800' : 'text-red-800'}`}>
                            {canAfford ? 'Sufficient Balance' : 'Insufficient Balance'}
                        </h4>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${canAfford ? 'text-green-700' : 'text-red-700'}`}>
                                    Current Balance
                                </span>
                                <span className={`text-sm font-semibold ${canAfford ? 'text-green-800' : 'text-red-800'}`}>
                                    {userBalance.toLocaleString()} credits
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm ${canAfford ? 'text-green-700' : 'text-red-700'}`}>
                                    Campaign Cost
                                </span>
                                <span className={`text-sm font-semibold ${canAfford ? 'text-green-800' : 'text-red-800'}`}>
                                    -{totalCost.toLocaleString()} credits
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                                <span className={`text-sm font-semibold ${canAfford ? 'text-green-800' : 'text-red-800'}`}>
                                    Balance After Campaign
                                </span>
                                <span className={`text-base font-bold ${canAfford ? 'text-green-800' : 'text-red-800'}`}>
                                    {remainingBalance.toLocaleString()} credits
                                </span>
                            </div>
                        </div>

                        {!canAfford && (
                            <div className="mt-4 p-4 bg-red-100 rounded-lg">
                                <p className="text-sm font-medium text-red-800 mb-3">
                                    You need {(totalCost - userBalance).toLocaleString()} more credits to launch this campaign.
                                </p>
                                <button
                                    onClick={onTopUpClick}
                                    className="flex items-center gap-2 bg-[#00333e] text-white px-4 py-2 rounded-lg hover:bg-[#004d5e] transition-colors text-sm font-medium"
                                >
                                    <Wallet className="w-4 h-4" />
                                    Top Up Credits
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Information Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                    <strong>Note:</strong> The actual cost may vary slightly based on network conditions and delivery status.
                    Failed messages are not charged.
                </p>
            </div>
        </motion.div>
    );
};

export default StepCostEstimation;
