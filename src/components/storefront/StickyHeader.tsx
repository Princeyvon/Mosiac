import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CurrencySelector } from './CurrencySelector';
import { ShoppingBag, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';

export const StickyHeader: React.FC = () => {
  const {
    navigateToStore,
    navigateToDash,
    cartCount,
    setCartOpen,
  } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-black/[0.05] transition-all">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-8 h-12 sm:h-14 flex items-center justify-end gap-4 sm:gap-6">
        {/* Forma brand text in top right corner */}
        <motion.button
          id="brand-logo-btn"
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={navigateToStore}
          className="text-xs sm:text-[13px] font-bold tracking-[0.3em] uppercase hover:opacity-70 transition-opacity focus:outline-none cursor-pointer text-neutral-900"
        >
          Forma
        </motion.button>

        <div className="h-3 w-px bg-neutral-200" aria-hidden="true" />

        {/* Currency Switcher */}
        <CurrencySelector />

        {/* Studio Dash Button */}
        <motion.button
          id="header-dash-btn"
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateToDash()}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-medium text-neutral-700 hover:text-black border border-neutral-200 hover:border-black rounded-full transition-all bg-neutral-50 hover:bg-neutral-100 cursor-pointer"
          title="Open Studio Catalogue Dashboard"
        >
          <LayoutDashboard className="w-3 h-3 text-neutral-500" />
          <span className="hidden sm:inline">Studio Dash</span>
          <span className="sm:hidden">Dash</span>
        </motion.button>

        {/* Cart Icon & Count */}
        <motion.button
          id="header-cart-btn"
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => setCartOpen(true)}
          className="relative p-1 text-black hover:opacity-60 transition-opacity flex items-center gap-1 focus:outline-none cursor-pointer"
          aria-label={`View cart, ${cartCount} items`}
        >
          <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
          <span className="text-[11px] font-mono tracking-tight font-medium">
            [{cartCount}]
          </span>
        </motion.button>
      </div>
    </header>
  );
};

