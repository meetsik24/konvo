import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  const inputClass = 'w-full text-sm py-1 px-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#fddf0d]';
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm text-[#00333e] font-medium">{label}</label>}
      <input className={`${inputClass} ${className || ''}`} {...props} />
      {error && <p className="text-xs text-[#00333e]">{error}</p>}
    </div>
  );
};