import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const toneStyles = {
  success: 'from-emerald-500 to-green-600',
  error: 'from-rose-600 to-red-600',
  info: 'from-sky-500 to-blue-600',
  warning: 'from-amber-500 to-orange-600',
};

const Toast = ({ isVisible, message, type = 'info', onClose }) => {
  const palette = toneStyles[type] || toneStyles.info;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-[1200] w-[90vw] max-w-sm"
        >
          <div className={`relative overflow-hidden rounded-2xl shadow-xl text-white bg-gradient-to-r ${palette}`}>
            <div className="px-5 py-4 pr-12 text-sm font-medium">
              {message}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="absolute top-2 right-2 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
