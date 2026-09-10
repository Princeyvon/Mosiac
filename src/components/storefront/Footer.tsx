import React from 'react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { navigateToDash, navigateToStore, setActiveModal } = useStore();

  return (
    <footer className="w-full bg-white border-t border-black/[0.08] py-16 md:py-24 px-4 text-center select-none">
      <div className="max-w-[1200px] mx-auto space-y-12">
        {/* Centered large logo/wordmark */}
        <div>
          <button
            type="button"
            onClick={navigateToStore}
            className="text-4xl md:text-6xl font-light uppercase tracking-[0.45em] text-black hover:opacity-75 transition-opacity inline-block"
          >
            F O R M A
          </button>
          <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-light">
            Architectural Objects & Sculptural Furniture
          </p>
        </div>

        {/* Row of utility links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.2em] font-normal text-neutral-600">
          <button
            type="button"
            onClick={() => setActiveModal('faq')}
            className="hover:text-black transition-colors"
          >
            FAQ
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('policies')}
            className="hover:text-black transition-colors"
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('policies')}
            className="hover:text-black transition-colors"
          >
            Returns Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('policies')}
            className="hover:text-black transition-colors"
          >
            Terms & Conditions
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('policies')}
            className="hover:text-black transition-colors"
          >
            Accessibility Statement
          </button>
          {/* Dash: Visually the same weight as the other links, not called out as special */}
          <button
            id="dash-footer-link"
            type="button"
            onClick={() => navigateToDash()}
            className="hover:text-black transition-colors"
          >
            Dash
          </button>
        </div>

        <div className="text-[10px] text-neutral-400 tracking-wider">
          © {new Date().getFullYear()} FORMA STUDIO. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
};
