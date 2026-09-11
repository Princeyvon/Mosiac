import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CurrencySelector } from './CurrencySelector';
import { ShoppingBag, LayoutGrid, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export const StickyHeader: React.FC = () => {
  const {
    currentView,
    currentProductSlug,
    selectedColorVariant,
    navigateToStore,
    navigateToVariants,
    navigateToCart,
    cartCount,
    gridDensity,
    toggleGridDensity,
    storefrontFilters,
    showStorefrontFilters,
    activeFilter,
    setActiveFilter,
  } = useStore();

  const handleBack = () => {
    if (currentView === 'pdp' && selectedColorVariant && currentProductSlug) {
      navigateToVariants(currentProductSlug);
    } else {
      navigateToStore();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/[0.04] transition-all">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-8 h-13 sm:h-14 flex items-center justify-between gap-2 sm:gap-3">
        {/* Top Left: View Switcher (or Context-Aware Single Back button) - visible on all screens */}
        <div className="flex items-center min-w-fit sm:min-w-[100px]">
          {currentView === 'store' ? (
            <button
              id="grid-density-toggle-btn"
              type="button"
              onClick={toggleGridDensity}
              className="flex items-center justify-center w-8 h-8 rounded-sm bg-black text-white hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer focus:outline-none"
              title={gridDensity === 'dense' ? 'Switch to 4 per row' : 'Switch to 6 per row'}
              aria-label="Toggle grid columns"
            >
              <LayoutGrid className="w-4 h-4 text-white stroke-[2.2]" />
            </button>
          ) : (
            <button
              id="single-back-btn"
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.2em] font-semibold text-black hover:opacity-60 transition-opacity cursor-pointer py-1"
              aria-label="Go back"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Center: Dynamic Storefront Filters - Hidden on mobile screen & controllable via Studio Dashboard */}
        {showStorefrontFilters && (
          <div className="hidden md:flex flex-1 items-center justify-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            {storefrontFilters.map((f) => {
              const isActive = activeFilter === f.slug;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setActiveFilter(f.slug);
                    if (currentView !== 'store') navigateToStore();
                  }}
                  className={`px-2.5 sm:px-3.5 py-1 text-[10px] sm:text-[11px] tracking-[0.18em] uppercase transition-all whitespace-nowrap cursor-pointer rounded-sm ${
                    isActive
                      ? 'bg-black text-white font-semibold'
                      : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Top Right: Currency Switcher & Cart on Mobile; Mosiac Brand only on Tablet/Desktop */}
        <div className="flex items-center gap-2.5 sm:gap-5 min-w-fit sm:min-w-[100px] justify-end">
          {/* Currency Switcher */}
          <CurrencySelector />

          {/* Cart Button */}
          <motion.button
            id="header-cart-btn"
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={navigateToCart}
            className="flex items-center gap-1 text-neutral-900 hover:text-black transition-colors cursor-pointer p-1"
            aria-label={`Open shopping cart with ${cartCount} items`}
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
            <span className="text-xs font-mono font-medium">{cartCount}</span>
          </motion.button>

          {/* Mosiac brand text - Hidden on mobile screens as requested */}
          <button
            id="brand-logo-btn"
            type="button"
            onClick={navigateToStore}
            className="hidden sm:block text-xs sm:text-[13px] font-bold tracking-[0.32em] uppercase hover:opacity-60 transition-opacity focus:outline-none cursor-pointer text-neutral-900 ml-1"
          >
            Mosiac
          </button>
        </div>
      </div>
    </header>
  );
};


