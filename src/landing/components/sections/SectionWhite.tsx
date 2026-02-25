/**
 * SectionWhite Component
 * White background section — tight padding for dense layout.
 */

import React from 'react';

interface SectionWhiteProps {
  title?: string;
  subtitle?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '7xl';
  children: React.ReactNode;
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '7xl': 'max-w-7xl',
};

export const SectionWhite: React.FC<SectionWhiteProps> = ({
  title,
  subtitle,
  maxWidth = '5xl',
  children,
  className = '',
}) => {
  return (
    <section className={`py-12 px-6 bg-white ${className}`}>
      <div className={`container mx-auto ${maxWidthClasses[maxWidth]}`}>
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {title && (
              <h2 className="text-3xl font-bold text-[#00333e] mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xl text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};
