/**
 * Button Component
 * Reusable button with multiple variants for landing pages
 */

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-[#fddf0d] text-[#00333e] hover:bg-[#fce96a] border-0',
  secondary: 'bg-white/10 text-white hover:bg-white/20 border border-gray-600',
  dark: 'bg-[#00333e] text-white hover:bg-[#001f26] border-0',
  outline: 'bg-transparent text-white hover:bg-white/10 border border-white/30',
};

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-5 py-3 text-base',
  lg: 'px-10 py-4 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseClasses = 'rounded-lg font-semibold transition-colors cursor-pointer';
    const variantClass = variantClasses[variant];
    const sizeClass = sizeClasses[size];

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';