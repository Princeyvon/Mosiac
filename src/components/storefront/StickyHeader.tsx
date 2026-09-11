import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CurrencySelector } from './CurrencySelector';
import { ShoppingBag, LayoutGrid, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export const StickyHeader: React.FC = () => {
  const {
    currentView,
    navigateToStore,
    navigateToCart,
    cartCount,
    gridDensity,
    toggleGridDensity,
  } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-black/[0.06] transition-all">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 h-12 sm:h-14 flex items-center justify-between">
        {/* Top Left: View Switcher (or Back to Shop if on sub-page) */}
        <div className="flex items-center gap-3">
          {currentView === 'store' ? (
            <button
              id="grid-density-toggle-btn"
              type="button"
              onClick={toggleGridDensity}
              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-neutral-200 hover:border-black text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-neutral-700 hover:text-black transition-all bg-white cursor-pointer"
              title={
                gridDensity === 'dense'
                  ? 'Switch to 4 per row (1 on mobile)'
                  : 'Switch to 8 per row (2 on mobile)'
              }
            >
              <LayoutGrid className="w-3.5 h-3.5 text-neutral-500" />
              {/* Desktop label */}
              <span className="hidden sm:inline">
                {gridDensity === 'dense' ? '8 / Row (Switch to 4)' : '4 / Row (Switch to 8)'}
              </span>
              {/* Mobile label */}
              <span className="sm:hidden">
                {gridDensity === 'dense' ? '2 / Row (Switch 1)' : '1 / Row (Switch 2)'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={navigateToStore}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500 hover:text-black transition-colors cursor-pointer py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Top Right: Currency Switcher, Cart, FORMA Brand */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Currency Switcher */}
          <CurrencySelector />

          {/* Redesigned Cart Button (opens full page cart checkout) */}
          <motion.button
            id="header-cart-btn"
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={navigateToCart}
            className="flex items-center gap-1.5 text-neutral-900 hover:text-black transition-colors cursor-pointer p-1"
            aria-label={`Open shopping cart with ${cartCount} items`}
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.6]" />
            <span className="text-xs font-mono font-medium">{cartCount}</span>
          </motion.button>

          <div className="h-3 w-px bg-neutral-200" aria-hidden="true" />

          {/* FORMA brand text in top right */}
          <button
            id="brand-logo-btn"
            type="button"
            onClick={navigateToStore}
            className="text-xs sm:text-[13px] font-bold tracking-[0.35em] uppercase hover:opacity-60 transition-opacity focus:outline-none cursor-pointer text-neutral-900"
          >
            FORMA
          </button>
        </div>
      </div>
    </header>
  );
};


