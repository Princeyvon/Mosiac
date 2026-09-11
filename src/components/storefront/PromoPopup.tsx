import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Tag, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PromoPopup: React.FC = () => {
  const {
    promoPopupConfig,
    showPromoPopup,
    setShowPromoPopup,
    applyPromoCode,
    setActiveFilter,
    navigateToStore
  } = useStore();
  const [copied, setCopied] = useState(false);

  const handleDismiss = () => {
    setShowPromoPopup(false);
    if (promoPopupConfig.discountCode) {
      sessionStorage.setItem('mosiac_promo_dismissed_' + promoPopupConfig.discountCode, 'true');
    }
  };

  const handleApplyAndShop = () => {
    if (promoPopupConfig.discountCode) {
      applyPromoCode(promoPopupConfig.discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    if (promoPopupConfig.filterTag) {
      setActiveFilter(promoPopupConfig.filterTag);
    }
    navigateToStore();
    setTimeout(() => {
      handleDismiss();
    }, 400);
  };

  if (!showPromoPopup || !promoPopupConfig.enabled) {
    return null;
  }

  const hasImage = Boolean(promoPopupConfig.imageUrl && promoPopupConfig.imageUrl.trim() !== '');

  return (
    <div
      id="promo-popup-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <motion.div
        id="promo-popup-modal"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-white border border-neutral-100 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-neutral-900"
      >
        {/* Dismiss Button */}
        <button
          id="promo-popup-close-btn"
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-neutral-100 text-neutral-600 hover:text-black rounded-full backdrop-blur-md border border-neutral-200/60 transition-colors cursor-pointer"
          aria-label="Close promotion dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Optional Image */}
        {hasImage && (
          <div className="w-full h-48 sm:h-52 overflow-hidden bg-neutral-100 relative">
            <img
              src={promoPopupConfig.imageUrl}
              alt={promoPopupConfig.headline || 'Studio promotion'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {promoPopupConfig.badgeText && (
              <div className="absolute top-3.5 left-3.5 bg-black/85 backdrop-blur-xs text-white text-[9px] uppercase tracking-[0.2em] font-mono px-2.5 py-1 rounded-full">
                {promoPopupConfig.badgeText}
              </div>
            )}
          </div>
        )}

        <div className="p-6 sm:p-7 space-y-4">
          {!hasImage && promoPopupConfig.badgeText && (
            <div className="inline-block bg-neutral-900 text-white text-[9px] uppercase tracking-[0.2em] font-mono px-3 py-1 rounded-full">
              {promoPopupConfig.badgeText}
            </div>
          )}

          {promoPopupConfig.eyebrow && (
            <div className="text-[10px] uppercase font-mono tracking-[0.24em] text-neutral-400 font-medium">
              {promoPopupConfig.eyebrow}
            </div>
          )}

          <h3 className="text-xl sm:text-2xl font-serif tracking-tight uppercase leading-snug text-neutral-900">
            {promoPopupConfig.headline || 'Private Studio Offering'}
          </h3>

          {promoPopupConfig.subtext && (
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              {promoPopupConfig.subtext}
            </p>
          )}

          {promoPopupConfig.discountCode && (
            <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200/70 rounded-xl">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono">Code:</span>
                <span className="font-mono font-semibold text-xs uppercase tracking-widest text-neutral-900">
                  {promoPopupConfig.discountCode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(promoPopupConfig.discountCode);
                  applyPromoCode(promoPopupConfig.discountCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-[10px] uppercase font-mono tracking-wider px-3 py-1 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Applied</span>
                  </>
                ) : (
                  'Copy & Apply'
                )}
              </button>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              id="promo-popup-cta-btn"
              type="button"
              onClick={handleApplyAndShop}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-black hover:bg-neutral-800 text-white text-[11px] uppercase tracking-[0.2em] font-medium rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.99]"
            >
              <span>{promoPopupConfig.buttonText || 'Shop Now'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full sm:w-auto py-2.5 px-4 text-neutral-400 hover:text-black text-[11px] uppercase tracking-wider font-mono transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
