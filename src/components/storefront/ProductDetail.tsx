import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductGallery } from './ProductGallery';
import { ArrowLeft, Check, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailProps {
  slug: string;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ slug }) => {
  const {
    products,
    navigateToStore,
    navigateToVariants,
    addToCart,
    formatPrice,
    selectedColorVariant
  } = useStore();

  const product = products.find(p => p.slug === slug) || products[0];

  // Active color chosen from variants view (or first colorway)
  const activeColorName = selectedColorVariant || product.colours?.[0]?.name || 'Standard Edition';

  const defaultSizeId = product.sizes?.[0]?.id || 's1';
  const [selectedSizeId, setSelectedSizeId] = useState<string>(defaultSizeId);

  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const [showSizeModal, setShowSizeModal] = useState<boolean>(false);

  const selectedSize = product.sizes?.find(s => s.id === selectedSizeId) || product.sizes?.[0];
  const activePrice = selectedSize ? selectedSize.price : product.fromPrice;
  const isSoldOut = product.availability === 'Sold out';

  // Find images matching the active color if available
  const activeImages = React.useMemo(() => {
    if (!product.galleryImages || product.galleryImages.length === 0) {
      return [product.cardImage];
    }
    // If ivory/cognac or secondary color, lead with hoverImage
    if (activeColorName.toLowerCase().includes('ivory') && product.hoverImage) {
      return [product.hoverImage, ...product.galleryImages.filter(img => img !== product.hoverImage)];
    }
    return product.galleryImages;
  }, [product, activeColorName]);

  // Close sizing modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSizeModal(false);
      }
    };
    if (showSizeModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSizeModal]);

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart(product.id, selectedSize?.id || 'default', activeColorName, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const hasMultipleVariants = product.colours && product.colours.length > 1;

  return (
    <div className="w-full bg-white text-black min-h-[calc(100vh-60px)] pb-20">
      {/* Top Navigation */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={hasMultipleVariants ? () => navigateToVariants(product.slug) : navigateToStore}
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-400 hover:text-black transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{hasMultipleVariants ? 'Back to Colorways' : 'Back to Catalogue'}</span>
        </button>

        {hasMultipleVariants && (
          <button
            type="button"
            onClick={() => navigateToVariants(product.slug)}
            className="text-[10px] uppercase tracking-[0.18em] text-neutral-400 hover:text-black transition-colors cursor-pointer"
          >
            Edition: <span className="font-medium text-neutral-800 underline underline-offset-4">{activeColorName}</span>
          </button>
        )}
      </div>

      {/* Centered Product Detail Layout */}
      <div className="max-w-xl mx-auto px-4 flex flex-col items-center text-center mt-2">
        {/* Carousel at Top Center (Pure image only + infinite scroll dots) */}
        <div className="w-full max-w-md sm:max-w-lg">
          <ProductGallery
            images={activeImages}
            productName={product.name}
          />
        </div>

        {/* Directly at the bottom of the carousel */}
        <div className="w-full flex flex-col items-center mt-6 space-y-3.5">
          {/* Product Name (stylish serif font) */}
          <h1 className="text-base sm:text-lg md:text-xl font-serif font-normal uppercase tracking-[0.2em] text-neutral-900 leading-snug">
            {product.name}
          </h1>

          {/* Price */}
          <div className="text-base sm:text-lg font-mono font-medium text-neutral-900 tracking-tight">
            {formatPrice(activePrice)}
          </div>

          {/* Sizing: Simple, well-designed button opening dismissable popup */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="pt-1">
              <button
                id="sizing-modal-trigger-btn"
                type="button"
                onClick={() => setShowSizeModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 hover:border-black text-[11px] uppercase tracking-[0.16em] text-neutral-700 hover:text-black bg-neutral-50 hover:bg-white transition-all cursor-pointer shadow-2xs"
              >
                <span>Size: {selectedSize?.label} ({selectedSize?.width} × {selectedSize?.depth} cm)</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>
            </div>
          )}

          {/* Add to Cart: Small Button */}
          <div className="pt-2">
            <button
              id="add-to-cart-btn"
              type="button"
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className={`px-6 py-2 text-[10px] uppercase tracking-[0.22em] font-medium rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                isSoldOut
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : addedAnimation
                  ? 'bg-neutral-800 text-white scale-98'
                  : 'bg-black text-white hover:bg-neutral-800 active:scale-95'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Added to Cart</span>
                </>
              ) : isSoldOut ? (
                <span>Sold Out</span>
              ) : (
                <span>Add to Cart</span>
              )}
            </button>
          </div>

          {/* Material note */}
          <p className="pt-2 text-[11px] text-neutral-400 font-light max-w-sm">
            {product.material}
          </p>
        </div>
      </div>

      {/* Easily Dismissable Sizing Popup Modal */}
      <AnimatePresence>
        {showSizeModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowSizeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              onClick={e => e.stopPropagation()}
              className="bg-white border border-neutral-200 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-left relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowSizeModal(false)}
                className="absolute top-5 right-5 p-1 text-neutral-400 hover:text-black cursor-pointer transition-colors"
                aria-label="Close size options"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-xs uppercase tracking-[0.22em] font-medium text-neutral-900 mb-1">
                Select Dimensions
              </div>
              <p className="text-[11px] text-neutral-400 font-light mb-4">
                Atelier edition scale & proportions
              </p>

              <div className="space-y-2">
                {product.sizes?.map(size => {
                  const isSelected = selectedSizeId === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => {
                        setSelectedSizeId(size.id);
                        setShowSizeModal(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-black bg-neutral-50 font-medium ring-1 ring-black'
                          : 'border-neutral-200 hover:border-neutral-400 bg-white'
                      }`}
                    >
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-neutral-900 font-medium">
                          {size.label}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          {size.width} × {size.depth} cm
                        </div>
                      </div>
                      <div className="text-[11px] font-mono font-medium text-neutral-900">
                        {formatPrice(size.price)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
