// Campaign validation utilities

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface CampaignData {
    name: string;
    description?: string;
    selectedGroups: string[];
    message: string;
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    frequency?: string;
}

/**
 * Validate campaign basic information
 */
export const validateBasicInfo = (name: string, description?: string): ValidationResult => {
    const errors: string[] = [];

    if (!name || !name.trim()) {
        errors.push('Campaign name is required');
    } else if (name.trim().length < 3) {
        errors.push('Campaign name must be at least 3 characters');
    } else if (name.trim().length > 100) {
        errors.push('Campaign name must not exceed 100 characters');
    }

    if (description && description.trim().length > 500) {
        errors.push('Description must not exceed 500 characters');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Validate audience selection
 */
export const validateAudience = (selectedGroups: string[]): ValidationResult => {
    const errors: string[] = [];

    if (!selectedGroups || selectedGroups.length === 0) {
        errors.push('At least one group must be selected');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Validate message content
 */
export const validateContent = (message: string): ValidationResult => {
    const errors: string[] = [];

    if (!message || !message.trim()) {
        errors.push('Message content is required');
    } else if (message.trim().length < 10) {
        errors.push('Message must be at least 10 characters');
    } else if (message.trim().length > 1600) {
        errors.push('Message is too long (max 1600 characters, ~10 SMS parts)');
    }

    // Check for spam-like content (basic checks)
    const spamKeywords = ['click here', 'free money', 'claim now', 'winner'];
    const lowercaseMessage = message.toLowerCase();
    const foundSpam = spamKeywords.filter(keyword => lowercaseMessage.includes(keyword));

    if (foundSpam.length > 0) {
        errors.push(`Message may contain spam keywords: ${foundSpam.join(', ')}`);
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Validate schedule settings
 */
export const validateSchedule = (
    startDate?: string,
    startTime?: string,
    endDate?: string,
    endTime?: string,
    frequency?: string
): ValidationResult => {
    const errors: string[] = [];

    // If scheduling, both date and time are required
    if (startDate || startTime) {
        if (!startDate) {
            errors.push('Start date is required when scheduling');
        }
        if (!startTime) {
            errors.push('Start time is required when scheduling');
        }

        // Check if start date/time is in the past
        if (startDate && startTime) {
            const startDateTime = new Date(`${startDate}T${startTime}`);
            const now = new Date();

            if (startDateTime < now) {
                errors.push('Start date/time must be in the future');
            }
        }
    }

    // Validate end date if provided
    if (endDate && startDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            errors.push('End date must be after start date');
        }
    }

    // Validate frequency for recurring campaigns
    if (frequency && frequency !== 'once' && !endDate) {
        errors.push('End date is required for recurring campaigns');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Validate entire campaign data
 */
export const validateCampaign = (campaignData: CampaignData): ValidationResult => {
    const allErrors: string[] = [];

    // Validate basic info
    const basicResult = validateBasicInfo(campaignData.name, campaignData.description);
    allErrors.push(...basicResult.errors);

    // Validate audience
    const audienceResult = validateAudience(campaignData.selectedGroups);
    allErrors.push(...audienceResult.errors);

    // Validate content
    const contentResult = validateContent(campaignData.message);
    allErrors.push(...contentResult.errors);

    // Validate schedule if provided
    if (campaignData.startDate || campaignData.startTime) {
        const scheduleResult = validateSchedule(
            campaignData.startDate,
            campaignData.startTime,
            campaignData.endDate,
            campaignData.endTime,
            campaignData.frequency
        );
        allErrors.push(...scheduleResult.errors);
    }

    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
    };
};

/**
 * Check for sufficient balance
 */
export const validateBalance = (required: number, available: number): ValidationResult => {
    const errors: string[] = [];

    if (available < required) {
        const shortfall = required - available;
        errors.push(
            `Insufficient balance. You need ${required.toLocaleString()} credits but only have ${available.toLocaleString()}. Shortfall: ${shortfall.toLocaleString()} credits.`
        );
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};
