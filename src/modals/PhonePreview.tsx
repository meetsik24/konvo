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
    <div className="relative w-full sm:w-[300px] h-[600px]">
      {/* Phone Frame */}
      <div className="w-full h-full bg-[#00333e] rounded-[1.5rem] p-2 shadow-md border border-gray-200">
        <div className="w-full h-full bg-white rounded-[1.3rem] overflow-hidden relative">
          {/* Screen */}
          <div className="absolute inset-2 bg-white rounded-[1.1rem] overflow-hidden">
            {/* Status Bar */}
            <div className="flex justify-between items-center px-4 py-1 bg-white relative z-10">
              <div className="text-xs font-bold text-[#00333e]">01:19</div>
              <div className="flex items-center gap-1">
                <Signal size={12} className="text-[#00333e]" />
                <Wifi size={12} className="text-[#00333e]" />
                <div className="relative">
                  <Battery size={12} className="text-[#00333e]" />
                  <div className="absolute inset-0 bg-[#fddf0d] w-2 h-1 rounded-sm top-0.5 left-0.5"></div>
                </div>
              </div>
            </div>

            {/* Messages Header */}
            <div className="bg-[#00333e] text-white px-4 py-2 flex items-center gap-2">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-[#fddf0d] rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{data.senderName || 'Briq Solutions'}</div>
                <div className="text-xs opacity-90">SMS Message</div>
              </div>
              <MoreHorizontal size={14} className="opacity-70" />
            </div>

            {/* Messages Area */}
            <div className="p-3 space-y-2 min-h-[400px]">
              {/* Message Bubble */}
              <div className="flex flex-col">
                <div className="bg-[#fddf0d] rounded-lg rounded-tl-md px-3 py-2 max-w-[80%] break-words">
                  <p className="text-sm text-[#00333e] leading-relaxed font-medium">
                    {data.message || 'You have received 50,000 TZs from BriqPay. Your new balance is 75,000. Keep Using Briq'}
                  </p>
                </div>
                <div className="text-xs text-gray-500 mt-1 ml-2 flex items-center gap-1">
                  <span>{data.timestamp || '01:19'}</span>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span>Delivered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Phone Reflection */}
          <div className="absolute inset-0 bg-gray-100/5 rounded-[1.3rem] pointer-events-none"></div>
        </div>
      </div>

      {/* Phone Shadow */}
      <div className="absolute inset-0 bg-black/10 rounded-[1.5rem] blur-md transform translate-y-2 -z-10"></div>
    </div>
  );
};

export default PhonePreview;