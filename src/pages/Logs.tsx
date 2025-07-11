import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { fetchLogs } from '../services/api';

interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  recipients: number;
  delivered: number;
  failed: number;
  createDate: string;
  deliveredDate: string;
  contactGroup: string;
}

interface NonCampaign {
  id: string;
  message: string;
  sentDate: string;
  recipients: number;
  delivered: number;
  failed: number;
}

const Logs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'nonCampaigns'>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [nonCampaigns, setNonCampaigns] = useState<NonCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const logs = await fetchLogs();
        console.log('Processed API Response:', JSON.stringify(logs, null, 2));

        const analytics = logs.analytics;
        const totalRecipients = analytics.total || 0;
        const delivered = analytics.statuses?.[0]?.counts || 0;
        const failed = totalRecipients - delivered;

        const campaignData: Campaign[] = logs.messages
          .filter(log => log.campaign_name)
          .map(log => ({
            id: log.sender_id || 'Unknown',
            name: log.campaign_name || 'Unnamed Campaign',
            startDate: log.sent_at ? log.sent_at.split('T')[0] : 'N/A',
            endDate: log.sent_at ? log.sent_at.split('T')[0] : 'N/A',
            status: log.status || 'Unknown',
            recipients: totalRecipients,
            delivered: delivered,
            failed: failed,
            createDate: log.sent_at ? log.sent_at.split('T')[0] : 'N/A',
            deliveredDate: log.sent_at ? log.sent_at.split('T')[0] : 'N/A',
            contactGroup: 'Dynamic Group',
          }));

        const nonCampaignData: NonCampaign[] = logs.messages
          .filter(log => !log.campaign_name)
          .map(log => ({
            id: log.sender_id || 'Unknown',
            message: log.message || 'No message',
            sentDate: log.sent_at || 'N/A',
            recipients: totalRecipients,
            delivered: delivered,
            failed: failed,
          }));

        setCampaigns(campaignData);
        setNonCampaigns(nonCampaignData);
      } catch (error: any) {
        console.error('Failed to fetch logs:', error);
        setError(`Failed to load logs: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderCampaignsOverview = () => (
    <div>
      {campaigns.length === 0 ? (
        <p>No campaigns available.</p>
      ) : (
        campaigns.map(campaign => (
          <div
            key={campaign.id}
            className="p-4 bg-white rounded shadow mb-4 cursor-pointer"
            onClick={() => setSelectedCampaign(campaign)}
          >
            <h3>{campaign.name}</h3>
            <p>Status: {campaign.status}</p>
            <p>Recipients: {campaign.recipients}</p>
          </div>
        ))
      )}
    </div>
  );

  const renderCampaignDetails = () => {
    if (!selectedCampaign) return null;
    return (
      <div className="p-4 bg-white rounded shadow">
        <h2>{selectedCampaign.name}</h2>
        <p>Status: {selectedCampaign.status}</p>
        <p>Recipients: {selectedCampaign.recipients}</p>
        <p>Delivered: {selectedCampaign.delivered}</p>
        <p>Failed: {selectedCampaign.failed}</p>
        <p>Start Date: {selectedCampaign.startDate}</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded mt-4"
          onClick={() => setSelectedCampaign(null)}
        >
          Back
        </button>
      </div>
    );
  };

  const renderNonCampaigns = () => (
    <div>
      {nonCampaigns.length === 0 ? (
        <p>No non-campaign logs available.</p>
      ) : (
        nonCampaigns.map(log => (
          <div key={log.id} className="p-4 bg-white rounded shadow mb-4">
            <p>Message: {log.message}</p>
            <p>Sent: {log.sentDate}</p>
            <p>Recipients: {log.recipients}</p>
            <p>Delivered: {log.delivered}</p>
            <p>Failed: {log.failed}</p>
          </div>
        ))
      )}
    </div>
  );

  if (isLoading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-[#f5f5f5] min-h-screen font-inter">
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${activeTab === 'campaigns' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => {
            setActiveTab('campaigns');
            setSelectedCampaign(null);
          }}
        >
          Campaigns
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'nonCampaigns' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('nonCampaigns')}
        >
          Non-Campaigns
        </button>
      </div>
      <div className="mt-6">
        {activeTab === 'nonCampaigns' && renderNonCampaigns()}
        {activeTab === 'campaigns' && (
          <>
            {selectedCampaign ? renderCampaignDetails() : renderCampaignsOverview()}
          </>
        )}
      </div>
    </div>
  );
};

export default Logs;