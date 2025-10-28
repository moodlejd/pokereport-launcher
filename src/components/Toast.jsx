import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'from-green-500 to-green-600',
    error: 'from-pokemon-red to-red-600',
    info: 'from-pokemon-blue to-blue-600',
    warning: 'from-pokemon-yellow to-yellow-600'
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed top-20 right-6 z-50 bg-gradient-to-r ${colors[type]} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-[500px]`}
    >
      <span className="text-2xl">{icons[type]}</span>
      <p className="font-semibold flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white text-xl font-bold"
      >
        ×
      </button>
    </motion.div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <AnimatePresence>
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ top: `${80 + index * 80}px` }}>
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </AnimatePresence>
  );
};

export default Toast;

