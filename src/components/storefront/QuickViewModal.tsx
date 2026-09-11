import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { X, ArrowRight, Check, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart, setCartOpen, formatPrice, navigateToPDP, showToast } = useStore();

  const [selectedColor, setSelectedColor] = useState<string>(
    product?.colours[0]?.name || 'Default'
  );
  const [selectedSizeId, setSelectedSizeId] = useState<string>(
    product?.sizes[0]?.id || ''
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Sync state when product changes
  React.useEffect(() => {
    if (product) {
      setSelectedColor(product.colours[0]?.name || 'Default');
      setSelectedSizeId(product.sizes[0]?.id || '');
      setActiveImageIndex(0);
      setAddedAnimation(false);
    }
  }, [product]);

  if (!product) return null;

  const currentSize = product.sizes.find(s => s.id === selectedSizeId) || product.sizes[0];
  const price = currentSize ? currentSize.price : product.fromPrice;

  // Build images array
  const allImages = [product.cardImage, ...(product.galleryImages || [])].filter(Boolean);
  const displayImage = allImages[activeImageIndex] || product.cardImage;

  const handleAddToCart = () => {
    addToCart(product.id, currentSize?.id || '', selectedColor);
    setAddedAnimation(true);
    showToast(`Added ${product.name} to cart`);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
      setCartOpen(true);
    }, 600);
  };

  const handleNavigateFull = () => {
    onClose();
    navigateToPDP(product.slug);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          key="quick-view-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          key={`quick-view-${product.id}`}
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative bg-white w-full max-w-2xl border border-black/10 shadow-2xl z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-3 right-3 z-20 p-1.5 bg-white/90 backdrop-blur-xs text-neutral-500 hover:text-black rounded-full border border-black/10 shadow-xs cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </motion.button>

          {/* Left: Product Visual */}
          <div className="md:w-1/2 bg-neutral-100 flex flex-col justify-between relative overflow-hidden shrink-0">
            <div className="h-64 md:h-full relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={displayImage}
                  src={displayImage}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full object-cover object-center"
                />
              </AnimatePresence>

              {/* Status Badge */}
              <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                {product.newArrival && (
                  <span className="text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 bg-black text-white font-medium">
                    New Arrival
                  </span>
                )}
                <span className="text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 bg-white/95 text-neutral-800 backdrop-blur-xs border border-black/10 font-mono">
                  {product.availability}
                </span>
              </div>
            </div>

            {/* Thumbnail dots/selectors */}
            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
                {allImages.slice(0, 4).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'w-5 bg-black' : 'w-1.5 bg-black/30 hover:bg-black/60'
                    }`}
                    aria-label={`View angle ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Details & Rapid Selection */}
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-neutral-400">
                  {product.collection} · {product.material}
                </span>
                <h3 className="text-base font-medium tracking-tight text-neutral-900 mt-1">
                  {product.name}
                </h3>
                <div className="mt-1 font-mono text-sm font-medium text-neutral-800">
                  {formatPrice(price)}
                </div>
              </div>

              {/* Description preview */}
              <p className="text-[11px] text-neutral-600 font-light leading-relaxed line-clamp-2">
                {product.cardSummary || product.fullDescription}
              </p>

              {/* Colour variants */}
              {product.colours && product.colours.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                    <span>Finish</span>
                    <span className="text-black font-medium">[{selectedColor}]</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.colours.map(c => {
                      const isSelected = selectedColor === c.name;
                      return (
                        <motion.button
                          key={c.name}
                          type="button"
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setSelectedColor(c.name)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 border transition-all text-[10px] cursor-pointer ${
                            isSelected
                              ? 'border-black bg-neutral-50 font-medium'
                              : 'border-neutral-200 hover:border-neutral-400 bg-white'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="uppercase tracking-wider text-neutral-800">
                            {c.name}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size options */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-1.5">
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                    Dimensions / Scale
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {product.sizes.map(s => {
                      const isSelected = selectedSizeId === s.id;
                      return (
                        <motion.button
                          key={s.id}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedSizeId(s.id)}
                          className={`px-2.5 py-1.5 border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-black bg-neutral-50 text-black font-medium'
                              : 'border-neutral-200 hover:border-neutral-400 text-neutral-600 bg-white'
                          }`}
                        >
                          <div className="text-[10px] uppercase tracking-wider line-clamp-1">{s.label}</div>
                          <div className="text-[9px] font-mono text-neutral-500">{formatPrice(s.price)}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-5 border-t border-neutral-100 mt-4">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={product.availability === 'Sold out'}
                className={`w-full py-3 px-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer ${
                  product.availability === 'Sold out'
                    ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                    : addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </>
                )}
              </motion.button>

              <button
                type="button"
                onClick={handleNavigateFull}
                className="w-full text-center py-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500 hover:text-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Full Studio Specifications</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
