import React, { useState, useEffect } from 'react';
import { useStore, getOneWordName } from '../../context/StoreContext';
import { ProductGallery } from './ProductGallery';
import { ArrowLeft, Check, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailProps {
  slug: string;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ slug }) => {
  const {
    products,
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

  return (
    <div className="w-full bg-white text-black min-h-[calc(100vh-60px)] pb-24">
      {/* Centered Product Detail Layout */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center pt-6 sm:pt-10">
        {/* Carousel at Top Center (Pure image only + infinite scroll dots) */}
        <div className="w-full max-w-md sm:max-w-lg">
          <ProductGallery
            images={activeImages}
            productName={product.name}
          />
        </div>

        {/* Directly at the bottom of the carousel: Price, Sizing, Add to Cart */}
        <div className="w-full flex flex-col items-center mt-7 space-y-4 max-w-md">
          {/* Product Name (One word + color variant if selected) */}
          <h1 className="text-base sm:text-lg font-serif font-normal uppercase tracking-[0.24em] text-neutral-900 leading-snug">
            {activeColorName ? `${getOneWordName(product.name)} — ${activeColorName}` : getOneWordName(product.name)}
          </h1>

          {/* Price */}
          <div className="text-base sm:text-lg font-mono font-medium text-neutral-900 tracking-tight">
            {formatPrice(activePrice)}
          </div>

          {/* Sizing: Simple, architectural button opening dismissable popup (no excessive rounding) */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="pt-1">
              <button
                id="sizing-modal-trigger-btn"
                type="button"
                onClick={() => setShowSizeModal(true)}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-sm border border-neutral-300 hover:border-black text-[11px] uppercase tracking-[0.18em] text-neutral-800 hover:text-black bg-white transition-colors cursor-pointer"
              >
                <span>Size: {selectedSize?.label} ({selectedSize?.width} × {selectedSize?.depth} cm)</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>
          )}

          {/* Add to Cart: Small Button with subtle corners */}
          <div className="pt-1.5">
            <button
              id="add-to-cart-btn"
              type="button"
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className={`px-7 py-2.5 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-medium rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                isSoldOut
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : addedAnimation
                  ? 'bg-neutral-800 text-white'
                  : 'bg-black text-white hover:bg-neutral-800 active:scale-98'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added to Cart</span>
                </>
              ) : isSoldOut ? (
                <span>Sold Out</span>
              ) : (
                <span>Add to Cart</span>
              )}
            </button>
          </div>

          {/* Material & Atelier note */}
          <p className="pt-2 text-[11px] text-neutral-400 font-light max-w-sm tracking-wide leading-relaxed">
            {product.material} · {product.leadTime}
          </p>
        </div>
      </div>

      {/* Easily Dismissable Sizing Popup Modal (Clean architectural modal with rounded-sm) */}
      <AnimatePresence>
        {showSizeModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowSizeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.15 }}
              onClick={e => e.stopPropagation()}
              className="bg-white border border-neutral-200 rounded-sm shadow-xl max-w-sm w-full p-6 text-left relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowSizeModal(false)}
                className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-black cursor-pointer transition-colors"
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
                      className={`w-full flex items-center justify-between p-3 rounded-sm border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-black bg-neutral-50 font-medium'
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
