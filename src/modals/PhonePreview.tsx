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
    <div className="relative w-[300px] h-[600px]">
      {/* Phone Frame */}
      <div className="w-full h-full bg-gradient-to-b from-purple-800 to-blue-900 rounded-[2rem] p-2 shadow-2xl ring-1 ring-white/10">
        <div className="w-full h-full bg-black rounded-[1.8rem] overflow-hidden relative">
          {/* Screen */}
          <div className="absolute inset-2 bg-white rounded-[1.6rem] overflow-hidden">
            {/* Dynamic Island */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-gray-800 rounded-full z-20"></div>
            
            {/* Status Bar */}
            <div className="flex justify-between items-center px-6 py-2 pt-6 bg-white relative z-10">
              <div className="text-sm font-bold text-gray-900">22:53</div>
              <div className="flex items-center gap-1">
                <Signal size={14} className="text-gray-900" />
                <Wifi size={14} className="text-gray-900" />
                <div className="relative">
                  <Battery size={14} className="text-gray-900" />
                  <div className="absolute inset-0 bg-green-500 w-3 h-1.5 rounded-sm top-0.5 left-0.5"></div>
                </div>
              </div>
            </div>

            {/* Messages Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-3 flex items-center gap-2 shadow-md">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{data.senderName || 'Briq Solutions'}</div>
                <div className="text-xs opacity-90">SMS Message</div>
              </div>
              <MoreHorizontal size={16} className="opacity-70" />
            </div>

            {/* Messages Area */}
            <div className="flex-1 bg-gradient-to-b from-gray-50 to-white p-3 space-y-3 min-h-[400px]">
              {/* Message Bubble */}
              <div className="flex flex-col">
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl rounded-tl-md px-3 py-2 max-w-[85%] shadow-sm border border-green-200/50">
                  <p className="text-sm text-gray-800 leading-relaxed font-medium">
                    {data.message || 'You have received 50,000 TZs from BriqPay. Your new balance is 75,000. Keep Using Briq'}
                  </p>
                </div>
                <div className="text-xs text-gray-500 mt-1 ml-2 flex items-center gap-1">
                  <span>{data.timestamp || '22:53'}</span>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span>Delivered</span>
                </div>
              </div>

              {/* Typing Indicator */}
              <div className="flex items-center gap-2 opacity-50">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500">Typing...</span>
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-100 p-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full px-3 py-2 border border-gray-200">
                  <div className="text-sm text-gray-500">Text Message</div>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Phone Reflection */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[1.8rem] pointer-events-none"></div>
        </div>
      </div>

      {/* Phone Shadow */}
      <div className="absolute inset-0 bg-black/20 rounded-[2rem] blur-xl transform translate-y-2 -z-10"></div>
    </div>
  );
};

export default PhonePreview;