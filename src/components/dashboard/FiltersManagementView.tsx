import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SlidersHorizontal, Plus, Trash2, Check, Sparkles, Tag, ExternalLink, Eye, EyeOff } from 'lucide-react';

export const FiltersManagementView: React.FC = () => {
  const {
    storefrontFilters,
    showStorefrontFilters,
    toggleStorefrontFilters,
    addStorefrontFilter,
    deleteStorefrontFilter,
    navigateToStore,
    showToast
  } = useStore();

  const [newLabel, setNewLabel] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleLabelChange = (text: string) => {
    setNewLabel(text);
    if (!newSlug || newSlug === text.slice(0, -1).toLowerCase().replace(/\s+/g, '-')) {
      setNewSlug(text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleAddFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    addStorefrontFilter(newLabel.trim(), newSlug.trim() || undefined);
    setNewLabel('');
    setNewSlug('');
    setIsAdding(false);
  };

  // Preset suggestions
  const suggestions = [
    { label: 'Featured', slug: 'featured' },
    { label: 'On Sale', slug: 'on-sale' },
    { label: 'Sample Sale', slug: 'sample-sale' },
    { label: 'Textiles & Weaves', slug: 'textiles' },
    { label: 'Ceramics', slug: 'ceramics' },
    { label: 'Architectural Urns', slug: 'urns' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
            Navigation Architecture · Storefront Filters
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Storefront Header Filters
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure curated filter pills appearing centered in the storefront header.
            When any filter is active, an &quot;All&quot; option is automatically rendered alongside it.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={navigateToStore}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs uppercase font-medium tracking-wider rounded-sm border border-neutral-300 text-neutral-800 hover:border-black transition-colors cursor-pointer bg-white"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview on Storefront</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs uppercase font-semibold tracking-wider rounded-sm hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Cancel' : 'Add New Filter'}</span>
          </button>
        </div>
      </div>

      {/* Storefront Filter Visibility Master Control */}
      <div className="bg-white border border-neutral-200 rounded-sm p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 ${showStorefrontFilters ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400'}`}>
            {showStorefrontFilters ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-900 flex items-center gap-2">
              <span>Storefront Filter Bar Display</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                showStorefrontFilters 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
              }`}>
                {showStorefrontFilters ? 'Currently Visible' : 'Currently Hidden'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              {showStorefrontFilters
                ? 'Category filters are displayed in the center of the desktop header. (Hidden automatically on mobile devices).'
                : 'Category filters are currently hidden on the storefront for a pure minimal canvas layout.'}
            </p>
          </div>
        </div>

        <button
          id="toggle-storefront-filters-btn"
          type="button"
          onClick={toggleStorefrontFilters}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs uppercase font-semibold tracking-wider rounded-sm transition-all cursor-pointer whitespace-nowrap ${
            showStorefrontFilters
              ? 'bg-white border border-neutral-300 text-neutral-800 hover:border-black hover:bg-neutral-50'
              : 'bg-black border border-black text-white hover:bg-neutral-800 shadow-xs'
          }`}
        >
          {showStorefrontFilters ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide Filters</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Show Filters</span>
            </>
          )}
        </button>
      </div>

      {/* Live Simulation Banner */}
      <div className="bg-neutral-900 text-white p-5 rounded-sm shadow-md space-y-3">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-neutral-400">
          <span>Storefront Header Simulation (Center Position)</span>
          <span>{storefrontFilters.length + (storefrontFilters.length > 0 ? 1 : 0)} Available Options</span>
        </div>

        <div className="py-4 px-6 bg-neutral-950/80 rounded-sm border border-neutral-800 flex items-center justify-center flex-wrap gap-2">
          {/* Automatic ALL filter */}
          {storefrontFilters.length > 0 && (
            <span className="px-3 py-1 text-[11px] uppercase tracking-widest font-mono font-bold bg-white text-black rounded-sm shadow-xs border border-white">
              All (Auto)
            </span>
          )}

          {storefrontFilters.map(f => (
            <span
              key={f.id}
              className="px-3 py-1 text-[11px] uppercase tracking-widest font-mono text-neutral-300 hover:text-white rounded-sm border border-neutral-800 bg-neutral-900"
            >
              {f.label}
            </span>
          ))}

          {storefrontFilters.length === 0 && (
            <span className="text-xs text-neutral-500 font-mono italic">
              No custom filters defined yet. Storefront displays unfiltered collection.
            </span>
          )}
        </div>
      </div>

      {/* Create Filter Card */}
      {isAdding && (
        <form
          onSubmit={handleAddFilter}
          className="bg-white border border-neutral-300 rounded-sm p-5 space-y-4 shadow-sm animate-in fade-in duration-200"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2">
            <SlidersHorizontal className="w-4 h-4 text-black" />
            <span>Add Storefront Filter</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                Filter Display Label
              </label>
              <input
                type="text"
                required
                value={newLabel}
                onChange={e => handleLabelChange(e.target.value)}
                placeholder="e.g. On Sale"
                className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                URL / Matching Tag Slug
              </label>
              <input
                type="text"
                required
                value={newSlug}
                onChange={e => setNewSlug(e.target.value)}
                placeholder="e.g. on-sale"
                className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono focus:outline-black bg-white"
              />
            </div>
          </div>

          {/* Quick Suggestions */}
          <div>
            <span className="text-[10px] uppercase font-mono text-neutral-400 block mb-1.5">
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map(s => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => {
                    setNewLabel(s.label);
                    setNewSlug(s.slug);
                  }}
                  className="px-2.5 py-1 text-[10px] font-mono uppercase bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-sm transition-colors cursor-pointer"
                >
                  + {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs uppercase tracking-wider rounded-sm hover:bg-neutral-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
            >
              Add Filter
            </button>
          </div>
        </form>
      )}

      {/* Active Filters List */}
      <div className="bg-white border border-neutral-200 rounded-sm divide-y divide-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 bg-neutral-50 text-[10px] uppercase font-mono tracking-wider text-neutral-400 grid grid-cols-12">
          <span className="col-span-5">Filter Label</span>
          <span className="col-span-4">Matching Slug / Tag</span>
          <span className="col-span-3 text-right">Actions</span>
        </div>

        {storefrontFilters.map(filter => (
          <div key={filter.id} className="p-4 grid grid-cols-12 items-center hover:bg-neutral-50/50">
            <div className="col-span-5 flex items-center gap-2.5">
              <Tag className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-semibold text-xs text-neutral-900">{filter.label}</span>
            </div>

            <div className="col-span-4">
              <span className="font-mono text-[11px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-sm">
                #{filter.slug}
              </span>
            </div>

            <div className="col-span-3 text-right">
              <button
                type="button"
                onClick={() => deleteStorefrontFilter(filter.id)}
                className="inline-flex items-center gap-1 p-1.5 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                title="Remove filter"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase tracking-wider">Remove</span>
              </button>
            </div>
          </div>
        ))}

        {storefrontFilters.length === 0 && (
          <div className="p-8 text-center text-neutral-400 text-xs">
            No custom filters set. Click &quot;Add New Filter&quot; to configure your storefront header tabs.
          </div>
        )}
      </div>
    </div>
  );
};
