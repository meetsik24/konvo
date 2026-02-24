/**
 * Card Component
 * Reusable card for displaying content
 */

import React from 'react';

interface CardProps {
  variant?: 'light' | 'dark' | 'neutral';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const variantClasses = {
  light: 'bg-gray-100 border border-gray-300',
  dark: 'bg-white/5 border border-gray-600',
  neutral: 'bg-white border border-gray-300 shadow-sm',
};

export const Card: React.FC<CardProps> = ({
  variant = 'neutral',
  children,
  className = '',
  onClick,
}) => {
  const baseClasses = 'p-6 rounded-lg transition-all duration-300';
  const variantClass = variantClasses[variant];

  return (
    <div
      className={`${baseClasses} ${variantClass} ${className} ${
        onClick ? 'cursor-pointer hover:shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
