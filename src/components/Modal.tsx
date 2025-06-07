import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, onSubmit, submitText = 'Submit' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white p-4 w-full max-w-sm shadow-sm border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base text-[#00333e] font-medium">{title}</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-[#00333e]">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose}>Cancel</Button>
          {onSubmit && <Button variant="primary" onClick={onSubmit}>{submitText}</Button>}
        </div>
      </div>
    </div>
  );
};