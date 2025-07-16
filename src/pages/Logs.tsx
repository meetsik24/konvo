import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Chart } from 'chart.js/auto';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { getMessageLogsV1 } from '../services/api';


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

const Logs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'messages'>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartInstancePie, setChartInstancePie] = useState<Chart | null>(null);
  const [chartInstanceLine, setChartInstanceLine] = useState<Chart | null>(null);

  const chartRefPie = useRef<HTMLCanvasElement>(null);
  const chartRefLine = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const logs: MessageLogResponse = await getMessageLogsV1();
        console.log('Fetched from /messages/logs/V1:', JSON.stringify(logs, null, 2));
        console.log('All messages before filtering:', JSON.stringify(logs.messages, null, 2));
        console.log('Unique campaign_name values:', [...new Set(logs.messages.map(log => log.campaign_name))]);

        // Process analytics data
        const totalRecipients = logs.analytics?.total || 0;
        const delivered = logs.analytics?.statuses?.find(s => s.status.toLowerCase() === 'sent')?.counts || 0;
        const failed = logs.analytics?.statuses?.find(s => s.status.toLowerCase() === 'failed')?.counts || 0;
        const pending = logs.analytics?.statuses?.find(s => s.status.toLowerCase() === 'pending')?.counts || 0;

        setAnalytics({
          total: totalRecipients,
          statuses: logs.analytics?.statuses || [],
        });

        // Map to Campaign
        const campaignData: Campaign[] = logs.messages
          .filter(log => log.campaign_name && log.campaign_name !== '') // Exclude null, undefined, and empty string
          .reduce((acc: Campaign[], log) => {
            const existingCampaign = acc.find(c => c.name === log.campaign_name);
            if (!existingCampaign) {
              acc.push({
                id: log.sender_id || `camp-${Math.random().toString(36).substr(2, 9)}`,
                name: log.campaign_name || 'Unnamed Campaign',
                startDate: log.sent_at ? log.sent_at.split('T')[0] : 'N/A',
                endDate: log.sent_at ? log.sent_at.split('T')[0] : 'N/A',
                status: log.status || 'Unknown',
                recipients: totalRecipients,
                delivered,
                failed: failed + pending,
                createDate: log.sent_at ? log.sent_at.split('T')[0] : 'N/A',
                deliveredDate: log.sent_at ? log.sent_at.split('T')[0] : 'N/A',
                contactGroup: 'Dynamic Group',
              });
            }
            return acc;
          }, []);

        // Map to Messages (non-campaign messages)
        const messageData: Message[] = logs.messages
          .filter(log => !log.campaign_name || log.campaign_name === '') // Include null, undefined, or empty string
          .map(log => ({
            sent_at: log.sent_at || 'N/A',
            status: log.status || 'Unknown',
            sender_id: log.sender_id || 'Unknown',
            message: log.message || 'No message',
            recipient: log.recipient || 'Unknown',
            campaign_name: null,
          }));

        console.log('Processed campaigns:', JSON.stringify(campaignData, null, 2));
        console.log('Processed messages:', JSON.stringify(messageData, null, 2));
        console.log('Non-campaign message count:', messageData.length);
        console.log('Campaign count:', campaignData.length);

        setCampaigns(campaignData);
        setMessages(messageData);
      } catch (error: any) {
        console.error('Failed to fetch logs:', error);
        setError(`Failed to load logs: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log('useEffect triggered for chart setup, activeTab:', activeTab, 'selectedCampaign:', selectedCampaign);
    if (chartRefPie.current && activeTab === 'campaigns') {
      const ctxPie = chartRefPie.current.getContext('2d');
      console.log('Pie chart context obtained:', ctxPie);
      if (chartInstancePie) {
        console.log('Destroying existing pie chart instance');
        chartInstancePie.destroy();
      }
      try {
        let pieData, pieLabels;
        if (!selectedCampaign) {
          const totalDelivered = campaigns.reduce((sum, c) => sum + c.delivered, 0);
          const totalFailed = campaigns.reduce((sum, c) => sum + c.failed, 0);
          pieLabels = ['Delivered', 'Failed'];
          pieData = campaigns.length ? [totalDelivered, totalFailed] : [0, 0]; // Show 0 for empty campaigns
        } else {
          pieLabels = ['Delivered', 'Failed'];
          pieData = [selectedCampaign.delivered, selectedCampaign.failed];
        }
        const newChartInstancePie = new Chart(ctxPie!, {
          type: 'pie',
          data: {
            labels: pieLabels,
            datasets: [{
              data: pieData,
              backgroundColor: ['#004d66', '#FDD70D'],
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || '';
                    const value = context.raw as number;
                    return campaigns.length || selectedCampaign ? `${label}: ${value}` : `${label}: No data`;
                  },
                },
              },
            },
          },
        });
        console.log('New pie chart instance created:', newChartInstancePie);
        setChartInstancePie(newChartInstancePie);
      } catch (error) {
        console.error('Error creating pie chart:', error);
      }
    }

    if (chartRefLine.current && activeTab === 'campaigns') {
      const ctxLine = chartRefLine.current.getContext('2d');
      console.log('Line chart context obtained:', ctxLine);
      if (chartInstanceLine) {
        console.log('Destroying existing line chart instance');
        chartInstanceLine.destroy();
      }
      try {
        let dates, deliveredData, failedData;
        if (selectedCampaign) {
          dates = [selectedCampaign.startDate];
          deliveredData = [selectedCampaign.delivered];
          failedData = [selectedCampaign.failed];
        } else {
          dates = campaigns
            .map(c => c.startDate)
            .filter((date, index, self) => self.indexOf(date) === index)
            .sort()
            .slice(-5);
          deliveredData = dates.map(date =>
            campaigns
              .filter(c => c.startDate === date)
              .reduce((sum, c) => sum + c.delivered, 0)
          );
          failedData = dates.map(date =>
            campaigns
              .filter(c => c.startDate === date)
              .reduce((sum, c) => sum + c.failed, 0)
          );
        }

        // Use fallback for empty campaigns
        if (!dates.length) {
          dates = ['No Data'];
          deliveredData = [0];
          failedData = [0];
        }

        const newChartInstanceLine = new Chart(ctxLine!, {
          type: 'line',
          data: {
            labels: dates,
            datasets: [
              {
                label: 'Delivered',
                data: deliveredData,
                borderColor: '#004d66',
                backgroundColor: 'rgba(0, 77, 102, 0.2)',
                fill: true,
                tension: 0.4,
              },
              {
                label: 'Failed',
                data: failedData,
                borderColor: '#FDD70D',
                backgroundColor: 'rgba(253, 215, 13, 0.6)',
                fill: true,
                tension: 0.4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.dataset.label || '';
                    const value = context.raw as number;
                    return campaigns.length || selectedCampaign ? `${label}: ${value}` : `${label}: No data`;
                  },
                },
              },
            },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Count' } },
              x: { title: { display: true, text: 'Date' } },
            },
          },
        });
        console.log('New line chart instance created:', newChartInstanceLine);
        setChartInstanceLine(newChartInstanceLine);
      } catch (error) {
        console.error('Error creating line chart:', error);
      }
    }

    return () => {
      if (chartInstancePie) {
        console.log('Cleaning up pie chart instance');
        chartInstancePie.destroy();
      }
      if (chartInstanceLine) {
        console.log('Cleaning up line chart instance');
        chartInstanceLine.destroy();
      }
    };
  }, [activeTab, selectedCampaign, campaigns]);

  const getStatusIcon = (status: string) => {
    console.log('Getting status icon for:', status);
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-[#004d66]" />;
      case 'completed':
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-[#f4a261]" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const indexOfLastMessage = currentPage * itemsPerPage;
  const indexOfFirstMessage = indexOfLastMessage - itemsPerPage;
  const currentMessages = messages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(messages.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const renderCampaignsOverview = () => {
    console.log('Rendering Campaigns Overview, campaigns:', JSON.stringify(campaigns, null, 2));
    const totalCampaigns = campaigns.length;
    const totalRecipients = campaigns.length ? campaigns.reduce((sum, c) => sum + c.recipients, 0) : 0;
    const totalDelivered = campaigns.length ? campaigns.reduce((sum, c) => sum + c.delivered, 0) : 0;
    const totalFailed = campaigns.length ? campaigns.reduce((sum, c) => sum + c.failed, 0) : 0;

    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold text-[#004d66] mb-8">Campaigns Overview</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-md p-4 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-gradient-to-r from-[#004d66] to-[#004d66]">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Campaigns</p>
                <p className="text-lg font-medium text-[#004d66]">{totalCampaigns}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-md p-4 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-gradient-to-r from-[#f4a261] to-[#f4a261]">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Recipients</p>
                <p className="text-lg font-medium text-[#004d66]">{totalRecipients}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-md p-4 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-gradient-to-r from-[#e76f51] to-[#e76f51]">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-lg font-medium text-[#004d66]">{totalDelivered}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-md p-4 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-gradient-to-r from-[#004d66] to-[#004d66]">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-lg font-medium text-[#004d66]">{totalFailed}</p>
              </div>
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-md p-6 border border-gray-200"
        >
          <h2 className="text-lg font-medium text-[#004d66] mb-4">Campaigns Table</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-600">
                      No campaigns available.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedCampaign(campaign)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">{campaign.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">{campaign.startDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">{campaign.endDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusIcon(campaign.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCampaign(campaign);
                          }}
                          className="text-[#004d66] hover:text-[#f4a261] font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-md p-6 border border-gray-200"
          >
            <h2 className="text-lg font-medium text-[#004d66] mb-4">Delivery Status</h2>
            <div className="h-64">
              <canvas ref={chartRefPie} />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-md p-6 border border-gray-200"
          >
            <h2 className="text-lg font-medium text-[#004d66] mb-4">Delivery Trend</h2>
            <div className="h-64">
              <canvas ref={chartRefLine} />
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderCampaignDetails = () => {
    console.log('Rendering Campaign Details for:', selectedCampaign);
    if (!selectedCampaign) return null;

    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold text-[#004d66] mb-8">Campaign Details - {selectedCampaign.name}</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-md p-4 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-gradient-to-r from-[#004d66] to-[#004d66]">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Campaigns</p>
                <p className="text-lg font-medium text-[#004d66]">1</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-md p-4 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-gradient-to-r from-[#f4a261] to-[#f4a261]">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Recipients</p>
                <p className="text-lg font-medium text-[#004d66]">{selectedCampaign.recipients}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-md p-4 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-gradient-to-r from-[#e76f51] to-[#e76f51]">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-lg font-medium text-[#004d66]">{selectedCampaign.delivered}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-md p-6 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-gradient-to-r from-[#004d66] to-[#004d66]">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-lg font-medium text-[#004d66]">{selectedCampaign.failed}</p>
              </div>
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-md p-6 border border-gray-200"
        >
          <h2 className="text-lg font-medium text-[#004d66] mb-4">Campaign Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="text-gray-600">Campaign Name: <span className="text-[#004d66]">{selectedCampaign.name}</span></p>
            <p className="text-gray-600">Status: <span className="text-[#004d66]">{getStatusIcon(selectedCampaign.status)} {selectedCampaign.status}</span></p>
            <p className="text-gray-600">Start Date: <span className="text-[#004d66]">{selectedCampaign.startDate}</span></p>
            <p className="text-gray-600">End Date: <span className="text-[#004d66]">{selectedCampaign.endDate}</span></p>
            <p className="text-gray-600">Create Date: <span className="text-[#004d66]">{selectedCampaign.createDate}</span></p>
            <p className="text-gray-600">Delivered Date: <span className="text-[#004d66]">{selectedCampaign.deliveredDate}</span></p>
            <p className="text-gray-600">Contact Group: <span className="text-[#004d66]">{selectedCampaign.contactGroup}</span></p>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-md p-6 border border-gray-200"
          >
            <h2 className="text-lg font-medium text-[#004d66] mb-4">Delivery Status</h2>
            <div className="h-64">
              <canvas ref={chartRefPie} />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-md p-6 border border-gray-200"
          >
            <h2 className="text-lg font-medium text-[#004d66] mb-4">Delivery Trend</h2>
            <div className="h-64">
              <canvas ref={chartRefLine} />
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderMessages = () => {
    console.log('Rendering Messages, messages:', JSON.stringify(messages, null, 2));
    console.log('Analytics data:', JSON.stringify(analytics, null, 2));

    const totalMessages = analytics?.total || 0;
    const totalRecipients = analytics?.total || 0;
    const totalDelivered = analytics?.statuses.find(s => s.status.toLowerCase() === 'sent')?.counts || 0;
    const totalFailed = (analytics?.statuses.find(s => s.status.toLowerCase() === 'failed')?.counts || 0) +
                        (analytics?.statuses.find(s => s.status.toLowerCase() === 'pending')?.counts || 0);

    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold text-[#004d66] mb-8">Messages Overview</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-md p-4 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-gradient-to-r from-[#004d66] to-[#004d66]">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-lg font-medium text-[#004d66]">{totalMessages}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-md p-4 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-gradient-to-r from-[#f4a261] to-[#f4a261]">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Recipients</p>
                <p className="text-lg font-medium text-[#004d66]">{totalRecipients}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-md p-4 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-gradient-to-r from-[#e76f51] to-[#e76f51]">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-lg font-medium text-[#004d66]">{totalDelivered}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-md p-4 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-gradient-to-r from-[#004d66] to-[#004d66]">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-lg font-medium text-[#004d66]">{totalFailed}</p>
              </div>
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-md p-6 border border-gray-200"
        >
          <h2 className="text-lg font-medium text-[#004d66] mb-4">Messages Table</h2>
          {messages.length === 0 ? (
            <p className="text-gray-600">No non-campaign messages available. Try checking the Campaigns tab for campaign-related messages.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentMessages.map((msg, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">{msg.sent_at}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusIcon(msg.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">{msg.sender_id}</td>
                      <td className="px-6 py-4 text-sm text-[#004d66]">{msg.message}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">{msg.recipient}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm font-medium text-[#004d66] rounded-md ${
                  currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#f4a261]'
                }`}
              >
                Previous
              </button>
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-[#004d66] text-white'
                        : 'text-[#004d66] hover:text-[#f4a261]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm font-medium text-[#004d66] rounded-md ${
                  currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#f4a261]'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-6 w-6 text-[#00333e]" viewBox="0 0 24 24" aria-label="Loading">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="ml-3 text-[#00333e] text-sm">Loading Analytical Data</p>
      </div>
    );
  } 
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-[#f5f5f5] min-h-screen font-inter">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-2xl font-semibold text-[#004d66] mb-8">SMS Analytics Dashboard</h1>
      </motion.div>
      <div className="flex space-x-6 border-b border-gray-300">
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'messages' ? 'border-b-2 border-[#004d66] text-[#004d66]' : 'text-gray-600'}`}
          onClick={() => {
            setActiveTab('messages');
            setSelectedCampaign(null);
            setCurrentPage(1);
          }}
        >
          Messages
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'campaigns' ? 'border-b-2 border-[#004d66] text-[#004d66]' : 'text-gray-600'}`}
          onClick={() => {
            setActiveTab('campaigns');
            setSelectedCampaign(null);
          }}
        >
          Campaigns
        </button>
      </div>
      <div className="mt-6">
        {activeTab === 'messages' && renderMessages()}
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