import React from 'react';
import { useStore } from '../../context/StoreContext';
import { LayoutDashboard, Receipt } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateToDash, navigateToStore, navigateToPolicies, navigateToReceipt, orders } = useStore();

  const handleOpenReceipt = () => {
    const targetOrderId = orders[0]?.id || 'ORD-9021';
    navigateToReceipt(targetOrderId);
  };

  return (
    <footer className="w-full bg-white border-t border-black/[0.05] py-4 sm:py-6 px-4 sm:px-8 select-none">
      <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-mono">
        {/* Brand name */}
        <button
          type="button"
          onClick={navigateToStore}
          className="hover:text-black transition-colors font-semibold text-neutral-800 tracking-[0.3em] cursor-pointer py-1"
        >
          Mosiac
        </button>

        {/* Links formatted responsively for mobile and desktop */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-neutral-500">
          <button
            type="button"
            onClick={handleOpenReceipt}
            className="inline-flex items-center gap-1 hover:text-black transition-colors cursor-pointer py-1 text-neutral-600"
            title="View sample client receipt"
          >
            <Receipt className="w-3.5 h-3.5 text-neutral-500" />
            <span>Client Receipt & Pass</span>
          </button>

          <span className="text-neutral-300 select-none" aria-hidden="true">/</span>

          <button
            type="button"
            onClick={navigateToPolicies}
            className="hover:text-black transition-colors cursor-pointer py-1"
          >
            <span className="sm:hidden">Terms & Policies</span>
            <span className="hidden sm:inline">Terms, Conditions & Policies</span>
          </button>

          <span className="text-neutral-300 select-none" aria-hidden="true">/</span>

          <button
            id="footer-studio-dash-btn"
            type="button"
            onClick={() => navigateToDash()}
            className="inline-flex items-center gap-1.5 hover:text-black transition-colors cursor-pointer text-neutral-700 font-medium py-1"
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


