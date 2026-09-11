import React from 'react';
import { useStore } from '../../context/StoreContext';
import { LayoutDashboard } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateToDash, navigateToStore, navigateToPolicies } = useStore();

  return (
    <footer className="w-full bg-white border-t border-black/[0.05] py-2.5 px-4 sm:px-8 select-none">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-neutral-400 font-mono">
        <button
          type="button"
          onClick={navigateToStore}
          className="hover:text-black transition-colors font-medium text-neutral-700 tracking-[0.25em] cursor-pointer"
        >
          FORMA
        </button>

        <div className="flex items-center gap-3 sm:gap-6 text-neutral-400">
          <button
            type="button"
            onClick={navigateToPolicies}
            className="hover:text-black transition-colors cursor-pointer underline-offset-2 hover:underline"
          >
            Terms & Conditions
          </button>

          <span className="text-neutral-300">·</span>

          <button
            type="button"
            onClick={() => navigateToDash()}
            className="inline-flex items-center gap-1.5 hover:text-black transition-colors cursor-pointer text-neutral-600"
            title="Open Studio Catalogue Dashboard"
          >
            <LayoutDashboard className="w-3 h-3 text-neutral-400" />
            <span>Studio Dash</span>
          </button>
        </div>
      </div>
    </footer>
  );
};


