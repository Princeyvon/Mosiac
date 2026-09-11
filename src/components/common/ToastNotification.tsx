import React from 'react';
import { useStore } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toastMessage } = useStore();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          key="global-toast"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          className="fixed top-18 right-6 z-50 bg-black text-white text-[11px] font-medium px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-white/10 select-none pointer-events-auto"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="tracking-wide">{toastMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
