/**
 * TestimonialCard Component
 * Reusable card for displaying customer testimonials
 */

import React from 'react';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  variant?: 'light' | 'dark';
  rating?: number;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  role,
  company,
  variant = 'dark',
  rating = 5,
}) => {
  const bgClass = variant === 'dark'
    ? 'bg-white/5 border border-gray-600 hover:border-[#fddf0d]/50'
    : 'bg-white border border-gray-300 hover:border-[#fddf0d]';
  const textClass = variant === 'dark' ? 'text-gray-100' : 'text-[#00333e]';
  const textSecondaryClass = variant === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const quoteClass = variant === 'dark' ? 'text-gray-300' : 'text-gray-700';

  return (
    <div className={`${bgClass} rounded-lg p-8 transition-all duration-300 hover:shadow-lg`}>
      {/* Rating */}
      <div className="flex gap-1 mb-6">
        {Array.from({ length: rating }).map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4 fill-[#fddf0d] text-[#fddf0d]"
          />
        ))}
      </div>

      {/* Quote */}
      <p className={`${quoteClass} text-base leading-relaxed mb-8 italic`}>
        "{quote}"
      </p>

      {/* Author Info */}
      <div>
        <p className={`font-semibold ${textClass}`}>{author}</p>
        <p className={`text-sm ${textSecondaryClass}`}>{role}</p>
        <p className={`text-sm ${textSecondaryClass}`}>{company}</p>
      </div>
    </div>
  );
};
