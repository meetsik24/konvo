// Campaign cost calculation utilities

export interface CostEstimate {
    audienceSize: number;
    messageParts: number;
    totalMessages: number;
    costPerMessage: number;
    totalCost: number;
    userBalance: number;
    remainingBalance: number;
    canAfford: boolean;
}

/**
 * Calculate the number of message parts based on content length
 * Standard SMS: 160 characters per part
 * Unicode SMS (with special chars): 70 characters per part
 */
export const calculateMessageParts = (message: string): number => {
    if (!message) return 0;

    // Check if message contains unicode characters
    const hasUnicode = /[^\x00-\x7F]/.test(message);
    const charLimit = hasUnicode ? 70 : 160;

    return Math.ceil(message.length / charLimit);
};

/**
 * Calculate total campaign cost
 */
export const calculateCampaignCost = (
    audienceSize: number,
    message: string,
    costPerMessage: number = 1 // Default: 1 credit per message
): CostEstimate => {
    const messageParts = calculateMessageParts(message);
    const totalMessages = audienceSize * messageParts;
    const totalCost = totalMessages * costPerMessage;

    return {
        audienceSize,
        messageParts,
        totalMessages,
        costPerMessage,
        totalCost,
        userBalance: 0, // To be filled with actual balance
        remainingBalance: 0,
        canAfford: false,
    };
};

/**
 * Update cost estimate with user balance
 */
export const updateCostWithBalance = (
    estimate: CostEstimate,
    userBalance: number
): CostEstimate => {
    return {
        ...estimate,
        userBalance,
        remainingBalance: userBalance - estimate.totalCost,
        canAfford: userBalance >= estimate.totalCost,
    };
};

/**
 * Format cost display
 */
export const formatCost = (cost: number): string => {
    return cost.toLocaleString();
};

/**
 * Get cost breakdown text
 */
export const getCostBreakdown = (estimate: CostEstimate): string[] => {
    return [
        `Audience: ${formatCost(estimate.audienceSize)} contacts`,
        `Message parts: ${estimate.messageParts}`,
        `Total messages: ${formatCost(estimate.totalMessages)}`,
        `Cost per message: ${estimate.costPerMessage} credit${estimate.costPerMessage !== 1 ? 's' : ''}`,
        `Total cost: ${formatCost(estimate.totalCost)} credits`,
    ];
};
