import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, X } from 'lucide-react';
import { listCampaigns, getCampaignGroups } from '../services/api.tsx';

interface Campaign {
  campaign_id: string;
  name: string;
}

interface Group {
  group_id: string;
  name: string;
}

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (campaignId: string, schedule: string, groupIds: string[]) => void;
  validGroups: Group[];
}

const CampaignModal: React.FC<CampaignModalProps> = ({ isOpen, onClose, onSelect, validGroups }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [schedule, setSchedule] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    console.log('Fetching campaigns...');
    listCampaigns()
      .then((data: Campaign[]) => {
        const campaignsData = Array.isArray(data) ? data : [];
        console.log('Campaigns fetched:', campaignsData);
        setCampaigns(campaignsData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Campaign fetch error:', err);
        setError('Failed to load campaigns');
        setIsLoading(false);
      });
  }, [isOpen]);

  useEffect(() => {
    if (!selectedCampaign) {
      setGroups([]);
      setSelectedGroups([]);
      return;
    }
    setIsLoading(true);
    console.log(`Fetching groups for campaign ${selectedCampaign}...`);
    getCampaignGroups(selectedCampaign)
      .then((data: Group[]) => {
        const groupsData = Array.isArray(data) ? data : [];
        const validCampaignGroups = groupsData.filter((group: Group) =>
          validGroups.some((validGroup) => validGroup.group_id === group.group_id)
        );
        console.log('Groups fetched:', validCampaignGroups);
        setGroups(validCampaignGroups);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Group fetch error:', err);
        setError('Failed to load groups');
        setIsLoading(false);
      });
  }, [selectedCampaign, validGroups]);

  const handleSubmit = () => {
    if (!selectedCampaign) {
      setError('Please select a campaign');
      return;
    }
    console.log('Submitting campaign:', { selectedCampaign, schedule, selectedGroups });
    onSelect(selectedCampaign, schedule, selectedGroups);
    handleClose();
  };

  const handleClose = () => {
    setSelectedCampaign('');
    setSelectedGroups([]);
    setSearch('');
    setSchedule('');
    setIsScheduling(false);
    setError(null);
    onClose();
  };

  const toggleGroup = (groupId: string) =>
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );

  const filteredCampaigns = campaigns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-lg p-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#00333e]">Select Campaign</h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-[#00333e]">
            <X className="w-5 h-5" />
          </button>
        </div>
        {isLoading && (
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#00333e]"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-2 rounded-lg mb-4 text-sm">{error}</div>
        )}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-600" />
          <input
            type="text"
            className="w-full text-sm py-2 px-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-[150px] overflow-y-auto mb-4">
          {filteredCampaigns.length === 0 && !isLoading ? (
            <p className="text-sm text-gray-600">No campaigns found.</p>
          ) : (
            filteredCampaigns.map((c) => (
              <label key={c.campaign_id} className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name="campaign"
                  checked={selectedCampaign === c.campaign_id}
                  onChange={() => setSelectedCampaign(c.campaign_id)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-[#00333e]">{c.name}</span>
              </label>
            ))
          )}
        </div>
        {selectedCampaign && (
          <div className="mb-4">
            <p className="text-sm font-medium text-[#00333e] mb-2">Groups</p>
            {groups.length === 0 ? (
              <p className="text-sm text-gray-600">No groups available.</p>
            ) : (
              <div className="max-h-[100px] overflow-y-auto">
                {groups.map((g) => (
                  <label key={g.group_id} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(g.group_id)}
                      onChange={() => toggleGroup(g.group_id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-[#00333e]">{g.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="mb-4">
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={isScheduling}
              onChange={(e) => {
                setIsScheduling(e.target.checked);
                setSchedule(e.target.checked ? new Date().toISOString().slice(0, 16) : '');
              }}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-[#00333e]">Schedule Message</span>
          </label>
          {isScheduling && (
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-600" />
              <input
                type="datetime-local"
                className="w-full text-sm py-2 px-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClose}
            className="px-3 py-1 text-sm text-[#00333e] bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className="px-3 py-1 text-sm bg-[#00333e] text-white rounded-lg hover:bg-[#002a36]"
            disabled={isLoading}
          >
            Select
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CampaignModal;