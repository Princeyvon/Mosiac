import React from 'react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { navigateToDash, navigateToStore } = useStore();

  return (
    <footer className="w-full bg-white border-t border-black/[0.06] py-4 px-6 select-none">
      <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-mono">
        <button
          type="button"
          onClick={navigateToStore}
          className="hover:text-black transition-colors font-medium text-neutral-600 tracking-[0.3em] cursor-pointer"
        >
          Forma
        </button>

        <div className="flex items-center gap-4 text-neutral-500">
          <span>© {new Date().getFullYear()} FORMA</span>
          <span>·</span>
          <button
            type="button"
            onClick={() => navigateToDash()}
            className="hover:text-black transition-colors cursor-pointer"
          >
            Dash
          </button>
        </div>
      </div>
    </footer>
  );
};

