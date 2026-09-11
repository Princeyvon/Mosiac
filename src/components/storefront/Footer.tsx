import React from 'react';
import { useStore } from '../../context/StoreContext';
import { LayoutDashboard } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateToDash, navigateToStore, navigateToPolicies } = useStore();

  return (
    <footer className="w-full bg-white border-t border-black/[0.05] py-5 sm:py-6 px-4 sm:px-8 select-none">
      <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-mono">
        <button
          type="button"
          onClick={navigateToStore}
          className="hover:text-black transition-colors font-semibold text-neutral-800 tracking-[0.3em] cursor-pointer"
        >
          Mosiac
        </button>

        <div className="flex items-center gap-4 sm:gap-7 text-neutral-500">
          <button
            type="button"
            onClick={navigateToPolicies}
            className="hover:text-black transition-colors cursor-pointer"
          >
            Terms, Conditions & Policies
          </button>

          <span className="text-neutral-300" aria-hidden="true">/</span>

          <button
            id="footer-studio-dash-btn"
            type="button"
            onClick={() => navigateToDash()}
            className="inline-flex items-center gap-1.5 hover:text-black transition-colors cursor-pointer text-neutral-700 font-medium"
            title="Open Studio Catalogue Dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-neutral-500" />
            <span>Studio Dash</span>
          </button>
        </div>
      </div>
    </footer>
  );
};


