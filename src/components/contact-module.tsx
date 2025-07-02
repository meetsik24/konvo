import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
const [showSuccessNotification, setShowSuccessNotification] = useState(false);
const [successMessage, setSuccessMessage] = useState('');
const [successSubMessage, setSuccessSubMessage] = useState('');

// Add this JSX to your component's return statement (preferably at the end, after the Modal)
{showSuccessNotification && (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
    className="fixed inset-0 flex items-center justify-center z-50 p-4"
  >
    <div className="bg-green-500 text-white p-4 rounded-xl shadow-2xl flex flex-col items-center gap-2 w-full max-w-xs">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <CheckCircle className="w-10 h-10" />
      </motion.div>
      <span className="text-lg font-semibold text-center">
        {successMessage}
      </span>
      <p className="text-sm text-green-100 text-center">
        {successSubMessage}
      </p>
    </div>
  </motion.div>
)}