import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, BarChart2 } from 'lucide-react';

interface Props {
  groups: { group_id?: string; name: string }[];
  senderIds: { sender_id: string; name: string; is_approved: boolean }[];
  campaigns: { campaign_id: string; name: string }[];
}

const Stats: React.FC<Props> = ({ groups, senderIds, campaigns }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
    role="region"
    aria-label="Statistics dashboard"
  >
    {[
      { icon: Users, label: 'Groups', value: groups.length, tooltip: 'Total groups available' },
      { icon: Clock, label: 'Campaigns', value: campaigns.length, tooltip: 'Active campaigns' },
      { icon: BarChart2, label: 'Sender IDs', value: senderIds.length, tooltip: 'Approved sender IDs' },
    ].map(({ icon: Icon, label, value, tooltip }, i) => (
      <motion.div
        key={i}
        whileHover={{ scale: 1.03 }}
        className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-lg transition-shadow"
        role="figure"
        aria-label={tooltip}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-[#003087]" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-semibold text-[#003087]">{label}</h3>
            <p className="text-gray-600 text-sm">{value}</p>
          </div>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

export default Stats;