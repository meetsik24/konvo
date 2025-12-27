import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Rocket } from 'lucide-react';
import WizardStepper, { Step } from './WizardStepper';
import StepBasicInfo from './steps/StepBasicInfo';
import StepAudienceSelection from './steps/StepAudienceSelection';
import StepContent from './steps/StepContent';
import StepCostEstimation from './steps/StepCostEstimation';
import StepSchedule from './steps/StepSchedule';
import StepReview from './steps/StepReview';
import {
    calculateCampaignCost,
    updateCostWithBalance,
    CostEstimate,
} from './utils/campaignCalculator';
import {
    validateBasicInfo,
    validateAudience,
    validateContent,
    validateSchedule,
    ValidationResult,
} from './utils/campaignValidator';
import { preLaunchInspection } from '../../services/api';

interface Group {
    group_id: string;
    name: string;
    contact_count?: number;
}

interface InitialCampaignData {
    name?: string;
    description?: string;
    selectedGroups?: string[];
    message?: string;
    scheduleType?: 'immediate' | 'scheduled';
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    frequency?: string;
    senderId?: string;
}

interface CampaignWizardProps {
    isOpen: boolean;
    onClose: () => void;
    groups: Group[];
    senderIds: Array<{ sender_id: string; name: string }>;
    userBalance: number;
    onLaunch: (campaignData: any) => void;
    onTopUpClick: () => void;
    onAIGenerateClick?: () => void;
    initialCampaignData?: InitialCampaignData;
}

const STEPS: Step[] = [
    { id: 1, title: 'Basic Info', description: 'Campaign details' },
    { id: 2, title: 'Audience', description: 'Select groups' },
    { id: 3, title: 'Content', description: 'Create message' },
    { id: 4, title: 'Cost', description: 'Estimate cost' },
    { id: 5, title: 'Schedule', description: 'Set timing' },
    { id: 6, title: 'Review', description: 'Confirm & launch' },
];

const CampaignWizard: React.FC<CampaignWizardProps> = ({
    isOpen,
    onClose,
    groups,
    senderIds,
    userBalance,
    onLaunch,
    onTopUpClick,
    onAIGenerateClick,
    initialCampaignData,
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    // Campaign data
    const [campaignName, setCampaignName] = useState(initialCampaignData?.name || '');
    const [campaignDescription, setCampaignDescription] = useState(initialCampaignData?.description || '');
    const [selectedGroups, setSelectedGroups] = useState<string[]>(initialCampaignData?.selectedGroups || []);
    const [senderId, setSenderId] = useState(initialCampaignData?.senderId || '');
    const [message, setMessage] = useState(initialCampaignData?.message || '');
    const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>(initialCampaignData?.scheduleType || 'immediate');
    const [startDate, setStartDate] = useState(initialCampaignData?.startDate || '');
    const [startTime, setStartTime] = useState(initialCampaignData?.startTime || '');
    const [endDate, setEndDate] = useState(initialCampaignData?.endDate || '');
    const [endTime, setEndTime] = useState(initialCampaignData?.endTime || '');
    const [frequency, setFrequency] = useState(initialCampaignData?.frequency || 'once');

    // Validation
    const [errors, setErrors] = useState<string[]>([]);
    const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
    const [inspectionStatus, setInspectionStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');

    // Calculate cost estimate whenever relevant data changes
    useEffect(() => {
        if (selectedGroups.length > 0 && message) {
            const audienceSize = groups
                .filter(g => selectedGroups.includes(g.group_id))
                .reduce((sum, g) => sum + (g.contact_count || 0), 0);

            const estimate = calculateCampaignCost(audienceSize, message, 1);
            const estimateWithBalance = updateCostWithBalance(estimate, userBalance);
            setCostEstimate(estimateWithBalance);
        }
    }, [selectedGroups, message, groups, userBalance]);

    const handleToggleGroup = (groupId: string) => {
        setSelectedGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const handleSelectAll = () => {
        if (selectedGroups.length === groups.length) {
            setSelectedGroups([]);
        } else {
            setSelectedGroups(groups.map(g => g.group_id));
        }
    };

    const validateCurrentStep = (): boolean => {
        let validation: ValidationResult = { isValid: true, errors: [] };

        switch (currentStep) {
            case 1:
                validation = validateBasicInfo(campaignName, campaignDescription);
                break;
            case 2:
                validation = validateAudience(selectedGroups);
                break;
            case 3:
                validation = validateContent(message);
                if (!senderId) {
                    validation.isValid = false;
                    validation.errors.push('Please select a Sender ID');
                }
                break;
            case 4:
                // Cost validation is visual only, always allow proceeding
                validation = { isValid: true, errors: [] };
                break;
            case 5:
                if (scheduleType === 'scheduled') {
                    validation = validateSchedule(startDate, startTime, endDate, endTime, frequency);
                }
                break;
            case 6:
                // Final validation before launch
                if (costEstimate && !costEstimate.canAfford) {
                    validation = {
                        isValid: false,
                        errors: ['Insufficient balance to launch campaign'],
                    };
                }
                if (inspectionStatus !== 'success') {
                    validation = {
                        isValid: false,
                        errors: ['Please run and pass the pre-launch inspection first'],
                    };
                }
                break;
        }

        setErrors(validation.errors);
        return validation.isValid;
    };

    const handleNext = () => {
        if (validateCurrentStep()) {
            if (!completedSteps.includes(currentStep)) {
                setCompletedSteps([...completedSteps, currentStep]);
            }
            setCurrentStep(currentStep + 1);
            setErrors([]);
        }
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
        setErrors([]);
    };

    const handleLaunch = () => {
        if (!validateCurrentStep()) {
            return;
        }

        const campaignData = {
            name: campaignName,
            description: campaignDescription,
            selectedGroups,
            message,
            senderId,
            scheduleType,
            ...(scheduleType === 'scheduled' && {
                startDate,
                startTime,
                endDate,
                endTime,
                frequency,
            }),
        };

        onLaunch(campaignData);
        handleClose();
    };

    const handleClose = () => {
        // Reset all state
        setCurrentStep(1);
        setCompletedSteps([]);
        setCampaignName('');
        setCampaignDescription('');
        setSelectedGroups([]);
        setMessage('');
        setScheduleType('immediate');
        setStartDate('');
        setStartTime('');
        setEndDate('');
        setEndTime('');
        setFrequency('once');
        setSenderId('');
        setErrors([]);
        setCostEstimate(null);
        onClose();
    };

    const handleRunInspection = async () => {
        if (!costEstimate) return;

        setInspectionStatus('running');
        try {
            // Calculate total contacts
            const totalContacts = groups
                .filter(g => selectedGroups.includes(g.group_id))
                .reduce((sum, g) => sum + (g.contact_count || 0), 0);

            await preLaunchInspection({
                campaign_name: campaignName,
                total_contacts: totalContacts,
                message_length: message.length,
                total_cost: costEstimate.totalCost
            });
            setInspectionStatus('success');
        } catch (error) {
            console.error('Inspection failed:', error);
            setInspectionStatus('failed');
        }
    };

    if (!isOpen) return null;

    const selectedGroupObjects = groups.filter(g => selectedGroups.includes(g.group_id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full max-w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="bg-[#00333e] text-white p-4 sm:p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg sm:text-2xl font-bold">
                            {initialCampaignData ? `Re-Run: ${initialCampaignData.name}` : 'Create New Campaign'}
                        </h2>
                        <p className="text-xs sm:text-sm opacity-90 mt-1">Follow the steps to set up your campaign</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Stepper */}
                <div className="px-3 sm:px-6 border-b border-gray-200">
                    <WizardStepper steps={STEPS} currentStep={currentStep} completedSteps={completedSteps} />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <StepBasicInfo
                                name={campaignName}
                                description={campaignDescription}
                                onNameChange={setCampaignName}
                                onDescriptionChange={setCampaignDescription}
                                errors={errors}
                            />
                        )}
                        {currentStep === 2 && (
                            <StepAudienceSelection
                                groups={groups}
                                selectedGroups={selectedGroups}
                                onToggleGroup={handleToggleGroup}
                                onSelectAllClick={handleSelectAll}
                                errors={errors}
                            />
                        )}
                        {currentStep === 3 && (
                            <StepContent
                                message={message}
                                onMessageChange={setMessage}
                                senderId={senderId}
                                onSenderIdChange={setSenderId}
                                senderIds={senderIds}
                                onAIGenerateClick={onAIGenerateClick}
                                errors={errors}
                            />
                        )}
                        {currentStep === 4 && costEstimate && (
                            <StepCostEstimation
                                estimate={costEstimate}
                                onTopUpClick={onTopUpClick}
                            />
                        )}
                        {currentStep === 5 && (
                            <StepSchedule
                                scheduleType={scheduleType}
                                onScheduleTypeChange={setScheduleType}
                                startDate={startDate}
                                startTime={startTime}
                                endDate={endDate}
                                endTime={endTime}
                                frequency={frequency}
                                onStartDateChange={setStartDate}
                                onStartTimeChange={setStartTime}
                                onEndDateChange={setEndDate}
                                onEndTimeChange={setEndTime}
                                onFrequencyChange={setFrequency}
                                errors={errors}
                            />
                        )}
                        {currentStep === 6 && costEstimate && (
                            <StepReview
                                campaignName={campaignName}
                                campaignDescription={campaignDescription}
                                selectedGroups={selectedGroupObjects}
                                message={message}
                                scheduleType={scheduleType}
                                startDate={startDate}
                                startTime={startTime}
                                frequency={frequency}
                                endDate={endDate}
                                costEstimate={costEstimate}
                                onRunInspection={handleRunInspection}
                                inspectionStatus={inspectionStatus}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer with Navigation */}
                <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-gray-700 hover:text-[#00333e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors order-2 sm:order-1"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm sm:text-base">Back</span>
                        </button>

                        <div className="flex items-center gap-3 order-1 sm:order-2">
                            <button
                                onClick={handleClose}
                                className="flex-1 sm:flex-initial px-4 py-3 sm:py-2 text-sm sm:text-base text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            {currentStep < 6 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 sm:py-2 text-sm sm:text-base bg-[#00333e] text-white rounded-lg hover:bg-[#004d5e] transition-colors min-h-[44px]"
                                >
                                    Next
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleLaunch}
                                    disabled={(costEstimate ? !costEstimate.canAfford : true) || inspectionStatus !== 'success'}
                                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 sm:py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                                >
                                    <Rocket className="w-5 h-5" />
                                    Launch Campaign
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CampaignWizard;
