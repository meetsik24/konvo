import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'secondary', icon, children, className, ...props }) => {
  const baseClass = 'px-3 py-1 text-sm rounded-sm flex items-center gap-1';
  const variantClass =
    variant === 'primary'
      ? 'text-white bg-[#00333e] hover:bg-gray-700'
      : 'text-[#00333e] bg-gray-100 hover:bg-gray-200';
  return (
    <button className={`${baseClass} ${variantClass} ${className || ''}`} {...props}>
      {icon}
      {children}
    </button>
  );
};