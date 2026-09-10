import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  Search,
  SlidersHorizontal,
  Grid2X2,
  Grid3X3,
  LayoutGrid,
  ArrowUpDown,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { products, navigateToPDP, formatPrice, addToCart, showToast } = useStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'curated' | 'price-asc' | 'price-desc' | 'name'>('curated');
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);

  // Only display products marked as visible in the catalogue
  const visibleProducts = useMemo(() => {
    return products.filter(p => p.visible !== false);
  }, [products]);

  // Filter categories
  const categories = [
    { id: 'all', label: 'All Works' },
    { id: 'wave', label: 'Wave & Strata' },
    { id: 'concentric', label: 'Concentric & Pleats' },
    { id: 'sculptural', label: 'Ribbon & Sculptural' },
    { id: 'in-stock', label: 'Ready to Ship' },
  ];

  // Filter and sort items
  const filteredProducts = useMemo(() => {
    let list = [...visibleProducts];

    // Filter by category
    if (activeCategory === 'wave') {
      list = list.filter(p => (p.name || '').toLowerCase().includes('strata') || (p.name || '').toLowerCase().includes('vortex') || (p.tags || []).some(t => (t || '').toLowerCase().includes('wave')));
    } else if (activeCategory === 'concentric') {
      list = list.filter(p => (p.name || '').toLowerCase().includes('uzu') || (p.name || '').toLowerCase().includes('dune') || (p.tags || []).some(t => (t || '').toLowerCase().includes('concentric') || (t || '').toLowerCase().includes('pleat')));
    } else if (activeCategory === 'sculptural') {
      list = list.filter(p => (p.name || '').toLowerCase().includes('ribbon') || (p.name || '').toLowerCase().includes('medusa') || (p.tags || []).some(t => (t || '').toLowerCase().includes('sculptural') || (t || '').toLowerCase().includes('pop')));
    } else if (activeCategory === 'in-stock') {
      list = list.filter(p => p.availability !== 'Sold out' && (p.stockOnHand || 0) > 0);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.material || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.tags || []).some(t => (t || '').toLowerCase().includes(q))
      );
    }

    // Sort items
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.fromPrice - b.fromPrice);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.fromPrice - a.fromPrice);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [visibleProducts, activeCategory, searchQuery, sortBy]);

  // Column layout classes
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[gridCols];

  return (
    <main className="w-full bg-[#fbfbfb] min-h-[calc(100vh-56px)]">
      {/* Editorial Exhibition Hero Header */}
      <section className="border-b border-black/[0.08] bg-white px-4 sm:px-8 py-10 md:py-14 text-center">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-600">
            <Sparkles className="w-3 h-3 text-neutral-800" />
            <span>Exhibition 04 · Sculptural Works & Tufted Forms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light uppercase tracking-[0.25em] text-black font-serif">
            FORMA COLLECTION
          </h1>
          <p className="text-xs sm:text-[13px] text-neutral-500 font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
            Architectural hand-tufted rugs and relief tapestries woven in high-density New Zealand wool and botanical silks. Each piece is individually crafted in numbered studio editions.
          </p>
        </div>
      </section>

      {/* Sticky Interactive Toolbar: Categories, Search, Sort & Grid density */}
      <div className="sticky top-14 z-20 bg-white/95 backdrop-blur-md border-b border-black/[0.06] px-4 sm:px-8 py-3">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-[11px] uppercase tracking-[0.16em]">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap text-[10px] font-medium tracking-[0.18em] ${
                  activeCategory === cat.id
                    ? 'bg-black text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right Controls: Search, Sort dropdown, and Column switcher */}
          <div className="flex items-center gap-2.5 sm:gap-4 justify-between md:justify-end">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search collection..."
                className="w-full pl-8 pr-7 py-1.5 bg-neutral-100 border border-transparent focus:border-neutral-300 focus:bg-white rounded-full text-[11px] tracking-wide focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                aria-label="Sort products"
                className="appearance-none bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] uppercase tracking-[0.18em] font-medium pl-3 pr-7 py-1.5 rounded-full border border-transparent focus:outline-none cursor-pointer"
              >
                <option value="curated">Curated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name (A–Z)</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-neutral-500 absolute right-2.5 pointer-events-none" />
            </div>

            {/* Column density toggles (desktop) */}
            <div className="hidden lg:flex items-center gap-1 border-l border-neutral-200 pl-3">
              <button
                type="button"
                onClick={() => setGridCols(2)}
                className={`p-1.5 rounded transition-colors ${gridCols === 2 ? 'bg-neutral-200 text-black' : 'text-neutral-400 hover:text-black'}`}
                title="Editorial 2-Column View"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(3)}
                className={`p-1.5 rounded transition-colors ${gridCols === 3 ? 'bg-neutral-200 text-black' : 'text-neutral-400 hover:text-black'}`}
                title="Balanced 3-Column View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(4)}
                className={`p-1.5 rounded transition-colors ${gridCols === 4 ? 'bg-neutral-200 text-black' : 'text-neutral-400 hover:text-black'}`}
                title="Dense Studio 4-Column View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Products Grid */}
      <div className="max-w-[1800px] mx-auto p-4 sm:p-6 md:p-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-neutral-200 rounded-xl p-8 space-y-4">
            <p className="text-sm text-neutral-500 uppercase tracking-widest font-mono">
              No matching pieces found
            </p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              No products match your selected filter or query. Try adjusting your keywords or clearing the category selection.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                setSortBy('curated');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-[11px] uppercase tracking-widest rounded-full hover:bg-neutral-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={`grid ${gridClasses} gap-4 sm:gap-6 md:gap-8`}>
            {filteredProducts.map(product => {
              const isSoldOut = product.availability === 'Sold out';
              const isHovered = hoveredId === product.id;
              const hasAlternate = Boolean(product.hoverImage);
              const displayImage = isHovered && product.hoverImage ? product.hoverImage : product.cardImage;

              return (
                <article
                  key={product.id}
                  id={`product-card-${product.slug}`}
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group flex flex-col bg-white border border-black/[0.06] rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300"
                >
                  {/* Square Product Canvas Image */}
                  <div
                    onClick={() => navigateToPDP(product.slug)}
                    className="relative aspect-square w-full bg-[#f7f7f7] overflow-hidden cursor-pointer flex items-center justify-center p-6 sm:p-10"
                  >
                    <img
                      src={displayImage}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-contain object-center transition-all duration-500 ease-out group-hover:scale-105"
                    />

                    {/* Status Pill Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                      {isSoldOut ? (
                        <span className="bg-black text-white text-[9px] uppercase tracking-[0.2em] font-medium px-2.5 py-1 rounded-sm">
                          Sold Out
                        </span>
                      ) : product.availability === 'Made to order' ? (
                        <span className="bg-neutral-900/80 text-white backdrop-blur-xs text-[9px] uppercase tracking-[0.2em] font-medium px-2 py-0.5 rounded-sm">
                          Made to Order
                        </span>
                      ) : (
                        <span className="bg-emerald-900/80 text-emerald-100 backdrop-blur-xs text-[9px] uppercase tracking-[0.2em] font-medium px-2 py-0.5 rounded-sm">
                          In Stock
                        </span>
                      )}

                      {product.newArrival && (
                        <span className="bg-neutral-100 text-neutral-800 text-[9px] uppercase tracking-[0.18em] font-mono px-2 py-0.5 rounded-sm border border-neutral-300">
                          New Edition
                        </span>
                      )}
                    </div>

                    {/* Quick Explore Button that reveals on hover */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] font-medium text-black bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full shadow-xs border border-black/10">
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Product Metadata & Price Card Footer */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white border-t border-black/[0.04]">
                    <div>
                      {/* Name and Price Header */}
                      <div className="flex items-start justify-between gap-2">
                        <h2
                          onClick={() => navigateToPDP(product.slug)}
                          className="text-[13px] sm:text-[14px] font-semibold tracking-wider uppercase text-neutral-900 hover:text-neutral-600 transition-colors cursor-pointer"
                        >
                          {product.name}
                        </h2>
                        <span className="text-[12px] sm:text-[13px] font-mono font-bold text-neutral-900 shrink-0">
                          {formatPrice(product.fromPrice)}
                        </span>
                      </div>

                      {/* Material / Edition summary */}
                      <p className="text-[11px] text-neutral-500 font-light tracking-wide mt-1 line-clamp-1">
                        {product.material}
                      </p>
                    </div>

                    {/* Colorway Swatches & Sizing footnote */}
                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                      {/* Color dots */}
                      <div className="flex items-center gap-1.5">
                        {(product.colours || []).map(c => (
                          <span
                            key={c.id}
                            title={c.name}
                            className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs inline-block"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                        <span className="text-[10px] text-neutral-400 font-mono pl-1">
                          {(product.colours || []).length} {(product.colours || []).length === 1 ? 'color' : 'colors'}
                        </span>
                      </div>

                      {/* Dimensions / lead time preview */}
                      <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                        {(product.sizes || []).length} standard sizes
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};
