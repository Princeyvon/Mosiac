import React from 'react';
import { useStore } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, ShieldCheck } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const { cookieConsent, setCookieConsent, navigateToPolicies } = useStore();

  return (
    <AnimatePresence>
      {cookieConsent === null && (
        <motion.div
          key="cookie-banner"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          className="fixed bottom-0 inset-x-0 z-50 bg-white/98 backdrop-blur-md border-t border-black/10 shadow-2xl px-4 py-3.5 sm:py-4 md:px-8"
        >
          <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-2.5 text-center sm:text-left">
              <Cookie className="w-4 h-4 text-neutral-500 shrink-0 hidden sm:block mt-0.5 sm:mt-0" />
              <p className="text-[11px] text-neutral-700 tracking-wide font-light leading-relaxed">
                Mosiac uses essential storage to remember your bespoke bag, currency conversions, and atelier display preferences.{' '}
                <button
                  type="button"
                  onClick={navigateToPolicies}
                  className="underline hover:text-black font-medium text-neutral-900 cursor-pointer ml-1 inline-block"
                >
                  Review Cookie Policy & Storage Details
                </button>
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto justify-center sm:justify-end flex-wrap">
              <motion.button
                id="cookie-reject-btn"
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setCookieConsent('rejected')}
                className="text-[10px] uppercase tracking-[0.2em] px-3.5 sm:px-4 py-2 border border-neutral-300 hover:border-black transition-colors text-neutral-800 hover:text-black font-medium cursor-pointer rounded-xs"
              >
                Reject Non-Essential
              </motion.button>
              <motion.button
                id="cookie-accept-btn"
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setCookieConsent('accepted')}
                className="text-[10px] uppercase tracking-[0.2em] px-4 sm:px-5 py-2 bg-black text-white hover:bg-neutral-800 transition-colors font-semibold cursor-pointer rounded-xs shadow-xs"
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
