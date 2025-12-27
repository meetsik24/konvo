import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Repeat } from 'lucide-react';

interface StepScheduleProps {
    scheduleType: 'immediate' | 'scheduled';
    onScheduleTypeChange: (type: 'immediate' | 'scheduled') => void;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    frequency: string;
    onStartDateChange: (value: string) => void;
    onStartTimeChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onEndTimeChange: (value: string) => void;
    onFrequencyChange: (value: string) => void;
    errors?: string[];
}

const StepSchedule: React.FC<StepScheduleProps> = ({
    scheduleType,
    onScheduleTypeChange,
    startDate,
    startTime,
    endDate,
    endTime,
    frequency,
    onStartDateChange,
    onStartTimeChange,
    onEndDateChange,
    onEndTimeChange,
    onFrequencyChange,
    errors = []
}) => {
    const now = new Date();
    const minDate = now.toISOString().split('T')[0];
    const minTime = now.toTimeString().slice(0, 5);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div>
                <h3 className="text-lg font-semibold text-[#00333e] mb-2">Schedule Campaign</h3>
                <p className="text-sm text-gray-600">
                    Choose when to launch your campaign.
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

            {/* Schedule Type Selection */}
            <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Launch Type</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => onScheduleTypeChange('immediate')}
                        className={`p-4 border-2 rounded-lg transition-all text-left ${scheduleType === 'immediate'
                                ? 'border-[#00333e] bg-[#00333e]/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${scheduleType === 'immediate' ? 'border-[#00333e]' : 'border-gray-300'
                                }`}>
                                {scheduleType === 'immediate' && (
                                    <div className="w-3 h-3 rounded-full bg-[#00333e]" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Launch Immediately</p>
                                <p className="text-xs text-gray-500">Send messages as soon as you confirm</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => onScheduleTypeChange('scheduled')}
                        className={`p-4 border-2 rounded-lg transition-all text-left ${scheduleType === 'scheduled'
                                ? 'border-[#00333e] bg-[#00333e]/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${scheduleType === 'scheduled' ? 'border-[#00333e]' : 'border-gray-300'
                                }`}>
                                {scheduleType === 'scheduled' && (
                                    <div className="w-3 h-3 rounded-full bg-[#00333e]" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Schedule for Later</p>
                                <p className="text-xs text-gray-500">Choose a specific date and time</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Schedule Details (shown only if scheduled) */}
            {scheduleType === 'scheduled' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                >
                    {/* Start Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Start Date <span className="text-red-500">*</span>
                                </div>
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => onStartDateChange(e.target.value)}
                                min={minDate}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Start Time <span className="text-red-500">*</span>
                                </div>
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => onStartTimeChange(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Frequency */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                                <Repeat className="w-4 h-4" />
                                Frequency
                            </div>
                        </label>
                        <select
                            value={frequency}
                            onChange={(e) => onFrequencyChange(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] transition-all text-sm"
                        >
                            <option value="once">Send Once</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>

                    {/* End Date & Time (for recurring campaigns) */}
                    {frequency !== 'once' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => onEndDateChange(e.target.value)}
                                    min={startDate || minDate}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => onEndTimeChange(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] transition-all text-sm"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Schedule Preview */}
                    {startDate && startTime && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-xs font-medium text-blue-800 mb-2">📅 Schedule Summary:</p>
                            <p className="text-sm text-blue-800">
                                Campaign will {frequency === 'once' ? 'be sent' : 'start sending'} on{' '}
                                <strong>{new Date(startDate).toLocaleDateString()}</strong> at{' '}
                                <strong>{startTime}</strong>
                                {frequency !== 'once' && endDate && (
                                    <>
                                        {' '}and repeat <strong>{frequency}</strong> until{' '}
                                        <strong>{new Date(endDate).toLocaleDateString()}</strong>
                                        {endTime && ` at ${endTime}`}
                                    </>
                                )}
                            </p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Immediate Launch Info */}
            {scheduleType === 'immediate' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-xs font-medium text-green-800 mb-2">🚀 Immediate Launch:</p>
                    <p className="text-sm text-green-800">
                        Your campaign will start sending messages immediately after you confirm in the next step.
                        Messages will be sent as quickly as network conditions allow.
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default StepSchedule;
