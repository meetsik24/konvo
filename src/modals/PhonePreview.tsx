import React from 'react';
import { Wifi, Battery, Signal, MoreHorizontal } from 'lucide-react';

interface PhonePreviewProps {
  data: {
    senderName: string;
    message: string;
    timestamp: string;
  };
}

const PhonePreview: React.FC<PhonePreviewProps> = ({ data }) => {
  return (
    <div className="w-full h-full font-inter">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-1 bg-white">
        <div className="text-xs font-bold text-[#004d66]">{data.timestamp}</div>
        <div className="flex items-center gap-1">
          <Signal size={12} className="text-[#004d66]" />
          <Wifi size={12} className="text-[#004d66]" />
          <div className="relative">
            <Battery size={12} className="text-[#004d66]" />
            <div className="absolute inset-0 bg-[#FDD70D] w-2 h-1 rounded-sm top-0.5 left-0.5"></div>
          </div>
        </div>
      </div>

      {/* Messages Header */}
      <div className="bg-gray-100 text-[#004d66] px-4 py-2 flex items-center gap-2 border-b border-gray-200">
        <div className="w-6 h-6 bg-[#004d66] bg-opacity-20 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-[#FDD70D] rounded-full"></div>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{data.senderName || 'Briq Solutions'}</div>
          <div className="text-xs opacity-90">SMS Message</div>
        </div>
        <MoreHorizontal size={14} className="text-[#004d66] opacity-70" />
      </div>

      {/* Messages Area */}
      <div className="p-3 space-y-2 flex-1 overflow-y-auto">
        {/* Message Bubble */}
        <div className="flex flex-col">
          <div className="bg-[#FDD70D] rounded-lg rounded-tl-md px-3 py-2 max-w-[80%] break-words">
            <p className="text-sm text-[#004d66] leading-relaxed font-medium">
              {data.message || 'Your message will appear here...'}
            </p>
          </div>
          <div className="text-xs text-[#004d66] mt-1 ml-2 flex items-center gap-1 opacity-70">
            <span>{data.timestamp}</span>
            <div className="w-1 h-1 bg-[#004d66] rounded-full"></div>
            <span>Delivered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhonePreview;