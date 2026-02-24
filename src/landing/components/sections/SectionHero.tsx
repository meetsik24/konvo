/**
 * SectionHero Component
 * Dark hero section with gradient background and grid pattern
 * Reusable across all landing pages
 */

import React from 'react';
import { gradients } from '../../constants/colors';

interface SectionHeroProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export const SectionHero: React.FC<SectionHeroProps> = ({
  title,
  subtitle,
  children,
  className = '',
}) => {
  return (
    <section className={`pt-32 pb-20 px-6 relative bg-gradient-to-br ${gradients.darkHero} ${className}`}>
      {/* Grid background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      
      <div className="container mx-auto max-w-4xl text-center relative z-10">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
};
