/**
 * FAQAccordion Component
 * Reusable accordion for FAQ sections
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  variant?: 'light' | 'dark';
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({
  items,
  variant = 'dark',
}) => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const bgClass = variant === 'dark' ? 'bg-white/5 border border-gray-600' : 'bg-gray-100 border border-gray-300';
  const textClass = variant === 'dark' ? 'text-white' : 'text-[#00333e]';
  const textSecondaryClass = variant === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const hoverClass = variant === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-200';

  return (
    <div className="space-y-4">
      {items.map((faq, i) => (
        <div key={i} className={`${bgClass} rounded-lg overflow-hidden`}>
          <button
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className={`w-full px-6 py-4 flex items-center justify-between text-left ${hoverClass} transition-colors`}
          >
            <span className={`font-semibold ${textClass} pr-8 text-left`}>
              {faq.q}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                openFaq === i ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openFaq === i && (
            <div className={`px-6 pb-4 ${textSecondaryClass}`}>
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
