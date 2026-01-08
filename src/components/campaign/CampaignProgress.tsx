import React from 'react';
import { motion } from 'framer-motion';
import {
    Play,
    Pause,
    Square,
    CheckCircle,
    XCircle,
    Clock,
    Send,
    TrendingUp,
    AlertTriangle
} from 'lucide-react';

interface CampaignProgressProps {
    campaignId: string;
    campaignName: string;
    status: 'scheduled' | 'running' | 'paused' | 'completed' | 'failed';
    totalMessages: number;
    sentCount: number;
    deliveredCount: number;
    readCount?: number;
    failedCount: number;
    estimatedCompletion?: string;
    onPause?: () => void;
    onResume?: () => void;
    onStop?: () => void;
    onViewDetails?: () => void;
}

const CampaignProgress: React.FC<CampaignProgressProps> = ({
    campaignId,
    campaignName,
    status,
    totalMessages,
    sentCount,
    deliveredCount,
    readCount = 0,
    failedCount,
    estimatedCompletion,
    onPause,
    onResume,
    onStop,
    onViewDetails,
}) => {
    const progressPercentage = totalMessages > 0 ? (sentCount / totalMessages) * 100 : 0;
    const deliveryRate = sentCount > 0 ? (deliveredCount / sentCount) * 100 : 0;

    const getStatusColor = () => {
        switch (status) {
            case 'running':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'scheduled':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'running':
                return <Play className="w-4 h-4" />;
            case 'paused':
                return <Pause className="w-4 h-4" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'failed':
                return <XCircle className="w-4 h-4" />;
            case 'scheduled':
                return <Clock className="w-4 h-4" />;
            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-6 space-y-4"
        >
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h4 className="text-base font-semibold text-[#00333e]">{campaignName}</h4>
                    <p className="text-xs text-gray-500 mt-1">ID: {campaignId}</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor()}`}>
                    {getStatusIcon()}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
            </div>

            {/* Progress Bar */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        Progress: {sentCount.toLocaleString()} / {totalMessages.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold text-[#00333e]">
                        {progressPercentage.toFixed(1)}%
                    </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${status === 'completed'
                                ? 'bg-green-500'
                                : status === 'failed'
                                    ? 'bg-red-500'
                                    : status === 'paused'
                                        ? 'bg-yellow-500'
                                        : 'bg-blue-500'
                            }`}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                        <Send className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-blue-600 font-medium">Sent</span>
                    </div>
                    <p className="text-lg font-bold text-blue-800">{sentCount.toLocaleString()}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Delivered</span>
                    </div>
                    <p className="text-lg font-bold text-green-800">{deliveredCount.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-0.5">{deliveryRate.toFixed(1)}%</p>
                </div>

                {readCount > 0 && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-purple-600" />
                            <span className="text-xs text-purple-600 font-medium">Read</span>
                        </div>
                        <p className="text-lg font-bold text-purple-800">{readCount.toLocaleString()}</p>
                        <p className="text-xs text-purple-600 mt-0.5">
                            {sentCount > 0 ? ((readCount / sentCount) * 100).toFixed(1) : 0}%
                        </p>
                    </div>
                )}

                <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <div className="flex items-center gap-2 mb-1">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-xs text-red-600 font-medium">Failed</span>
                    </div>
                    <p className="text-lg font-bold text-red-800">{failedCount.toLocaleString()}</p>
                </div>
            </div>

            {/* Est imated Completion */}
            {estimatedCompletion && status === 'running' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Estimated completion: <strong>{estimatedCompletion}</strong></span>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                {status === 'running' && onPause && (
                    <button
                        onClick={onPause}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                    >
                        <Pause className="w-4 h-4" />
                        Pause
                    </button>
                )}
                {status === 'paused' && onResume && (
                    <button
                        onClick={onResume}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                    >
                        <Play className="w-4 h-4" />
                        Resume
                    </button>
                )}
                {(status === 'running' || status === 'paused') && onStop && (
                    <button
                        onClick={onStop}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <Square className="w-4 h-4" />
                        Stop
                    </button>
                )}
                {onViewDetails && (
                    <button
                        onClick={onViewDetails}
                        className="ml-auto flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#00333e] bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        View Details
                    </button>
                )}
            </div>

            {/* Warning for high failure rate */}
            {sentCount > 100 && failedCount / sentCount > 0.1 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-medium text-orange-800">High Failure Rate Detected</p>
                            <p className="text-xs text-orange-700 mt-1">
                                {((failedCount / sentCount) * 100).toFixed(1)}% of messages have failed.
                                Consider reviewing your message content or contact list.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default CampaignProgress;
