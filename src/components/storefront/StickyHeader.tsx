import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CurrencySelector } from './CurrencySelector';
import { ShoppingBag, Instagram, LayoutDashboard, Menu, X } from 'lucide-react';

export const StickyHeader: React.FC = () => {
  const {
    navigateToStore,
    navigateToDash,
    cartCount,
    setCartOpen,
    setActiveModal
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-black/[0.06] transition-all">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
        {/* Left: Brand wordmark & desktop navigation */}
        <div className="flex items-center gap-8">
          <button
            id="brand-logo-btn"
            type="button"
            onClick={navigateToStore}
            className="text-[14px] font-bold tracking-[0.3em] uppercase hover:opacity-70 transition-opacity focus:outline-none"
          >
            FORMA
          </button>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-[0.18em] font-normal text-neutral-800">
            <button
              type="button"
              onClick={navigateToStore}
              className="hover:text-black transition-colors"
            >
              Shop
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('contact')}
              className="hover:text-black transition-colors"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('policies')}
              className="hover:text-black transition-colors"
            >
              Policies
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('journal')}
              className="hover:text-black transition-colors"
            >
              Journal
            </button>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-black transition-colors p-1"
              aria-label="Instagram"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
          </nav>
        </div>

        {/* Right: Currency Selector + Studio Dash shortcut + Cart icon + Mobile Menu Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          <CurrencySelector />

          {/* Studio Portal Quick Link */}
          <button
            id="header-dash-btn"
            type="button"
            onClick={() => navigateToDash()}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-700 hover:text-black border border-neutral-300 hover:border-black rounded-full transition-all bg-neutral-50/50 hover:bg-neutral-100"
            title="Open Studio Catalogue Dashboard"
          >
            <LayoutDashboard className="w-3 h-3 text-neutral-500" />
            <span className="hidden sm:inline">Studio Dash</span>
            <span className="sm:hidden">Dash</span>
          </button>

          {/* Cart Icon */}
          <button
            id="header-cart-btn"
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative p-1.5 text-black hover:opacity-60 transition-opacity flex items-center gap-1.5 focus:outline-none"
            aria-label={`View cart, ${cartCount} items`}
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.4]" />
            <span className="text-[11px] font-mono tracking-tight font-medium">
              [{cartCount}]
            </span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-neutral-700 hover:text-black focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-6 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 text-[11px] uppercase tracking-[0.2em]">
          <button
            type="button"
            onClick={() => {
              navigateToStore();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1.5 text-neutral-800 hover:text-black"
          >
            Shop Catalogue
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveModal('contact');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1.5 text-neutral-800 hover:text-black"
          >
            Contact
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveModal('policies');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1.5 text-neutral-800 hover:text-black"
          >
            Studio Policies & Returns
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveModal('journal');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1.5 text-neutral-800 hover:text-black"
          >
            Journal / Process
          </button>
          <button
            type="button"
            onClick={() => {
              navigateToDash();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-1.5 text-neutral-900 font-semibold border-t border-neutral-100 pt-3"
          >
            Studio Dashboard ↗
          </button>
        </div>
      )}
    </header>
  );
};
