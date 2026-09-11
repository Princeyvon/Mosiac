import React, { useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { motion } from 'motion/react';

export const ProductGrid: React.FC = () => {
  const { products, navigateToPDP } = useStore();

  // Only display products marked as visible in the catalogue
  const visibleProducts = useMemo(() => {
    return products.filter(p => p.visible !== false);
  }, [products]);

  return (
    <main className="w-full bg-white min-h-[calc(100vh-60px)]">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-8 md:p-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
          {visibleProducts.map(product => {
            return (
              <motion.article
                key={product.id}
                id={`product-card-${product.slug}`}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigateToPDP(product.slug)}
                className="group flex flex-col items-center cursor-pointer select-none"
              >
                {/* Product Canvas Image */}
                <div className="w-full aspect-square bg-[#f9f9f9] overflow-hidden flex items-center justify-center p-8 sm:p-12 transition-colors group-hover:bg-[#f3f3f3]">
                  <img
                    src={product.cardImage}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>

                {/* Only Product Name Below */}
                <h2 className="mt-3.5 text-xs sm:text-[13px] font-medium tracking-[0.2em] uppercase text-neutral-900 text-center group-hover:text-neutral-500 transition-colors">
                  {product.name}
                </h2>
              </motion.article>
            );
          })}
        </div>
      </div>
    </main>
  );
};

