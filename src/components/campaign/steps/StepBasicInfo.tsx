import React from 'react';
import { motion } from 'framer-motion';

interface StepBasicInfoProps {
    name: string;
    description: string;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    errors?: string[];
}

const StepBasicInfo: React.FC<StepBasicInfoProps> = ({
    name,
    description,
    onNameChange,
    onDescriptionChange,
    errors = []
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div>
                <h3 className="text-lg font-semibold text-[#00333e] mb-2">Campaign Information</h3>
                <p className="text-sm text-gray-600">
                    Let's start by giving your campaign a name and description.
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="e.g., Summer Sale 2024"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] transition-all text-sm"
                        maxLength={100}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {name.length}/100 characters
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description <span className="text-gray-400">(Optional)</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        placeholder="Describe the purpose of this campaign..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] transition-all text-sm resize-none"
                        maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {description.length}/500 characters
                    </p>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                    <strong>Tip:</strong> Choose a descriptive name that helps you identify this campaign later.
                    You can include the date, target audience, or campaign goal in the name.
                </p>
            </div>
        </motion.div>
    );
};

export default StepBasicInfo;
