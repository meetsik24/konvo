// Campaign Wizard Launch Handler for SendSMS.tsx
// Add this function after the setModal function (around line 660)

const handleWizardLaunch = async (campaignData: any) =\u003e {
    try {
        if (!currentWorkspaceId) {
    setError('No workspace selected.');
    return;
}

// Create the campaign
const campaignPayload = {
    name: campaignData.name,
    description: campaignData.description,
    workspace_id: currentWorkspaceId,
    launch_date: campaignData.scheduleType === 'immediate'
        ? new Date().toISOString()
        : `${campaignData.startDate}T${campaignData.startTime}`,
    ...(campaignData.scheduleType === 'scheduled' && {
        start_date: campaignData.startDate,
        start_time: campaignData.startTime,
        end_date: campaignData.endDate,
        end_time: campaignData.endTime,
        frequency: campaignData.frequency,
    }),
};

const newCampaign = await createCampaign(campaignPayload);

// Assign selected groups to campaign
for (const groupId of campaignData.selectedGroups) {
    await assignGroupToCampaign(groupId, newCampaign.campaign_id);
}

// Update campaigns list
setCampaigns(prev =\u003e[...prev, newCampaign as Campaign]);

// If immediate launch, send the message
if (campaignData.scheduleType === 'immediate' \u0026\u0026 formData.senderId) {
    await sendInstantMessage(currentWorkspaceId, {
        sender_id: formData.senderId,
        content: campaignData.message,
        recipients: [],
        groups: campaignData.selectedGroups,
        campaign_id: newCampaign.campaign_id,
    });
}

// Refresh balance after campaign creation
try {
    const balanceData = await getAccountBalance();
    setUserBalance(balanceData.balance || 0);
} catch (balErr) {
    console.warn('Failed to refresh balance:', balErr);
}

setError(null);
  } catch (err: unknown) {
    console.error('Error launching campaign from wizard:', err);
    let errorMessage = 'Failed to launch campaign.';
    if (err instanceof Error) {
        errorMessage = err.message;
    }
    setError(errorMessage);
}
};
