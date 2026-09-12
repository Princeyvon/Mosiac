import React from 'react';
import { useStore, getOneWordName } from '../../context/StoreContext';
import { motion } from 'motion/react';

interface ProductVariantsViewProps {
  slug: string;
}

export const ProductVariantsView: React.FC<ProductVariantsViewProps> = ({ slug }) => {
  const { products, navigateToPDP, navigateToStore } = useStore();

  const product = products.find(p => p.slug === slug);

  if (!product) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <button
          type="button"
          onClick={navigateToStore}
          className="px-5 py-2 text-xs uppercase tracking-widest border border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
        >
          Return to Catalogue
        </button>
      </div>
    );
  }

  const baseName = getOneWordName(product.name);

  // Get matching image for each color variant
  const getVariantImage = (color: typeof product.colours[0], index: number) => {
    if (color.image) return color.image;
    if (index === 0 && product.cardImage) return product.cardImage;
    if (index === 1 && product.hoverImage) return product.hoverImage;
    if (product.galleryImages && product.galleryImages[index]) return product.galleryImages[index];
    return product.cardImage;
  };

  return (
    <div className="w-full bg-white min-h-[calc(100vh-60px)] py-8 sm:py-14">
      {/* Pure, organized variants grid with seamless canvas and "Name — Color" labeling */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div
          className={`grid gap-8 sm:gap-12 items-center justify-center ${
            product.colours.length === 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'
              : product.colours.length === 3
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
              : product.colours.length >= 4
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              : 'grid-cols-1 max-w-md mx-auto'
          }`}
        >
          {product.colours.map((color, idx) => {
            const variantImg = getVariantImage(color, idx);
            return (
              <motion.div
                key={color.id || color.name}
                id={`variant-option-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigateToPDP(product.slug, color.name)}
                className="group flex flex-col items-center bg-transparent cursor-pointer select-none p-2 sm:p-4"
              >
                {/* Seamless Canvas Variant Image */}
                <div className="w-full aspect-square flex items-center justify-center p-2 sm:p-4 overflow-hidden">
                  <img
                    src={variantImg}
                    alt={`${baseName} — ${color.name}`}
                    className="w-full h-full object-contain transition-all duration-500 ease-out group-hover:scale-105"
                  />
                </div>

                {/* Variant Name & Swatch: Name — Color */}
                <div className="mt-3 text-center flex flex-col items-center gap-1.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <h3 className="text-[11px] sm:text-xs font-medium tracking-[0.2em] uppercase font-serif text-neutral-800 group-hover:text-black transition-colors">
                      {baseName} — {color.name}
                    </h3>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
