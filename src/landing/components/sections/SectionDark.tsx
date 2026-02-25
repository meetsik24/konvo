/**
 * SectionDark Component
 * Dark section rendered as a big rounded card with mx margin,
 * floating within the white page background.
 */

import React from 'react';
import { gradients } from '../../constants/colors';

interface SectionDarkProps {
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

export const SectionDark: React.FC<SectionDarkProps> = ({
  title,
  subtitle,
  maxWidth = '5xl',
  children,
  className = '',
}) => {
  return (
    /* Outer wrapper — white bg, horizontal padding creates the floating card look */
    <div className="bg-white px-4 sm:px-6 lg:px-8 py-2">
      <section
        className={`relative bg-gradient-to-br ${gradients.darkHero} rounded-3xl overflow-hidden shadow-2xl ${className}`}
      >
        {/* Grid background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Inner content */}
        <div className={`container mx-auto ${maxWidthClasses[maxWidth]} relative z-10 py-16 px-6`}>
          {(title || subtitle) && (
            <div className="text-center mb-12">
              {title && (
                <h2 className="text-3xl font-bold text-white mb-4">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xl text-gray-300">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </section>
    </div>
  );
};
