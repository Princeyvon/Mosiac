import React from 'react';
import { useStore } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';

export const CookieBanner: React.FC = () => {
  const { cookieConsent, setCookieConsent } = useStore();

  return (
    <AnimatePresence>
      {cookieConsent === null && (
        <motion.div
          key="cookie-banner"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-black/10 shadow-lg px-4 py-3 md:px-8"
        >
          <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-neutral-700 tracking-wide font-light text-center sm:text-left">
              We use cookies to ensure you get the best experience on our website.
            </p>

            <div className="flex items-center gap-3 shrink-0">
              <motion.button
                id="cookie-reject-btn"
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setCookieConsent('rejected')}
                className="text-[10px] uppercase tracking-[0.2em] px-4 py-2 border border-neutral-300 hover:border-black transition-colors text-black font-medium cursor-pointer"
              >
                Reject All
              </motion.button>
              <motion.button
                id="cookie-accept-btn"
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setCookieConsent('accepted')}
                className="text-[10px] uppercase tracking-[0.2em] px-4 py-2 bg-black text-white hover:bg-neutral-800 transition-colors font-medium cursor-pointer"
              >
                Accept All
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
