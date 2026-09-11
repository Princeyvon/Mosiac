import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductVariantsViewProps {
  slug: string;
}

export const ProductVariantsView: React.FC<ProductVariantsViewProps> = ({ slug }) => {
  const { products, navigateToPDP, navigateToStore, formatPrice } = useStore();

  const product = products.find(p => p.slug === slug);

  if (!product) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm font-light text-neutral-500 uppercase tracking-widest mb-4">Product Not Found</p>
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

  // Get matching image for each color variant
  const getVariantImage = (index: number) => {
    if (index === 0 && product.cardImage) return product.cardImage;
    if (index === 1 && product.hoverImage) return product.hoverImage;
    if (product.galleryImages && product.galleryImages[index]) return product.galleryImages[index];
    return product.cardImage;
  };

  return (
    <div className="w-full bg-white min-h-[calc(100vh-60px)] pb-20">
      {/* Top Navigation */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-5">
        <button
          type="button"
          onClick={navigateToStore}
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-400 hover:text-black transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalogue</span>
        </button>
      </div>

      {/* Header Section */}
      <div className="max-w-3xl mx-auto px-4 text-center mt-2 mb-10 sm:mb-14">
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-mono block mb-2">
          {product.collection} · {product.shape}
        </span>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-normal uppercase tracking-[0.16em] text-neutral-900">
          {product.name}
        </h1>
        <p className="mt-3 text-[13px] text-neutral-500 font-light max-w-lg mx-auto">
          Please select your preferred colorway edition to view full dimension specifications and atelier availability.
        </p>
      </div>

      {/* Well arranged & organized variants grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className={`grid gap-6 sm:gap-10 ${
          product.colours.length === 2
            ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'
            : product.colours.length >= 3
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 max-w-md mx-auto'
        }`}>
          {product.colours.map((color, idx) => {
            const variantImg = getVariantImage(idx);
            return (
              <motion.div
                key={color.id || color.name}
                id={`variant-option-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigateToPDP(product.slug, color.name)}
                className="group flex flex-col items-center bg-[#fafafa] hover:bg-[#f4f4f4] transition-colors p-6 sm:p-8 rounded-xl cursor-pointer text-center border border-neutral-100 hover:border-neutral-300"
              >
                {/* Variant Image */}
                <div className="w-full aspect-square flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                  <img
                    src={variantImg}
                    alt={`${product.name} in ${color.name}`}
                    className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>

                {/* Color Swatch Dot & Colorway Name */}
                <div className="mt-6 flex items-center justify-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                  <h3 className="text-xs sm:text-[13px] font-medium uppercase tracking-[0.2em] text-neutral-900">
                    {color.name}
                  </h3>
                </div>

                <div className="mt-2 text-[11px] text-neutral-400 font-mono">
                  From {formatPrice(product.fromPrice)}
                </div>

                <div className="mt-5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] font-medium text-neutral-700 group-hover:text-black transition-colors pt-2 border-t border-black/[0.06] w-full justify-center">
                  <span>Explore Edition</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
