import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, ArrowUpRight, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY_CUSTOM_DISMISSED = 'mosiac_custom_rug_popup_dismissed_v1';

export const CustomRugPopup: React.FC = () => {
  const { showCustomRugPopup, setShowCustomRugPopup } = useStore();

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem(STORAGE_KEY_CUSTOM_DISMISSED);
    if (isDismissed) return;

    // Trigger exactly 45 seconds after the site has loaded
    const timer = setTimeout(() => {
      const alreadyDismissed = sessionStorage.getItem(STORAGE_KEY_CUSTOM_DISMISSED);
      if (!alreadyDismissed) {
        setShowCustomRugPopup(true);
      }
    }, 45000);

    return () => clearTimeout(timer);
  }, [setShowCustomRugPopup]);

  const handleDismiss = () => {
    setShowCustomRugPopup(false);
    sessionStorage.setItem(STORAGE_KEY_CUSTOM_DISMISSED, 'true');
  };

  const handleGetCustomRug = () => {
    sessionStorage.setItem(STORAGE_KEY_CUSTOM_DISMISSED, 'true');
    setShowCustomRugPopup(false);
    // Direct Instagram DM link for @rugmosiac
    window.open('https://ig.me/m/rugmosiac', '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {showCustomRugPopup && (
        <div
          id="custom-rug-popup-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleDismiss();
          }}
        >
          <motion.div
            id="custom-rug-popup-modal"
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-white border border-neutral-100 rounded-2xl sm:rounded-3xl shadow-2xl p-7 sm:p-8 text-neutral-900"
          >
            {/* Close Button */}
            <button
              id="custom-rug-popup-close-btn"
              type="button"
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-black rounded-full transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="space-y-4 pt-1">
              <div className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-700 text-[10px] uppercase font-mono tracking-[0.2em] px-3 py-1 rounded-full">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Bespoke Studio Commissions</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-serif tracking-tight uppercase leading-snug text-neutral-900">
                Have a custom design you need crafted?
              </h3>

              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                We bring bespoke visions, custom shapes, and unique color palettes to life with fine hand-tufted wool. Send your dimensions, references, or artwork directly to our design studio.
              </p>

              {/* Instagram Handle Highlight */}
              <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl flex items-center justify-between">
                <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">Direct Studio DM</span>
                <span className="font-mono text-xs font-semibold tracking-wider text-black">@rugmosiac</span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  id="get-custom-rug-btn"
                  type="button"
                  onClick={handleGetCustomRug}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.22em] font-medium rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <span>Get Custom Rug</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full sm:w-auto py-2.5 px-4 text-neutral-400 hover:text-black text-[11px] uppercase tracking-wider font-mono transition-colors cursor-pointer"
                >
                  Not Now
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
