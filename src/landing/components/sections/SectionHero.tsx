/**
 * SectionHero Component
 * Dark hero section — used as page header on sub-pages.
 * Positioned as a big rounded card (like SectionDark) when inside a white page.
 */

import React from 'react';
import { gradients } from '../../constants/colors';

interface SectionHeroProps {
  tag?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export const SectionHero: React.FC<SectionHeroProps> = ({
  tag,
  title,
  subtitle,
  children,
  className = '',
}) => {
  return (
    <div className="bg-white px-4 sm:px-6 lg:px-8 pt-4 pb-0">
      <section
        className={`relative bg-gradient-to-br ${gradients.darkHero} rounded-3xl overflow-hidden shadow-2xl pt-28 pb-16 ${className}`}
      >
        {/* Grid background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="container mx-auto max-w-4xl text-center relative z-10 px-6">
          {tag && (
            <p className="text-[#fddf0d] font-semibold text-sm tracking-wide uppercase mb-4">
              {tag}
            </p>
          )}
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
    </div>
  );
};
