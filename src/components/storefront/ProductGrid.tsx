import React, { useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { motion } from 'motion/react';
import { Product } from '../../types';

export const ProductGrid: React.FC = () => {
  const { products, navigateToPDP, navigateToVariants, gridDensity } = useStore();

  // Only display products marked as visible in the catalogue
  const visibleProducts = useMemo(() => {
    return products.filter(p => p.visible !== false);
  }, [products]);

  const handleProductClick = (product: Product) => {
    // If product has multiple color variants, take user to the organized variants view first
    if (product.colours && product.colours.length > 1) {
      navigateToVariants(product.slug);
    } else {
      navigateToPDP(product.slug, product.colours?.[0]?.name);
    }
  };

  return (
    <div className="w-full bg-white min-h-[calc(100vh-60px)]">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-6 py-6 sm:py-8">
        {/* Responsive Grid: 8 on desktop (2 on mobile) vs 4 on desktop (1 on mobile) */}
        <div
          className={`grid gap-x-3 sm:gap-x-4 md:gap-x-6 gap-y-6 sm:gap-y-8 ${
            gridDensity === 'dense'
              ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }`}
        >
          {visibleProducts.map(product => {
            const hasVariants = product.colours && product.colours.length > 1;
            return (
              <motion.div
                key={product.id}
                id={`product-item-${product.slug}`}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleProductClick(product)}
                className="group flex flex-col items-center cursor-pointer select-none"
              >
                {/* Product Image: Clean presentation without cards */}
                <div className="w-full aspect-square bg-[#fafafa] flex items-center justify-center p-3 sm:p-4 md:p-6 transition-colors group-hover:bg-[#f3f3f3] overflow-hidden">
                  <img
                    src={product.cardImage}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>

                {/* Stylish Name Formatting */}
                <div className="mt-2.5 sm:mt-3 px-1 text-center w-full">
                  <h2 className="text-[10px] sm:text-[11px] font-medium tracking-[0.2em] uppercase font-serif text-neutral-800 group-hover:text-black transition-colors line-clamp-2 leading-relaxed">
                    {product.name}
                  </h2>
                  {hasVariants && (
                    <span className="text-[9px] uppercase tracking-[0.22em] text-neutral-400 font-sans mt-0.5 block">
                      {product.colours.length} Colorways
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


