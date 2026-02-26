import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error';
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
        >
          <div className={`rounded-lg shadow-lg p-4 min-w-[320px] ${
            type === 'success' ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
          }`}>
            <div className="flex items-center justify-between space-x-3">
              {type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <p className={`text-sm font-medium flex-1 ${
                type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message}
              </p>
              <button
                onClick={onClose}
                className={`p-1 rounded-full hover:bg-opacity-10 ${
                  type === 'success' ? 'hover:bg-green-800' : 'hover:bg-red-800'
                }`}
              >
                <X className={`w-4 h-4 ${
                  type === 'success' ? 'text-green-500' : 'text-red-500'
                }`} />
              </button>
            </div>
          </div>  
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;