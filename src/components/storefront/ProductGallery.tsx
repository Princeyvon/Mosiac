import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeImages = images && images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=85'
  ];
  const count = safeImages.length;

  // Infinite scroll handlers
  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + count) % count);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % count);
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Actual image only viewport */}
      <div className="relative w-full aspect-square max-w-[420px] sm:max-w-[480px] bg-transparent flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={safeImages[activeIndex]}
            src={safeImages[activeIndex]}
            alt={`${productName} view ${activeIndex + 1}`}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.4 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-contain pointer-events-none"
            loading="eager"
          />
        </AnimatePresence>

        {/* Subtle navigation arrows for infinite scroll */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-1 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 hover:bg-white text-neutral-700 hover:text-black shadow-xs transition-all opacity-80 hover:opacity-100 cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 hover:bg-white text-neutral-700 hover:text-black shadow-xs transition-all opacity-80 hover:opacity-100 cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Scrolling dots indicator */}
      {count > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {safeImages.map((_, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'w-5 h-1.5 bg-black rounded-full'
                    : 'w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-500 rounded-full'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
