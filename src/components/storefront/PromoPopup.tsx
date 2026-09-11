import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Tag, ArrowRight, Check } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <div
        id="promo-popup-modal"
        className="relative w-full max-w-lg bg-white border border-neutral-200 rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-neutral-900"
      >
        {/* Dismiss Button */}
        <button
          id="promo-popup-close-btn"
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 hover:bg-black hover:text-white text-neutral-600 rounded-sm border border-neutral-200 transition-colors cursor-pointer"
          aria-label="Close promotion dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Optional Image */}
        {hasImage && (
          <div className="w-full h-52 sm:h-60 overflow-hidden bg-neutral-100 relative">
            <img
              src={promoPopupConfig.imageUrl}
              alt={promoPopupConfig.headline || 'Studio promotion'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {promoPopupConfig.badgeText && (
              <div className="absolute top-3 left-3 bg-black text-white text-[9px] uppercase tracking-[0.25em] font-mono px-2.5 py-1 rounded-sm">
                {promoPopupConfig.badgeText}
              </div>
            )}
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-4">
          {!hasImage && promoPopupConfig.badgeText && (
            <div className="inline-block bg-black text-white text-[9px] uppercase tracking-[0.25em] font-mono px-2.5 py-1 rounded-sm">
              {promoPopupConfig.badgeText}
            </div>
          )}

          {promoPopupConfig.eyebrow && (
            <div className="text-[10px] uppercase font-mono tracking-[0.22em] text-neutral-500">
              {promoPopupConfig.eyebrow}
            </div>
          )}

          <h3 className="text-xl sm:text-2xl font-serif tracking-tight uppercase leading-snug text-neutral-900">
            {promoPopupConfig.headline || 'Private Studio Offering'}
          </h3>

          {promoPopupConfig.subtext && (
            <p className="text-xs text-neutral-600 font-light leading-relaxed">
              {promoPopupConfig.subtext}
            </p>
          )}

          {promoPopupConfig.discountCode && (
            <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-sm">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-neutral-500" />
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">Code:</span>
                <span className="font-mono font-bold text-xs uppercase tracking-widest text-neutral-900">
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
                className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 bg-black text-white rounded-sm hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                {copied ? 'Applied!' : 'Copy & Apply'}
              </button>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              id="promo-popup-cta-btn"
              type="button"
              onClick={handleApplyAndShop}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em] font-medium rounded-sm transition-colors cursor-pointer"
            >
              <span>{promoPopupConfig.buttonText || 'Shop Now'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full sm:w-auto py-2.5 px-4 text-neutral-500 hover:text-black text-[11px] uppercase tracking-wider font-mono transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
