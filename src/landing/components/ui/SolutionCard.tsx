/**
 * SolutionCard Component
 * Reusable card for displaying solution/use-case items
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface SolutionCardProps {
  title: string;
  description: string;
  onClick?: () => void;
  variant?: 'light' | 'dark';
}

export const SolutionCard: React.FC<SolutionCardProps> = ({
  title,
  description,
  onClick,
  variant = 'dark',
}) => {
  const bgClass = variant === 'dark'
    ? 'bg-white/5 border border-gray-600 hover:border-[#fddf0d]/50 group hover:bg-white/10'
    : 'bg-gray-50 border border-gray-300 hover:border-[#fddf0d] group hover:bg-white';
  const textClass = variant === 'dark' ? 'text-gray-100' : 'text-[#00333e]';
  const textSecondaryClass = variant === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <div
      className={`${bgClass} rounded-lg p-6 transition-all duration-300 hover:shadow-lg cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-xl font-bold ${textClass}`}>{title}</h3>
        <ArrowRight className="w-5 h-5 text-[#fddf0d] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className={`${textSecondaryClass} text-sm leading-relaxed`}>
        {description}
      </p>
    </div>
  );
};
