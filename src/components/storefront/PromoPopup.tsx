import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Tag, ArrowRight, Check, Phone, User, Mail, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const PromoPopup: React.FC = () => {
  const {
    promoPopupConfig,
    showPromoPopup,
    setShowPromoPopup,
    applyPromoCode,
    setActiveFilter,
    navigateToStore,
    claimPromoDiscount
  } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [claimedCode, setClaimedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleDismiss = () => {
    setShowPromoPopup(false);
    if (promoPopupConfig.discountCode) {
      sessionStorage.setItem('mosiac_promo_dismissed_' + promoPopupConfig.discountCode, 'true');
    }
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError('Please provide your name so we can address your credit voucher.');
      return;
    }
    if (!cleanPhone && !cleanEmail) {
      setError('Please enter your phone number or email to receive your 25,000 Rwf credit.');
      return;
    }

    const codeToUse = promoPopupConfig.discountCode || 'RWF25K';
    claimPromoDiscount({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      code: codeToUse
    });

    setClaimedCode(codeToUse);
    setIsSubmitted(true);
    setError(null);
  };

  const handleProceedToShop = () => {
    if (claimedCode) {
      applyPromoCode(claimedCode);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <motion.div
        id="promo-popup-modal"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[460px] bg-white border border-neutral-200/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-neutral-900"
      >
        {/* Simple "X" in the left top corner */}
        <button
          id="promo-popup-close-btn"
          type="button"
          onClick={handleDismiss}
          className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-30 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white/95 hover:bg-white text-neutral-700 hover:text-black rounded-full backdrop-blur-md border border-neutral-200/80 shadow-xs transition-all cursor-pointer active:scale-95"
          aria-label="Close promotion dialog"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
        </button>

        {/* Optional Header Image Banner */}
        {hasImage && !isSubmitted && (
          <div className="w-full h-36 sm:h-44 overflow-hidden bg-neutral-100 relative">
            <img
              src={promoPopupConfig.imageUrl}
              alt={promoPopupConfig.headline || 'Studio welcome gift'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <span className="bg-white/95 backdrop-blur-xs text-neutral-950 text-[9px] uppercase tracking-[0.2em] font-mono px-2.5 py-1 rounded-full font-semibold shadow-xs">
                {promoPopupConfig.badgeText || 'Welcome Gift'}
              </span>
              <span className="text-white text-[10px] font-mono tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded-xs backdrop-blur-xs">
                25,000 Rwf Credit
              </span>
            </div>
          </div>
        )}

        <div className={`p-5 sm:p-7 space-y-3.5 sm:space-y-4 ${!hasImage ? 'pt-14 sm:pt-14' : ''}`}>
          {!isSubmitted ? (
            <>
              {!hasImage && (
                <div className="inline-flex items-center gap-1.5 bg-neutral-900 text-white text-[9px] uppercase tracking-[0.2em] font-mono px-3 py-1 rounded-full font-medium">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{promoPopupConfig.badgeText || 'Welcome Gift'}</span>
                </div>
              )}

              {promoPopupConfig.eyebrow && (
                <div className="text-[10px] uppercase font-mono tracking-[0.22em] text-neutral-500 font-semibold">
                  {promoPopupConfig.eyebrow}
                </div>
              )}

              <div>
                <h3 className="text-base sm:text-xl md:text-2xl font-serif tracking-tight uppercase leading-tight sm:leading-snug text-neutral-950 font-normal sm:font-medium">
                  {promoPopupConfig.headline || 'Enjoy 25,000 Rwf Free Credit on Your First Order'}
                </h3>
                {promoPopupConfig.subtext &&
                  !promoPopupConfig.subtext.toLowerCase().includes('receive a complimentary 25,000 rwf') &&
                  !promoPopupConfig.subtext.toLowerCase().includes('complimentary 25,000 rwf studio credit applied directly') &&
                  !promoPopupConfig.subtext.toLowerCase().includes('enter your contact details') && (
                    <p className="text-xs text-neutral-600 font-light leading-relaxed mt-1">
                      {promoPopupConfig.subtext}
                    </p>
                )}
              </div>

              {/* Contact Capture Form */}
              <form onSubmit={handleSubmitClaim} className="space-y-3 pt-0.5">
                {error && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="lead-name-input"
                    className="block text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-semibold mb-1"
                  >
                    Your Name <span className="text-neutral-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="lead-name-input"
                      type="text"
                      required
                      placeholder="e.g. Amina Uwase"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="lead-phone-input"
                      className="block text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-semibold mb-1"
                    >
                      Phone / WhatsApp <span className="text-neutral-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="lead-phone-input"
                        type="tel"
                        required
                        placeholder="+250 788 123 456"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (error) setError(null);
                        }}
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-mono placeholder:font-sans placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="lead-email-input"
                      className="block text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-semibold mb-1"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="lead-email-input"
                        type="email"
                        placeholder="amina@design.rw"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError(null);
                        }}
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-400 font-light leading-normal">
                  We respect your privacy. Your contact will only be used to send your credit voucher and order updates.
                </p>

                <div className="pt-1.5">
                  <button
                    id="promo-popup-claim-btn"
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-neutral-950 hover:bg-neutral-800 active:bg-black text-white text-[11px] uppercase tracking-[0.2em] font-medium rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                  >
                    <span>{promoPopupConfig.buttonText || 'Claim 25,000 Rwf Credit'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Claim Success Confirmation View */
            <div className="py-2 space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <Check className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase font-mono tracking-[0.22em] text-emerald-600 font-semibold">
                  Credit Activated
                </div>
                <h3 className="text-lg sm:text-xl font-serif uppercase tracking-tight text-neutral-950">
                  Welcome to Mosiac, {name || 'Collector'}!
                </h3>
                <p className="text-xs text-neutral-600 font-light max-w-sm mx-auto">
                  Your <strong className="font-semibold text-neutral-900">25,000 Rwf free credit</strong> has been unlocked and automatically applied to your cart.
                </p>
              </div>

              {/* Promo Code Box */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl max-w-xs mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2 text-left">
                  <Tag className="w-4 h-4 text-neutral-500" />
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-neutral-400 font-mono">Voucher Code</div>
                    <div className="font-mono font-bold text-xs tracking-widest text-neutral-900">{claimedCode}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(claimedCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-black text-white text-[10px] uppercase font-mono tracking-wider rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    'Copy'
                  )}
                </button>
              </div>

              <div className="pt-2">
                <button
                  id="promo-popup-shop-now-btn"
                  type="button"
                  onClick={handleProceedToShop}
                  className="w-full py-3 px-5 bg-black hover:bg-neutral-800 text-white text-[11px] uppercase tracking-[0.2em] font-medium rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Explore Collection &amp; Use Credit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
