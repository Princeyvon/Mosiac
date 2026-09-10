import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { StatusPill } from './StatusPill';
import { Product } from '../../types';
import {
  Star,
  Trash2,
  Edit3,
  Plus,
  ExternalLink,
  Search,
  Copy,
  Layers,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';

export const CatalogueTable: React.FC = () => {
  const {
    stagedProducts,
    toggleProductStatus,
    setEditingProductId,
    deleteProduct,
    createNewProduct,
    saveProductDraft,
    formatPrice,
    navigateToPDP,
    showToast
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'visible' | 'hidden' | 'low-stock' | 'sold-out'>('all');

  // Filter products by tab and search
  const filteredProducts = useMemo(() => {
    return stagedProducts.filter(p => {
      // Tab filter
      if (activeTab === 'visible' && p.visible === false) return false;
      if (activeTab === 'hidden' && p.visible !== false) return false;
      if (activeTab === 'sold-out' && p.availability !== 'Sold out') return false;
      if (activeTab === 'low-stock' && (p.stockOnHand || 0) > (p.lowStockAlertAt || 2)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (p.name || '').toLowerCase().includes(q);
        const matchesSku = (p.sku || '').toLowerCase().includes(q);
        const matchesMaterial = (p.material || '').toLowerCase().includes(q);
        const matchesTag = (p.tags || []).some(t => (t || '').toLowerCase().includes(q));
        if (!matchesName && !matchesSku && !matchesMaterial && !matchesTag) return false;
      }

      return true;
    });
  }, [stagedProducts, activeTab, searchQuery]);

  // Quick stock quantity adjuster
  const handleStockChange = (product: Product, delta: number) => {
    const current = product.stockOnHand || 0;
    const newStock = Math.max(0, current + delta);
    const updated: Product = {
      ...product,
      stockOnHand: newStock,
      availability: newStock === 0 ? 'Sold out' : (product.availability === 'Sold out' ? 'In stock' : product.availability)
    };
    saveProductDraft(updated);
    showToast(`Stock updated: ${product.name} (${newStock} units)`);
  };

  // Quick product duplication
  const handleDuplicate = (product: Product) => {
    const newId = 'prod-' + Date.now();
    const newProduct: Product = {
      ...product,
      id: newId,
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy-${Date.now().toString().slice(-4)}`,
      sku: `FORMA-${Date.now().toString().slice(-4)}`,
      visible: false,
      stockOnHand: 1,
      availability: 'In stock'
    };
    saveProductDraft(newProduct);
    showToast(`Created duplicate: ${newProduct.name}`);
  };

  const counts = {
    all: stagedProducts.length,
    visible: stagedProducts.filter(p => p.visible !== false).length,
    hidden: stagedProducts.filter(p => p.visible === false).length,
    lowStock: stagedProducts.filter(p => (p.stockOnHand || 0) <= (p.lowStockAlertAt || 2)).length,
    soldOut: stagedProducts.filter(p => p.availability === 'Sold out').length,
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Catalogue Management
            </h1>
            <span className="text-[11px] font-medium bg-neutral-100 text-neutral-600 px-2.5 py-0.5 rounded-full font-mono">
              {stagedProducts.length} items
            </span>
          </div>
          <p className="text-[12px] text-neutral-500 mt-1">
            Audit inventory levels, toggle instant storefront availability, and configure architectural finishes.
          </p>
        </div>

        <button
          id="dash-add-product-btn"
          type="button"
          onClick={() => createNewProduct()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-[11px] font-medium tracking-wider uppercase rounded-full hover:bg-neutral-800 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Product</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-neutral-200 rounded-xl">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
              activeTab === 'all' ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('visible')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
              activeTab === 'visible' ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Visible ({counts.visible})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hidden')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
              activeTab === 'hidden' ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Hidden ({counts.hidden})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('low-stock')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
              activeTab === 'low-stock' ? 'bg-amber-500 text-white' : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Low Stock ({counts.lowStock})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sold-out')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
              activeTab === 'sold-out' ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Sold Out ({counts.soldOut})
          </button>
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search name, SKU, tags..."
            className="w-full pl-8 pr-7 py-1.5 bg-neutral-50 border border-neutral-200 focus:border-black focus:bg-white rounded-lg text-xs font-mono tracking-tight focus:outline-none transition-colors"
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
      </div>

      {/* Spreadsheet-like vertical list of product rows */}
      <div className="border border-neutral-200 bg-white rounded-xl overflow-hidden divide-y divide-neutral-200 shadow-2xs">
        {filteredProducts.map(product => {
          const isSoldOut = product.availability === 'Sold out';
          const sizeCount = product.sizes?.length || 0;
          const colorCount = product.colours?.length || 0;
          const stock = product.stockOnHand || 0;
          const isLowStock = stock <= (product.lowStockAlertAt || 2);

          return (
            <div
              key={product.id}
              className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-neutral-50/70 transition-colors"
            >
              {/* Left group: Thumbnail, Title, Star, Meta */}
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                {/* Small square thumbnail */}
                <div
                  onClick={() => setEditingProductId(product.id)}
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-neutral-100 border border-neutral-200 rounded-lg overflow-hidden shrink-0 cursor-pointer group"
                >
                  <img
                    src={product.cardImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProductId(product.id)}
                      className="text-[13px] font-semibold tracking-wide uppercase text-neutral-900 hover:text-neutral-600 transition-colors text-left truncate max-w-xs sm:max-w-sm"
                    >
                      {product.name}
                    </button>

                    {/* Star icon toggle (marks highlighted/hero item, separate from Featured) */}
                    <button
                      type="button"
                      onClick={() => toggleProductStatus(product.id, 'starred')}
                      className={`p-1 rounded-full hover:bg-neutral-200 transition-colors ${
                        product.starred ? 'text-amber-500 fill-amber-500' : 'text-neutral-300 hover:text-neutral-500'
                      }`}
                      title={product.starred ? 'Hero highlighted item' : 'Mark as hero highlighted'}
                    >
                      <Star className={`w-4 h-4 ${product.starred ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  {/* Secondary meta text */}
                  <div className="text-[11px] text-neutral-500 mt-1 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-neutral-400">{product.sku}</span>
                    <span>·</span>
                    <span className="font-medium text-neutral-700">{product.fulfilment}</span>
                    <span>·</span>
                    <span>
                      {sizeCount} {sizeCount === 1 ? 'size' : 'sizes'} · {colorCount} {colorCount === 1 ? 'colour' : 'colours'}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigateToPDP(product.slug)}
                      className="text-neutral-400 hover:text-neutral-700 inline-flex items-center gap-1 ml-1"
                      title="Preview on storefront PDP"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="text-[10px]">Preview</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right group: Stock Adjuster, Status pills, Price, Actions */}
              <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 sm:gap-4 pt-2 lg:pt-0 border-t border-neutral-100 lg:border-t-0">
                {/* Inline Stock Quantity Adjuster */}
                <div className="flex items-center gap-1.5 bg-neutral-100/80 px-2 py-1 rounded-lg border border-neutral-200">
                  <span className="text-[10px] uppercase font-mono text-neutral-500">Stock:</span>
                  <span className={`font-mono font-bold text-xs px-1 ${isLowStock ? 'text-amber-600' : 'text-neutral-900'}`}>
                    {stock}
                  </span>
                  <div className="flex items-center gap-0.5 ml-1">
                    <button
                      type="button"
                      onClick={() => handleStockChange(product, -1)}
                      className="p-1 hover:bg-neutral-200 rounded text-neutral-600 hover:text-black transition-colors"
                      title="Decrease stock by 1"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStockChange(product, 1)}
                      className="p-1 hover:bg-neutral-200 rounded text-neutral-600 hover:text-black transition-colors"
                      title="Increase stock by 1"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Row of status pills (independent clickable toggles) */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* VISIBLE / HIDDEN */}
                  <StatusPill
                    active={product.visible !== false}
                    activeLabel="VISIBLE"
                    inactiveLabel="HIDDEN"
                    onClick={() => toggleProductStatus(product.id, 'visible')}
                  />

                  {/* MARK SOLD OUT / SOLD OUT */}
                  <StatusPill
                    active={isSoldOut}
                    activeLabel="SOLD OUT"
                    inactiveLabel="MARK SOLD OUT"
                    onClick={() => toggleProductStatus(product.id, 'soldOut')}
                  />

                  {/* FEATURED */}
                  <StatusPill
                    active={!!product.featured}
                    activeLabel="FEATURED"
                    onClick={() => toggleProductStatus(product.id, 'featured')}
                  />

                  {/* NEW ARRIVAL */}
                  <StatusPill
                    active={!!product.newArrival}
                    activeLabel="NEW ARRIVAL"
                    onClick={() => toggleProductStatus(product.id, 'newArrival')}
                  />
                </div>

                {/* Price formatted with currency */}
                <div className="text-right min-w-[90px]">
                  <span className="text-[13px] font-mono font-semibold text-neutral-900">
                    {formatPrice(product.fromPrice)}
                  </span>
                </div>

                {/* Row actions: Edit, Duplicate, Delete */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingProductId(product.id)}
                    className="px-3 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full border border-neutral-300 text-neutral-700 hover:border-black hover:text-black transition-colors"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(product)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded-full hover:bg-neutral-100 transition-colors"
                    title="Duplicate design"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete ${product.name}?`)) {
                        deleteProduct(product.id);
                      }
                    }}
                    className="p-1.5 text-neutral-400 hover:text-red-600 rounded-full hover:bg-neutral-100 transition-colors"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-neutral-400 space-y-3">
            <p className="text-sm">No products found matching your current filter or search.</p>
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
              }}
              className="px-4 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] uppercase tracking-widest rounded-full transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
