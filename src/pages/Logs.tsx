import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Chart } from 'chart.js/auto';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';

const Logs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const hardcodedCampaigns = [
    { id: 'c1', name: 'Summer Sale 2025', startDate: '2025-06-15', endDate: '2025-07-15', status: 'Active', recipients: 150, delivered: 120, failed: 30, createDate: '2025-06-10', deliveredDate: '2025-07-01', contactGroup: 'Marketing List A' },
    { id: 'c2', name: 'New Product Launch', startDate: '2025-06-18', endDate: '2025-07-20', status: 'Completed', recipients: 200, delivered: 180, failed: 20, smsType: 'Announcement', createDate: '2025-06-05', deliveredDate: '2025-06-30', contactGroup: 'Marketing List B' },
  ];

  const hardcodedNonCampaigns = [
    { id: 'nc1', message: 'Promo Code Alert', sentDate: '2025-07-01 10:00', recipients: 300, delivered: 280, failed: 20 },
    { id: 'nc2', message: 'Service Update', sentDate: '2025-07-02 09:30', recipients: 250, delivered: 230, failed: 20 },
  ];

  const [campaigns] = useState(hardcodedCampaigns);
  const [nonCampaigns] = useState(hardcodedNonCampaigns);
  const [chartInstancePie, setChartInstancePie] = useState(null);
  const [chartInstanceLine, setChartInstanceLine] = useState(null);

  const chartRefPie = useRef(null);
  const chartRefLine = useRef(null);

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
          pieData = [totalDelivered, totalFailed];
        } else {
          pieLabels = ['Delivered', 'Failed'];
          pieData = [selectedCampaign.delivered, selectedCampaign.failed];
        }
        const newChartInstancePie = new Chart(ctxPie, {
          type: 'pie',
          data: {
            labels: pieLabels,
            datasets: [{
              data: pieData,
              backgroundColor: ['#004d66', '#e76f51'],
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' },
            },
          },
        });
        console.log('New pie chart instance created:', newChartInstancePie);
        setChartInstancePie(newChartInstancePie);
      } catch (error) {
        console.error('Error creating pie chart:', error);
      }
    }

    if (chartRefLine.current && activeTab === 'campaigns' && selectedCampaign) {
      const ctxLine = chartRefLine.current.getContext('2d');
      console.log('Line chart context obtained:', ctxLine);
      if (chartInstanceLine) {
        console.log('Destroying existing line chart instance');
        chartInstanceLine.destroy();
      }
      try {
        const newChartInstanceLine = new Chart(ctxLine, {
          type: 'line',
          data: {
            labels: ['06-15', '06-20', '06-25', '07-01', '07-05'],
            datasets: [{
              label: 'Delivered',
              data: [0, 50, 80, 100, selectedCampaign.delivered],
              borderColor: '#004d66',
              backgroundColor: 'rgba(0, 77, 102, 0.2)',
              fill: true,
              tension: 0.4,
            }, {
              label: 'Failed',
              data: [0, 10, 20, 25, selectedCampaign.failed],
              borderColor: '#e76f51',
              backgroundColor: 'rgba(231, 111, 81, 0.2)',
              fill: true,
              tension: 0.4,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' },
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
    } else if (chartRefLine.current && activeTab === 'campaigns' && !selectedCampaign) {
      const ctxLine = chartRefLine.current.getContext('2d');
      console.log('Line chart context obtained for overview:', ctxLine);
      if (chartInstanceLine) {
        console.log('Destroying existing line chart instance');
        chartInstanceLine.destroy();
      }
    }

    if (chartRefPie.current && activeTab === 'nonCampaigns') {
      const ctxPie = chartRefPie.current.getContext('2d');
      console.log('Pie chart context for non-campaigns obtained:', ctxPie);
      if (chartInstancePie) {
        console.log('Destroying existing pie chart instance');
        chartInstancePie.destroy();
      }
      try {
        const totalDelivered = nonCampaigns.reduce((sum, nc) => sum + nc.delivered, 0);
        const totalFailed = nonCampaigns.reduce((sum, nc) => sum + nc.failed, 0);
        const newChartInstancePie = new Chart(ctxPie, {
          type: 'pie',
          data: {
            labels: ['Delivered', 'Failed'],
            datasets: [{
              data: [totalDelivered, totalFailed],
              backgroundColor: ['#004d66', '#e76f51'],
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' },
            },
          },
        });
        console.log('New pie chart instance for non-campaigns created:', newChartInstancePie);
        setChartInstancePie(newChartInstancePie);
      } catch (error) {
        console.error('Error creating pie chart for non-campaigns:', error);
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
  }, [activeTab, selectedCampaign, campaigns, nonCampaigns]);

  const getStatusIcon = (status) => {
    console.log('Getting status icon for:', status);
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-5 h-5 text-[#004d66]" />;
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-[#f4a261]" />;
      default:
        return null;
    }
  };

  const renderCampaignsOverview = () => {
    console.log('Rendering Campaigns Overview');
    const totalCampaigns = campaigns.length;
    const totalRecipients = campaigns.reduce((sum, c) => sum + c.recipients, 0);
    const totalDelivered = campaigns.reduce((sum, c) => sum + c.delivered, 0);
    const totalFailed = campaigns.reduce((sum, c) => sum + c.failed, 0);

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
                {campaigns.map((campaign, index) => (
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
                ))}
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

    const total = selectedCampaign.recipients;
    const delivered = selectedCampaign.delivered;
    const failed = selectedCampaign.failed;
    const deliveryRate = total > 0 ? (delivered / total * 100).toFixed(2) : 0;

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
            className="bg-white rounded-md p-4 border border-gray-200"
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

  const renderNonCampaigns = () => {
    console.log('Rendering Non Campaigns');
    const totalMessages = nonCampaigns.length;
    const totalRecipients = nonCampaigns.reduce((sum, nc) => sum + nc.recipients, 0);
    const totalDelivered = nonCampaigns.reduce((sum, nc) => sum + nc.delivered, 0);
    const totalFailed = nonCampaigns.reduce((sum, nc) => sum + nc.failed, 0);

    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold text-[#004d66] mb-8">Non Campaign SMS Overview</h2>
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
          <h2 className="text-lg font-medium text-[#004d66] mb-4">Non Campaign SMS Table</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {nonCampaigns.map((nc, index) => (
                  <tr key={nc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">{nc.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">{nc.sentDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">{nc.recipients}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">{nc.delivered}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">{nc.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
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
      </div>
    );
  };

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
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'nonCampaigns' ? 'border-b-2 border-[#004d66] text-[#004d66]' : 'text-gray-600'}`}
          onClick={() => { setActiveTab('nonCampaigns'); setSelectedCampaign(null); }}
        >
          Non Campaigns
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'campaigns' ? 'border-b-2 border-[#004d66] text-[#004d66]' : 'text-gray-600'}`}
          onClick={() => { setActiveTab('campaigns'); setSelectedCampaign(null); }}
        >
          Campaigns
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