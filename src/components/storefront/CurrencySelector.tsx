import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { CURRENCIES } from '../../data/initialProducts';
import { Currency } from '../../types';
import { ChevronDown, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCurrencies = CURRENCIES.filter(
    c =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popular = filteredCurrencies.filter(c => c.popular);
  const other = filteredCurrencies.filter(c => !c.popular);

  const handleSelect = (c: Currency) => {
    setCurrency(c);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="currency-selector-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-[11px] uppercase tracking-widest font-normal text-black hover:opacity-60 transition-opacity py-1 px-1.5 focus:outline-none cursor-pointer"
        aria-expanded={isOpen}
      >
        <span>{currency.symbol} {currency.code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="currency-dropdown"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-64 bg-white border border-black/10 shadow-xl z-50 text-black"
          >
            {/* Search box */}
            <div className="p-2 border-b border-black/10 flex items-center gap-2 bg-neutral-50">
              <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <input
                type="text"
                placeholder="Search currency..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-[11px] tracking-wide placeholder:text-neutral-400 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="max-h-72 overflow-y-auto py-1 divide-y divide-black/5 text-[11px]">
              {/* Popular Section */}
              {popular.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1 text-[9px] uppercase tracking-widest text-neutral-400 font-semibold">
                    Popular
                  </div>
                  {popular.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelect(c)}
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 font-mono text-[10px] text-neutral-500">{c.symbol}</span>
                        <span className="tracking-wider">{c.code}</span>
                        <span className="text-[10px] text-neutral-400 truncate max-w-[100px]">{c.name}</span>
                      </div>
                      {currency.code === c.code && <Check className="w-3.5 h-3.5 text-black" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Other Section */}
              {other.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1 text-[9px] uppercase tracking-widest text-neutral-400 font-semibold">
                    Other Currencies
                  </div>
                  {other.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelect(c)}
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 font-mono text-[10px] text-neutral-500">{c.symbol}</span>
                        <span className="tracking-wider">{c.code}</span>
                        <span className="text-[10px] text-neutral-400 truncate max-w-[100px]">{c.name}</span>
                      </div>
                      {currency.code === c.code && <Check className="w-3.5 h-3.5 text-black" />}
                    </button>
                  ))}
                </div>
              )}

              {filteredCurrencies.length === 0 && (
                <div className="px-3 py-4 text-center text-neutral-400 text-[10px]">
                  No matching currency found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
