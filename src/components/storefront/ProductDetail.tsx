import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductGallery } from './ProductGallery';
import { VariantSwatches } from './VariantSwatches';
import { ChevronDown, Plus, Minus, ArrowLeft, Check, ShieldCheck, Truck, Sparkles } from 'lucide-react';

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

  const [quantity, setQuantity] = useState<number>(1);
  const [openSection, setOpenSection] = useState<string | null>('details');
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  const selectedSize = product.sizes?.find(s => s.id === selectedSizeId) || product.sizes?.[0];
  const activePrice = selectedSize ? selectedSize.price : product.fromPrice;
  const isSoldOut = product.availability === 'Sold out';

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart(product.id, selectedSize?.id || 'default', selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const toggleAccordion = (section: string) => {
    setOpenSection(prev => (prev === section ? null : section));
  };

  return (
    <div className="w-full bg-white text-black min-h-screen">
      {/* Top Breadcrumb / Return */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 border-b border-black/[0.06]">
        <button
          type="button"
          onClick={navigateToStore}
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalogue</span>
        </button>
      </div>

      {/* Two-Column Layout */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Dominant Media Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.galleryImages}
              productName={product.name}
            />
          </div>

          {/* Right Column: Compact Info Panel (Sticky on scroll) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-6">
            {/* Header / Title */}
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono mb-2">
                {product.collection} · {product.shape}
              </div>
              <h1 className="text-2xl sm:text-3xl font-light uppercase tracking-[0.15em] text-black">
                {product.name}
              </h1>
              {/* Short descriptive sentence (materials + key features) */}
              <p className="mt-3 text-[13px] text-neutral-600 font-light leading-relaxed">
                {product.cardSummary}
              </p>
            </div>

            <div className="border-t border-neutral-200" />

            {/* Color Variant Selector */}
            <VariantSwatches
              colours={product.colours}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
            />

            <div className="border-t border-neutral-200" />

            {/* Sizing Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em]">
                  <span className="text-neutral-500 font-normal">Dimension</span>
                  <span className="text-neutral-400 font-mono text-[10px]">
                    {selectedSize?.width} × {selectedSize?.depth} cm
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.sizes.map(size => {
                    const isSelected = selectedSizeId === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setSelectedSizeId(size.id)}
                        className={`py-2 px-3 text-left border transition-all ${
                          isSelected
                            ? 'border-black bg-neutral-50 font-medium'
                            : 'border-neutral-200 hover:border-neutral-400 bg-white text-neutral-700'
                        }`}
                      >
                        <div className="text-[11px] tracking-wide uppercase">{size.label}</div>
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          {formatPrice(size.price)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price & Add to Cart Controls */}
            <div className="space-y-4 pt-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-0.5">
                    {product.availability === 'Made to order' ? 'Made to Order' : 'Studio Price'}
                  </span>
                  <div className="text-2xl font-light font-mono tracking-tight text-black">
                    {formatPrice(activePrice)}
                  </div>
                </div>

                {/* Availability status */}
                <span className={`text-[10px] uppercase tracking-[0.2em] font-medium px-2 py-1 ${
                  isSoldOut
                    ? 'bg-neutral-100 text-neutral-500'
                    : product.availability === 'Made to order'
                    ? 'bg-neutral-100 text-neutral-800'
                    : 'bg-black text-white'
                }`}>
                  {product.availability}
                </span>
              </div>

              {/* Quantity + Add to Cart Button */}
              <div className="flex items-stretch gap-3">
                {/* Quantity selector */}
                <div className="flex items-center border border-neutral-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={isSoldOut}
                    className="px-3 py-3 text-neutral-500 hover:text-black transition-colors disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-[12px] font-mono select-none">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => prev + 1)}
                    disabled={isSoldOut}
                    className="px-3 py-3 text-neutral-500 hover:text-black transition-colors disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  id="add-to-cart-btn"
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isSoldOut}
                  className={`flex-1 py-3.5 px-6 text-[11px] uppercase tracking-[0.22em] font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    isSoldOut
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      : addedAnimation
                      ? 'bg-emerald-700 text-white'
                      : 'bg-black text-white hover:bg-neutral-800'
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : isSoldOut ? (
                    <span>Sold Out</span>
                  ) : (
                    <span>Add to Cart</span>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-neutral-500 text-center flex items-center justify-center gap-2">
                <Truck className="w-3.5 h-3.5 text-neutral-400" />
                <span>{product.leadTime}</span>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-2" />

            {/* Accordion Sections */}
            <div className="divide-y divide-neutral-200 border-b border-neutral-200 text-[12px]">
              {/* Full Details & Materials */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('details')}
                  className="w-full flex items-center justify-between text-left uppercase tracking-[0.18em] text-[11px] font-medium text-black focus:outline-none"
                >
                  <span>Materials & Specifications</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openSection === 'details' ? 'rotate-180' : ''}`} />
                </button>
                {openSection === 'details' && (
                  <div className="pt-3 pb-2 text-neutral-600 font-light leading-relaxed space-y-2">
                    <p>{product.fullDescription}</p>
                    <div className="pt-2 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-neutral-400 block uppercase tracking-wider text-[9px]">Material</span>
                        <span className="text-black">{product.material}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block uppercase tracking-wider text-[9px]">Origin</span>
                        <span className="text-black">Handcrafted Studio Edition</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping & Delivery */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex items-center justify-between text-left uppercase tracking-[0.18em] text-[11px] font-medium text-black focus:outline-none"
                >
                  <span>Shipping & Studio White-Glove</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openSection === 'shipping' ? 'rotate-180' : ''}`} />
                </button>
                {openSection === 'shipping' && (
                  <div className="pt-3 pb-2 text-neutral-600 font-light leading-relaxed space-y-2 text-[11px]">
                    <p>
                      Each piece is custom-crated in museum-standard moisture-sealed timber. Large architectural pieces are delivered via dedicated two-person white-glove courier including placement and packaging removal.
                    </p>
                    <p className="text-neutral-500">
                      Standard freight timelines: Domestic (3–5 days), International Air Freight (5–8 business days).
                    </p>
                  </div>
                )}
              </div>

              {/* Care & Maintenance */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('care')}
                  className="w-full flex items-center justify-between text-left uppercase tracking-[0.18em] text-[11px] font-medium text-black focus:outline-none"
                >
                  <span>Care & Maintenance</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openSection === 'care' ? 'rotate-180' : ''}`} />
                </button>
                {openSection === 'care' && (
                  <div className="pt-3 pb-2 text-neutral-600 font-light leading-relaxed text-[11px]">
                    <p>{product.careInstructions || 'Wipe gently with a clean dry microfiber cloth. Avoid harsh chemical detergents or abrasive pads.'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
