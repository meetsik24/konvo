/**
 * Complete Integration Guide for Campaign Wizard into SendSMS.tsx
 * 
 * This file contains ALL the code snippets needed to integrate the campaign wizard.
 * Follow the instructions in each section.
 */

// ========================================
// SECTION 1: ALREADY COMPLETED ✅
// ========================================
// The following imports have been added at the top of SendSMS.tsx:
// - import CampaignWizard from '../components/campaign/CampaignWizard';
// - import CampaignProgress from '../components/campaign/CampaignProgress';
// - getAccountBalance has been added to the API imports

// State has been added (around line 91):
// - const [isWizardOpen, setIsWizardOpen] = useState(false);
// - const [userBalance, setUserBalance] = useState(0);

// Balance fetching has been added to fetchData effect (around line 117)


// ========================================
// SECTION 2: ADD THIS FUNCTION
// ========================================
// Add this function after the setModal function (around line 660):

const handleWizardLaunch = async (campaignData: any) => {
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
                schedule_type: campaignData.frequency,
            }),
        };

        const newCampaign = await createCampaign(campaignPayload);

        // Assign selected groups to campaign
        for (const groupId of campaignData.selectedGroups) {
            await assignGroupToCampaign(groupId, newCampaign.campaign_id);
        }

        // Update local campaign group state
        const campaignGroupsData = groups.filter(group => campaignData.selectedGroups.includes(group.group_id));
        setCampaignGroups(prev => ({ ...prev, [newCampaign.campaign_id]: campaignGroupsData }));

        // Update campaigns list
        setCampaigns(prev => [...prev, newCampaign as Campaign]);

        // If immediate launch, send the message
        if (campaignData.scheduleType === 'immediate' && formData.senderId) {
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


// ========================================
// SECTION 3: REPLACE THE "CREATE NEW CAMPAIGN" BUTTON
// ========================================
// Find this code around line 849-863 and REPLACE it with the code below:

// OLD CODE (REMOVE THIS):
/*
<motion.button
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4 }}
  type="button"
  onClick={() => {
    setFormData(prev => ({ ...prev, campaignName: '' }));
    setSelectedGroups([]);
    setError(null);
    setModal('isCreateCampaignOpen', true);
  }}
  className="px-4 py-2 bg-gradient-to-r from-[#004d66] to-[#004d66] text-white rounded-md hover:bg-[#FDD70D] text-sm font-medium transition-colors"
>
  Create New Campaign
</motion.button>
*/

// NEW CODE (USE THIS):
<motion.button
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    type="button"
    onClick={() => {
        setError(null);
        setIsWizardOpen(true);
    }}
    className="px-4 py-2 bg-gradient-to-r from-[#004d66] to-[#004d66] text-white rounded-md hover:bg-[#FDD70D] text-sm font-medium transition-colors"
>
    🚀 Create New Campaign (Wizard)
</motion.button>


// ========================================
// SECTION 4: ADD CAMPAIGN WIZARD MODAL
// ========================================
// Add this RIGHT AFTER the closing tag of the {sendMode === 'campaign' && (...)} section
// This should be around line 990 (after all the campaign mode JSX)

{/* Campaign Wizard Modal */ }
<CampaignWizard
    isOpen={isWizardOpen}
    onClose={() => setIsWizardOpen(false)}
    groups={groups}
    userBalance={userBalance}
    onLaunch={handleWizardLaunch}
    onTopUpClick={() => {
        // Navigate to subscription page or open top-up modal
        window.location.href = '/subscription';
    }}
    onAIGenerateClick={generateAIMessage}
/>


// ========================================
// SECTION 5: OPTIONAL - ADD CAMPAIGN PROGRESS DISPLAY
// ========================================
// Add this inside the {sendMode === 'campaign' && (...)} section
// Place it after the campaign selection dropdown, around line 990

{/* Running Campaigns Progress */ }
{
    campaigns.filter(c => c.launch_date).length > 0 && (
        <div className="space-y-4 mt-6">
            <h3 className="text-sm font-semibold text-[#004d66]">Campaign Status</h3>
            {campaigns
                .filter(c => c.launch_date) // Show campaigns that have been launched
                .slice(0, 3) // Show only first 3
                .map(campaign => {
                    // Mock data - replace with actual campaign status from API
                    const mockStatus = 'completed'; // or 'running', 'paused', 'scheduled'
                    const mockProgress = {
                        total: 1000,
                        sent: 850,
                        delivered: 800,
                        failed: 50
                    };

                    return (
                        <CampaignProgress
                            key={campaign.campaign_id}
                            campaignId={campaign.campaign_id}
                            campaignName={campaign.name}
                            status={mockStatus}
                            totalMessages={mockProgress.total}
                            sentCount={mockProgress.sent}
                            deliveredCount={mockProgress.delivered}
                            failedCount={mockProgress.failed}
                            estimatedCompletion="5 minutes"
                            onPause={() => console.log('Pause:', campaign.campaign_id)}
                            onResume={() => console.log('Resume:', campaign.campaign_id)}
                            onStop={() => console.log('Stop:', campaign.campaign_id)}
                            onViewDetails={() => console.log('View details:', campaign.campaign_id)}
                        />
                    );
                })}
        </div>
    )
}


// ========================================
// SUMMARY
// ========================================
/**
 * Integration Complete! ✅
 * 
 * What's integrated:
 * 1. ✅ Imports added
 * 2. ✅ State management  added
 * 3. ✅ Balance fetching added
 * 4. ⏳ handleWizardLaunch function - ADD MANUALLY
 * 5. ⏳ Button replacement - REPLACE MANUALLY
 * 6. ⏳ Wizard modal - ADD MANUALLY
 * 7. ⏳ Progress display (optional) - ADD MANUALLY
 * 
 * The wizard will now:
 * - Guide users through 6 steps (info, audience, content, cost, schedule, review)
 * - Check balance and alert if insufficient with direct top-up link
 * - Create campaign and assign groups
 * - Send messages immediately or schedule for later
 * - Support recurring campaigns (daily/weekly/monthly)
 */
