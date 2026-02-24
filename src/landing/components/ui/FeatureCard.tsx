/**
 * FeatureCard Component
 * Reusable card for displaying features with title, description, price, capabilities
 */

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from './button';

interface FeatureCardProps {
  title: string;
  tagline: string;
  description: string;
  price: string;
  capabilities: string[];
  onGetStarted?: () => void;
  variant?: 'light' | 'dark';
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  tagline,
  description,
  price,
  capabilities,
  onGetStarted,
  variant = 'dark',
}) => {
  const bgClass = variant === 'dark'
    ? 'bg-white/5 border border-gray-600 hover:border-[#fddf0d]/50 hover:bg-white/10'
    : 'bg-gray-50 border border-gray-300 hover:border-[#fddf0d] hover:bg-white';
  const textClass = variant === 'dark' ? 'text-white' : 'text-[#00333e]';
  const textSecondaryClass = variant === 'dark' ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className={`${bgClass} rounded-lg p-8 transition-all duration-300 hover:shadow-xl flex flex-col`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className={`text-2xl font-bold ${textClass} mb-2`}>{title}</h3>
        <p className="text-[#fddf0d] font-semibold text-sm">{tagline}</p>
      </div>

      {/* Description */}
      <p className={`${textSecondaryClass} text-sm leading-relaxed mb-6`}>
        {description}
      </p>

      {/* Price */}
      <p className={`text-lg font-bold ${textClass} mb-6`}>{price}</p>

      {/* Capabilities */}
      <div className="space-y-3 flex-grow mb-8">
        {capabilities.map((capability, i) => (
          <div key={i} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#fddf0d] flex-shrink-0 mt-0.5" />
            <span className={textSecondaryClass}>{capability}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      {onGetStarted && (
        <Button
          variant="primary"
          size="md"
          onClick={onGetStarted}
          className="w-full"
        >
          Get Started
        </Button>
      )}
    </div>
  );
};
