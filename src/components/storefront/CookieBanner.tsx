import React from 'react';
import { useStore } from '../../context/StoreContext';

export const CookieBanner: React.FC = () => {
  const { cookieConsent, setCookieConsent } = useStore();

  if (cookieConsent !== null) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-black/10 shadow-lg px-4 py-3 md:px-8">
      <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[11px] text-neutral-700 tracking-wide font-light text-center sm:text-left">
          We use cookies to ensure you get the best experience on our website.
        </p>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="cookie-reject-btn"
            type="button"
            onClick={() => setCookieConsent('rejected')}
            className="text-[10px] uppercase tracking-[0.2em] px-4 py-2 border border-neutral-300 hover:border-black transition-colors text-black font-medium"
          >
            Reject All
          </button>
          <button
            id="cookie-accept-btn"
            type="button"
            onClick={() => setCookieConsent('accepted')}
            className="text-[10px] uppercase tracking-[0.2em] px-4 py-2 bg-black text-white hover:bg-neutral-800 transition-colors font-medium"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};
