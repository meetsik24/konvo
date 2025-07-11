import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { getMessageLogsV1 } from '../services/api'; // Import the endpoint function

const Logs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [nonCampaigns, setNonCampaigns] = useState([]);
  const [chartInstancePie, setChartInstancePie] = useState(null);
  const [chartInstanceLine, setChartInstanceLine] = useState(null);

  const chartRefPie = useRef(null);
  const chartRefLine = useRef(null);

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const logs = await getMessageLogsV1();
        const campaignData = logs.filter(log => log.campaign_name).map(log => ({
          id: log.sender_id,
          name: log.campaign_name,
          startDate: log.sent_at.split('T')[0], // Adjust based on actual date format
          endDate: log.sent_at.split('T')[0], // Adjust as needed
          status: log.status,
          recipients: log.analytics.total,
          delivered: log.analytics.status.counts,
          failed: log.analytics.total - log.analytics.status.counts, // Assuming failed = total - delivered
          createDate: log.sent_at.split('T')[0], // Adjust as needed
          deliveredDate: log.sent_at.split('T')[0], // Adjust as needed
          contactGroup: 'Dynamic Group' // Adjust as needed
        }));
        const nonCampaignData = logs.filter(log => !log.campaign_name).map(log => ({
          id: log.sender_id,
          message: log.message,
          sentDate: log.sent_at,
          recipients: log.analytics.total,
          delivered: log.analytics.status.counts,
          failed: log.analytics.total - log.analytics.status.counts // Assuming failed = total - delivered
        }));
        setCampaigns(campaignData);
        setNonCampaigns(nonCampaignData);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
    };
    fetchData();
  }, []);

  // Rest of the existing useEffect for charts remains the same
  useEffect(() => {
    // ... (keep the existing chart setup logic)
  }, [activeTab, selectedCampaign, campaigns, nonCampaigns]);

  const getStatusIcon = (status) => {
    // ... (keep the existing logic)
  };

  const renderCampaignsOverview = () => {
    // ... (keep the existing logic, using campaigns state)
  };

  const renderCampaignDetails = () => {
    // ... (keep the existing logic, using selectedCampaign state)
  };

  const renderNonCampaigns = () => {
    // ... (keep the existing logic, using nonCampaigns state)
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-[#f5f5f5] min-h-screen font-inter">
      {/* ... (keep the existing JSX structure) */}
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