import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';

export interface Step {
    id: number;
    title: string;
    description: string;
}

interface WizardStepperProps {
    steps: Step[];
    currentStep: number;
    completedSteps: number[];
}

const WizardStepper: React.FC<WizardStepperProps> = ({ steps, currentStep, completedSteps }) => {
    return (
        <div className="w-full py-4">
            {/* Desktop: Horizontal Stepper */}
            <div className="hidden md:flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = completedSteps.includes(step.id);
                    const isCurrent = currentStep === step.id;
                    const isUpcoming = step.id > currentStep;

                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center flex-1">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${isCompleted
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : isCurrent
                                                ? 'bg-[#00333e] border-[#00333e] text-white'
                                                : 'bg-white border-gray-300 text-gray-400'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle className="w-6 h-6" />
                                    ) : (
                                        <span className="text-sm font-semibold">{step.id}</span>
                                    )}
                                </motion.div>
                                <div className="mt-2 text-center">
                                    <p
                                        className={`text-xs font-medium ${isCurrent ? 'text-[#00333e]' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                            }`}
                                    >
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                                </div>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="flex-1 h-0.5 mx-2 mb-8">
                                    <div
                                        className={`h-full transition-all ${completedSteps.includes(steps[index + 1].id) || currentStep > step.id
                                                ? 'bg-green-500'
                                                : 'bg-gray-300'
                                            }`}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Mobile: Vertical Stepper */}
            <div className="md:hidden space-y-4">
                {steps.map((step, index) => {
                    const isCompleted = completedSteps.includes(step.id);
                    const isCurrent = currentStep === step.id;
                    const isUpcoming = step.id > currentStep;

                    return (
                        <div key={step.id} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${isCompleted
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : isCurrent
                                                ? 'bg-[#00333e] border-[#00333e] text-white'
                                                : 'bg-white border-gray-300 text-gray-400'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        <span className="text-xs font-semibold">{step.id}</span>
                                    )}
                                </motion.div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`w-0.5 h-12 mt-2 ${completedSteps.includes(steps[index + 1].id) || currentStep > step.id
                                                ? 'bg-green-500'
                                                : 'bg-gray-300'
                                            }`}
                                    />
                                )}
                            </div>
                            <div className={`flex-1 ${index < steps.length - 1 ? 'pb-4' : ''}`}>
                                <p
                                    className={`text-sm font-medium ${isCurrent ? 'text-[#00333e]' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                        }`}
                                >
                                    {step.title}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WizardStepper;
