import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, onSubmit, submitText = 'Submit' }) => {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-lg p-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#00333e]">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-[#00333e]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-3 py-1 text-sm text-[#00333e] bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </motion.button>
          {onSubmit && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSubmit}
              className="px-3 py-1 text-sm bg-[#00333e] text-white rounded-lg hover:bg-[#002a36]"
            >
              {submitText}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Modal;