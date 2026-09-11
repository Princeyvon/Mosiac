import React, { useState, useEffect } from 'react';
import { useStore, getOneWordName } from '../../context/StoreContext';
import { ProductGallery } from './ProductGallery';
import { SizingGuideModal } from './SizingGuideModal';
import { ArrowLeft, Check, Ruler } from 'lucide-react';
import { motion } from 'motion/react';

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
  const [showSizingGuide, setShowSizingGuide] = useState<boolean>(false);

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

          {/* Sizing: S, M, L, XL Selection & Sizing Guide Button */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="w-full flex flex-col items-center space-y-2.5 pt-1">
              <div className="flex items-center justify-between w-full max-w-xs px-1 text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                <span>Select Size</span>
                <button
                  id="open-sizing-guide-btn"
                  type="button"
                  onClick={() => setShowSizingGuide(true)}
                  className="inline-flex items-center gap-1 text-neutral-600 hover:text-black transition-colors cursor-pointer border-b border-neutral-300 hover:border-black pb-0.5"
                >
                  <Ruler className="w-3 h-3 text-neutral-500" />
                  <span>Sizing Guide</span>
                </button>
              </div>

              {/* S, M, L, XL Size Chips */}
              <div className="flex items-center justify-center gap-2 w-full">
                {product.sizes.map((size) => {
                  const isSelected = selectedSizeId === size.id;
                  return (
                    <button
                      key={size.id}
                      id={`size-btn-${size.label.toLowerCase()}`}
                      type="button"
                      onClick={() => setSelectedSizeId(size.id)}
                      className={`min-w-[50px] h-10 px-3.5 flex flex-col items-center justify-center rounded-sm transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-xs font-semibold'
                          : 'bg-white text-neutral-800 border-neutral-300 hover:border-black hover:bg-neutral-50'
                      }`}
                    >
                      <span className="text-xs tracking-wider uppercase font-mono font-medium">{size.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Size Dimensions readout */}
              {selectedSize && (
                <div className="text-[11px] text-neutral-500 font-mono tracking-wide pt-0.5 text-center">
                  <span>{selectedSize.width} × {selectedSize.depth} cm</span>
                  <span className="text-neutral-300 mx-1.5">·</span>
                  <span>approx. {((selectedSize.width * 0.0328084)).toFixed(1)}' × {((selectedSize.depth * 0.0328084)).toFixed(1)}' ft</span>
                </div>
              )}
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
          <p className="pt-2 text-[11px] text-neutral-400 font-light max-w-sm tracking-wide leading-relaxed text-center">
            {product.material} · {product.leadTime}
          </p>
        </div>
      </div>

      {/* Sizing Guide Pop-up with designed tables */}
      <SizingGuideModal
        isOpen={showSizingGuide}
        onClose={() => setShowSizingGuide(false)}
        productName={product.name}
        productShape={product.shape}
      />
    </div>
  );
};
