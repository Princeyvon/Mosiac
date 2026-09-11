import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductGallery } from './ProductGallery';
import { ArrowLeft, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailProps {
  slug: string;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ slug }) => {
  const { products, navigateToStore, addToCart, formatPrice } = useStore();

  const product = products.find(p => p.slug === slug) || products[0];

  const defaultColor = product.colours?.[0]?.name || 'Standard';
  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);

  const defaultSizeId = product.sizes?.[0]?.id || 's1';
  const [selectedSizeId, setSelectedSizeId] = useState<string>(defaultSizeId);

  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const [showSizeModal, setShowSizeModal] = useState<boolean>(false);

  const selectedSize = product.sizes?.find(s => s.id === selectedSizeId) || product.sizes?.[0];
  const activePrice = selectedSize ? selectedSize.price : product.fromPrice;
  const isSoldOut = product.availability === 'Sold out';

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
    addToCart(product.id, selectedSize?.id || 'default', selectedColor, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <div className="w-full bg-white text-black min-h-[calc(100vh-60px)] pb-16">
      {/* Top Navigation */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-4">
        <button
          type="button"
          onClick={navigateToStore}
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-400 hover:text-black transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      {/* Centered Product Detail Layout */}
      <div className="max-w-xl mx-auto px-4 flex flex-col items-center text-center">
        {/* Carousel at Top Center */}
        <div className="w-full max-w-md sm:max-w-lg">
          <ProductGallery
            images={product.galleryImages}
            productName={product.name}
          />
        </div>

        {/* Directly at the bottom of the carousel */}
        <div className="w-full flex flex-col items-center mt-6 space-y-4">
          {/* Product Name */}
          <h1 className="text-lg sm:text-xl font-medium uppercase tracking-[0.22em] text-neutral-900">
            {product.name}
          </h1>

          {/* Price */}
          <div className="text-base sm:text-lg font-mono font-semibold text-neutral-900">
            {formatPrice(activePrice)}
          </div>

          {/* Color Switcher */}
          {product.colours && product.colours.length > 0 && (
            <div className="flex items-center justify-center gap-2.5 pt-1">
              {product.colours.map(c => {
                const isSelected = selectedColor === c.name;
                return (
                  <button
                    key={c.id || c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    title={c.name}
                    className={`relative p-0.5 rounded-full transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-black ring-offset-2' : 'hover:scale-110 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/15 block"
                      style={{ backgroundColor: c.hex }}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Sizing Link (opens as easily dismissable popup) */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowSizeModal(true)}
                className="text-[11px] uppercase tracking-[0.18em] text-neutral-500 hover:text-black underline underline-offset-4 transition-colors cursor-pointer"
              >
                Size: {selectedSize?.label} ({selectedSize?.width} × {selectedSize?.depth} cm)
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
              className={`px-5 py-2 text-[10px] uppercase tracking-[0.2em] font-medium rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isSoldOut
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : addedAnimation
                  ? 'bg-neutral-800 text-white'
                  : 'bg-black text-white hover:bg-neutral-800 active:scale-95'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Added</span>
                </>
              ) : isSoldOut ? (
                <span>Sold Out</span>
              ) : (
                <span>Add to Cart</span>
              )}
            </button>
          </div>
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
              className="bg-white border border-neutral-200 rounded-xl shadow-xl max-w-sm w-full p-5 text-left relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowSizeModal(false)}
                className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-black cursor-pointer"
                aria-label="Close size options"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-900 mb-1">
                Select Dimensions
              </div>
              <p className="text-[11px] text-neutral-400 font-light mb-4">
                Choose studio edition scale
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
                      className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
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

