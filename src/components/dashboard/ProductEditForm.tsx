import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductSize, ProductColor } from '../../types';
import { ImageUploadField } from './ImageUploadField';
import {
  Check,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Upload,
  Clipboard
} from 'lucide-react';

interface ProductEditFormProps {
  productId: string;
}

export const ProductEditForm: React.FC<ProductEditFormProps> = ({ productId }) => {
  const { stagedProducts, saveProductDraft, setEditingProductId, formatPrice, showToast } = useStore();

  const originalProduct = stagedProducts.find(p => p.id === productId);

  if (!originalProduct) {
    return (
      <div className="p-8 text-center">
        <p className="text-neutral-500">Product not found.</p>
        <button
          type="button"
          onClick={() => setEditingProductId(null)}
          className="mt-4 px-4 py-2 bg-black text-white text-xs uppercase tracking-wider rounded-full"
        >
          Return to Catalogue
        </button>
      </div>
    );
  }

  const [form, setForm] = useState<Product>({ ...originalProduct });
  const [newTagInput, setNewTagInput] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#222222');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [showAddGalleryInput, setShowAddGalleryInput] = useState(false);

  // Collapsible sections (default expanded as requested)
  const [sectionsOpen, setSectionsOpen] = useState({
    specs: true,
    media: true,
    sizing: true,
    inventory: true,
    seo: true
  });

  const toggleSection = (sec: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Auto derive slug when name changes (if desired)
  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: prev.slug === originalProduct.slug || !prev.slug
        ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : prev.slug
    }));
  };

  // Tags management
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    if (!form.tags.includes(newTagInput.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, newTagInput.trim()] }));
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  // Colours management
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const newColor: ProductColor = {
      id: 'c-' + Date.now().toString().slice(-4),
      name: newColorName.trim(),
      hex: newColorHex
    };
    setForm(prev => ({ ...prev, colours: [...prev.colours, newColor] }));
    setNewColorName('');
  };

  const handleRemoveColor = (id: string) => {
    setForm(prev => ({ ...prev, colours: prev.colours.filter(c => c.id !== id) }));
  };

  // Gallery management
  const handleAddGalleryImage = (url: string) => {
    if (!url.trim()) return;
    setForm(prev => ({ ...prev, galleryImages: [...prev.galleryImages, url.trim()] }));
    setNewGalleryUrl('');
    setShowAddGalleryInput(false);
  };

  const handleRemoveGalleryImage = (index: number) => {
    setForm(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) }));
  };

  // Sizes, Pricing, and Weight Table management
  const handleAddSize = () => {
    const newSize: ProductSize = {
      id: 's-' + Date.now().toString().slice(-4),
      label: 'Custom Size',
      width: 100,
      depth: 50,
      price: form.fromPrice || 1000,
      weight: Math.round(100 * 50 * 0.0085) // Weight fills in automatically from dimensions: area * 0.0085
    };
    setForm(prev => ({ ...prev, sizes: [...prev.sizes, newSize] }));
  };

  const handleUpdateSize = (index: number, field: keyof ProductSize, value: any) => {
    setForm(prev => {
      const nextSizes = [...prev.sizes];
      const target = { ...nextSizes[index], [field]: value };

      // Auto update weight when width or depth changes
      if (field === 'width' || field === 'depth') {
        const w = field === 'width' ? Number(value) : target.width;
        const d = field === 'depth' ? Number(value) : target.depth;
        target.weight = Math.max(1, Math.round(w * d * 0.0085));
      }

      nextSizes[index] = target;
      return { ...prev, sizes: nextSizes };
    });
  };

  const handleRemoveSize = (index: number) => {
    setForm(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveProductDraft(form);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-neutral-400 font-mono">
            Product Catalogue · {form.id}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 mt-1">
            Editing {form.name || 'Untitled Product'}
          </h1>
        </div>

        {/* Top-right Cancel + Publish Changes buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditingProductId(null)}
            className="px-4 py-2 text-[11px] uppercase tracking-wider font-semibold rounded-full border border-neutral-300 text-neutral-700 hover:border-black hover:text-black transition-colors"
          >
            Cancel
          </button>
          <button
            id="dash-publish-changes-btn"
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 text-[11px] uppercase tracking-wider font-semibold rounded-full bg-black text-white hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Publish Changes</span>
          </button>
        </div>
      </div>

      {/* Two-Column Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Metadata & Text Fields */}
        <div className="lg:col-span-6 space-y-6">
          {/* Specifications & Content Collapsible Section */}
          <div className="bg-white p-6 border border-neutral-200 rounded-sm space-y-6">
            <div
              onClick={() => toggleSection('specs')}
              className="flex items-center justify-between border-b border-neutral-100 pb-2 cursor-pointer select-none group"
            >
              <h2 className="text-[12px] uppercase tracking-wider font-bold text-neutral-900 group-hover:text-black">
                Specifications & Content
              </h2>
              <div className="text-neutral-400 group-hover:text-black">
                {sectionsOpen.specs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {sectionsOpen.specs && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Product Name */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1.5">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => handleNameChange(e.target.value)}
                    className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-sm focus:outline-black font-medium"
                    placeholder="e.g. MONOLITH TRAVERTINE CONSOLE"
                  />
                </div>

                {/* URL Slug */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1.5">
                    URL Slug
                  </label>
                  <div className="flex items-center">
                    <span className="text-neutral-400 text-xs px-2.5 py-2 bg-neutral-50 border border-r-0 border-neutral-300 rounded-l-sm font-mono">
                      /product/
                    </span>
                    <input
                      type="text"
                      required
                      value={form.slug}
                      onChange={e => setForm({ ...form, slug: e.target.value })}
                      className="w-full border border-neutral-300 rounded-r-sm px-3 py-2 text-xs focus:outline-black font-mono text-neutral-800"
                    />
                  </div>
                </div>

                {/* Collection & Shape */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1.5">
                      Collection
                    </label>
                    <select
                      value={form.collection}
                      onChange={e => setForm({ ...form, collection: e.target.value })}
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black bg-white"
                    >
                      <option value="Furniture">Furniture</option>
                      <option value="Ceramics">Ceramics</option>
                      <option value="Lighting">Lighting</option>
                      <option value="Sculptural Objects">Sculptural Objects</option>
                      <option value="Textiles">Textiles</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1.5">
                      Shape / Style
                    </label>
                    <select
                      value={form.shape}
                      onChange={e => setForm({ ...form, shape: e.target.value })}
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black bg-white"
                    >
                      <option value="Monolithic">Monolithic</option>
                      <option value="Geometric">Geometric</option>
                      <option value="Radial">Radial</option>
                      <option value="Organic">Organic</option>
                      <option value="Angular">Angular</option>
                    </select>
                  </div>
                </div>

                {/* Availability & Lead Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1.5">
                      Availability
                    </label>
                    <select
                      value={form.availability}
                      onChange={e => {
                        const val = e.target.value as any;
                        setForm({ ...form, availability: val, fulfilment: val });
                      }}
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black bg-white font-medium"
                    >
                      <option value="Made to order">Made to order</option>
                      <option value="In stock">In stock</option>
                      <option value="Sold out">Sold out</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1.5">
                      Lead Time
                    </label>
                    <input
                      type="text"
                      value={form.leadTime}
                      onChange={e => setForm({ ...form, leadTime: e.target.value })}
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black"
                      placeholder="e.g. Ready in 3 to 4 weeks"
                    />
                  </div>
                </div>

                {/* Material */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1.5">
                    Material
                  </label>
                  <input
                    type="text"
                    value={form.material}
                    onChange={e => setForm({ ...form, material: e.target.value })}
                    className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black"
                    placeholder="e.g. Honed Roman Travertine, Beeswax Sealer"
                  />
                </div>

                {/* Card Summary */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1.5">
                    Card Summary (Single-line grid summary)
                  </label>
                  <input
                    type="text"
                    value={form.cardSummary}
                    onChange={e => setForm({ ...form, cardSummary: e.target.value })}
                    className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black"
                    placeholder="Short statement used for quick glances"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1.5">
                    Full Description (Used on PDP)
                  </label>
                  <textarea
                    rows={4}
                    value={form.fullDescription}
                    onChange={e => setForm({ ...form, fullDescription: e.target.value })}
                    className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black leading-relaxed"
                    placeholder="Comprehensive architectural narrative..."
                  />
                </div>

                {/* Care Instructions */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1.5">
                    Care Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={form.careInstructions || ''}
                    onChange={e => setForm({ ...form, careInstructions: e.target.value })}
                    className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black"
                    placeholder="Cleaning and maintenance advice..."
                  />
                </div>

                {/* Tags Chip List + Free-Text Input */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1.5">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-800 text-[10px] font-medium px-2.5 py-1 rounded-sm"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-neutral-400 hover:text-black cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={e => setNewTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 border border-neutral-300 rounded-sm px-3 py-1.5 text-xs focus:outline-black"
                      placeholder="e.g. Architectural, Numbered Edition..."
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 text-[10px] uppercase font-semibold bg-neutral-100 hover:bg-neutral-200 rounded-sm transition-colors cursor-pointer"
                    >
                      Add Tag
                    </button>
                  </div>
                </div>

                {/* Colours Chip List of Hex-Swatch Pills */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1.5">
                    Colours & Finishes
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.colours.map(c => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-2 border border-neutral-200 bg-white px-2.5 py-1 rounded-sm text-[10px] shadow-2xs"
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="font-medium text-neutral-800">{c.name}</span>
                        <span className="font-mono text-[9px] text-neutral-400">{c.hex}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(c.id)}
                          className="text-neutral-400 hover:text-black ml-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={e => setNewColorHex(e.target.value)}
                      className="w-8 h-8 p-0.5 border border-neutral-300 rounded-sm cursor-pointer"
                      title="Select swatch hex"
                    />
                    <input
                      type="text"
                      value={newColorName}
                      onChange={e => setNewColorName(e.target.value)}
                      className="flex-1 border border-neutral-300 rounded-sm px-3 py-1.5 text-xs focus:outline-black"
                      placeholder="Colour label (e.g. Charcoal Basalt)"
                    />
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-3 py-1.5 text-[10px] uppercase font-semibold bg-neutral-100 hover:bg-neutral-200 rounded-sm transition-colors cursor-pointer"
                    >
                      Add Swatch
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Images, Sizing Table, Pricing, Toggles, SEO */}
        <div className="lg:col-span-6 space-y-6">
          {/* Visual Media Section (Collapsible) */}
          <div className="bg-white p-6 border border-neutral-200 rounded-sm space-y-5">
            <div
              onClick={() => toggleSection('media')}
              className="flex items-center justify-between border-b border-neutral-100 pb-2 cursor-pointer select-none group"
            >
              <h2 className="text-[12px] uppercase tracking-wider font-bold text-neutral-900 group-hover:text-black">
                Imagery & 360° Turntable Gallery
              </h2>
              <div className="text-neutral-400 group-hover:text-black">
                {sectionsOpen.media ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {sectionsOpen.media && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Grid & Hover Image Slots with Clipboard & Upload support */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ImageUploadField
                    label="Card Image (Grid tile)"
                    value={form.cardImage}
                    onChange={url => setForm(prev => ({ ...prev, cardImage: url }))}
                    aspectRatio="square"
                    helperText="Primary storefront visual asset"
                  />

                  <ImageUploadField
                    label="Hover Image (Swap on hover)"
                    value={form.hoverImage || ''}
                    onChange={url => setForm(prev => ({ ...prev, hoverImage: url }))}
                    aspectRatio="square"
                    helperText="Secondary angle shown on mouse hover"
                  />
                </div>

                {/* Product Page Gallery (Feeds PDP turntable) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-700">
                        Product Page Gallery ({form.galleryImages.length} angles)
                      </label>
                      <p className="text-[10px] text-neutral-400">
                        Upload or paste angles to power the storefront Drag-to-Rotate 360° viewer.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                    {form.galleryImages.map((url, idx) => (
                      <div key={idx} className="group relative aspect-square bg-neutral-100 border border-neutral-200 rounded-sm overflow-hidden">
                        <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0.5 left-1 text-[8px] font-mono text-white bg-black/60 px-1 rounded-xs">
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-0.5 right-0.5 p-1 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}

                    {/* Add Image tile */}
                    <button
                      type="button"
                      onClick={() => setShowAddGalleryInput(true)}
                      className="aspect-square border border-dashed border-neutral-300 hover:border-black rounded-sm flex flex-col items-center justify-center text-neutral-400 hover:text-black transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mb-0.5" />
                      <span className="text-[9px] uppercase tracking-wider font-medium">Add Angle</span>
                    </button>
                  </div>

                  {showAddGalleryInput && (
                    <div className="mt-3 p-3 bg-neutral-50 border border-neutral-200 rounded-sm space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newGalleryUrl}
                          onChange={e => setNewGalleryUrl(e.target.value)}
                          placeholder="Paste image URL..."
                          className="flex-1 bg-white border border-neutral-300 px-2.5 py-1 text-[11px] font-mono rounded-sm focus:outline-black"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddGalleryImage(newGalleryUrl)}
                          className="px-3 py-1 bg-black text-white text-[10px] uppercase tracking-wider rounded-sm font-medium cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddGalleryInput(false)}
                          className="p-1 text-neutral-400 hover:text-black cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quick upload or paste buttons for angle */}
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-[9px] uppercase tracking-wider rounded-sm cursor-pointer">
                          <Upload className="w-3 h-3" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (f) {
                                const r = new FileReader();
                                r.onload = () => {
                                  if (typeof r.result === 'string') {
                                    handleAddGalleryImage(r.result);
                                  }
                                };
                                r.readAsDataURL(f);
                              }
                            }}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              if (navigator.clipboard?.read) {
                                const items = await navigator.clipboard.read();
                                for (const it of items) {
                                  const imgType = it.types.find(t => t.startsWith('image/'));
                                  if (imgType) {
                                    const blob = await it.getType(imgType);
                                    const r = new FileReader();
                                    r.onload = () => {
                                      if (typeof r.result === 'string') {
                                        handleAddGalleryImage(r.result);
                                      }
                                    };
                                    r.readAsDataURL(blob);
                                    return;
                                  }
                                }
                              }
                              const text = await navigator.clipboard?.readText();
                              if (text && text.startsWith('http')) {
                                handleAddGalleryImage(text.trim());
                              }
                            } catch {}
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-[9px] uppercase tracking-wider rounded-sm cursor-pointer"
                        >
                          <Clipboard className="w-3 h-3" />
                          <span>Paste from Clipboard</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sizes, Pricing, and Weight Table (Collapsible) */}
          <div className="bg-white p-6 border border-neutral-200 rounded-sm space-y-4">
            <div
              onClick={() => toggleSection('sizing')}
              className="flex items-center justify-between border-b border-neutral-100 pb-2 cursor-pointer select-none group"
            >
              <div>
                <h2 className="text-[12px] uppercase tracking-wider font-bold text-neutral-900 group-hover:text-black">
                  Sizes, Pricing and Weight
                </h2>
                <p className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  <span>Weight fills in automatically: width × depth × 0.0085 kg</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleAddSize();
                  }}
                  className="text-[11px] font-semibold text-black hover:underline uppercase tracking-wider cursor-pointer"
                >
                  + Add size
                </button>
                <div className="text-neutral-400 group-hover:text-black">
                  {sectionsOpen.sizing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {sectionsOpen.sizing && (
              <div className="overflow-x-auto animate-in fade-in duration-150">
                <table className="w-full text-[11px] text-left">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-400 font-mono text-[9px] uppercase tracking-wider">
                      <th className="pb-2">Size Label</th>
                      <th className="pb-2">Width (cm)</th>
                      <th className="pb-2">Depth (cm)</th>
                      <th className="pb-2">Price ($)</th>
                      <th className="pb-2">Weight (kg)</th>
                      <th className="pb-2 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-mono">
                    {form.sizes.map((size, idx) => (
                      <tr key={size.id || idx}>
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            value={size.label}
                            onChange={e => handleUpdateSize(idx, 'label', e.target.value)}
                            className="w-full border border-neutral-200 rounded-sm px-2 py-1 text-[11px] font-sans focus:outline-black"
                          />
                        </td>
                        <td className="py-2 pr-2 w-20">
                          <input
                            type="number"
                            value={size.width}
                            onChange={e => handleUpdateSize(idx, 'width', Number(e.target.value))}
                            className="w-full border border-neutral-200 rounded-sm px-2 py-1 text-[11px] focus:outline-black"
                          />
                        </td>
                        <td className="py-2 pr-2 w-20">
                          <input
                            type="number"
                            value={size.depth}
                            onChange={e => handleUpdateSize(idx, 'depth', Number(e.target.value))}
                            className="w-full border border-neutral-200 rounded-sm px-2 py-1 text-[11px] focus:outline-black"
                          />
                        </td>
                        <td className="py-2 pr-2 w-24">
                          <input
                            type="number"
                            value={size.price}
                            onChange={e => handleUpdateSize(idx, 'price', Number(e.target.value))}
                            className="w-full border border-neutral-200 rounded-sm px-2 py-1 text-[11px] focus:outline-black"
                          />
                        </td>
                        <td className="py-2 pr-2 w-20 text-neutral-600">
                          <span className="px-2 py-1 bg-neutral-50 rounded-sm block text-center">
                            {size.weight} kg
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(idx)}
                            className="text-neutral-400 hover:text-red-500 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pricing & Inventory Metrics (Collapsible) */}
          <div className="bg-white p-6 border border-neutral-200 rounded-sm space-y-4">
            <div
              onClick={() => toggleSection('inventory')}
              className="flex items-center justify-between border-b border-neutral-100 pb-2 cursor-pointer select-none group"
            >
              <h2 className="text-[12px] uppercase tracking-wider font-bold text-neutral-900 group-hover:text-black">
                Pricing & Inventory Controls
              </h2>
              <div className="text-neutral-400 group-hover:text-black">
                {sectionsOpen.inventory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {sectionsOpen.inventory && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                      From Price ($)
                    </label>
                    <input
                      type="number"
                      value={form.fromPrice}
                      onChange={e => setForm({ ...form, fromPrice: Number(e.target.value) })}
                      className="w-full border border-neutral-300 rounded-sm px-3 py-1.5 text-xs font-mono focus:outline-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                      Cost Price ($)
                    </label>
                    <input
                      type="number"
                      value={form.costPrice}
                      onChange={e => setForm({ ...form, costPrice: Number(e.target.value) })}
                      className="w-full border border-neutral-300 rounded-sm px-3 py-1.5 text-xs font-mono text-neutral-600 focus:outline-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                      Featured Order
                    </label>
                    <input
                      type="number"
                      value={form.featuredOrder}
                      onChange={e => setForm({ ...form, featuredOrder: Number(e.target.value) })}
                      className="w-full border border-neutral-300 rounded-sm px-3 py-1.5 text-xs font-mono focus:outline-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={form.sku}
                      onChange={e => setForm({ ...form, sku: e.target.value })}
                      className="w-full border border-neutral-300 rounded-sm px-3 py-1.5 text-xs font-mono focus:outline-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                      Stock on Hand
                    </label>
                    <input
                      type="number"
                      value={form.stockOnHand}
                      onChange={e => setForm({ ...form, stockOnHand: Number(e.target.value) })}
                      className="w-full border border-neutral-300 rounded-sm px-3 py-1.5 text-xs font-mono focus:outline-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                      Low Stock Alert At
                    </label>
                    <input
                      type="number"
                      value={form.lowStockAlertAt}
                      onChange={e => setForm({ ...form, lowStockAlertAt: Number(e.target.value) })}
                      className="w-full border border-neutral-300 rounded-sm px-3 py-1.5 text-xs font-mono focus:outline-black"
                    />
                  </div>
                </div>

                {/* Three toggle switches: Featured, New Arrival, Visible on Site */}
                <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.visible}
                      onChange={e => setForm({ ...form, visible: e.target.checked })}
                      className="w-4 h-4 rounded-xs text-black focus:ring-black cursor-pointer"
                    />
                    <span className="text-[11px] uppercase tracking-wider font-medium text-neutral-800">
                      Visible on site
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={e => setForm({ ...form, featured: e.target.checked })}
                      className="w-4 h-4 rounded-xs text-black focus:ring-black cursor-pointer"
                    />
                    <span className="text-[11px] uppercase tracking-wider font-medium text-neutral-800">
                      Featured
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.newArrival}
                      onChange={e => setForm({ ...form, newArrival: e.target.checked })}
                      className="w-4 h-4 rounded-xs text-black focus:ring-black cursor-pointer"
                    />
                    <span className="text-[11px] uppercase tracking-wider font-medium text-neutral-800">
                      New arrival
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* SEO Metadata (Collapsible) */}
          <div className="bg-white p-6 border border-neutral-200 rounded-sm space-y-4">
            <div
              onClick={() => toggleSection('seo')}
              className="flex items-center justify-between border-b border-neutral-100 pb-2 cursor-pointer select-none group"
            >
              <h2 className="text-[12px] uppercase tracking-wider font-bold text-neutral-900 group-hover:text-black">
                Search Engine Optimization (SEO)
              </h2>
              <div className="text-neutral-400 group-hover:text-black">
                {sectionsOpen.seo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {sectionsOpen.seo && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={form.seoTitle || ''}
                    onChange={e => setForm({ ...form, seoTitle: e.target.value })}
                    className="w-full border border-neutral-300 rounded-sm px-3 py-1.5 text-xs focus:outline-black font-medium"
                    placeholder="e.g. Monolith Travertine Console — Mosiac Studio"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                    SEO Description
                  </label>
                  <textarea
                    rows={2}
                    value={form.seoDescription || ''}
                    onChange={e => setForm({ ...form, seoDescription: e.target.value })}
                    className="w-full border border-neutral-300 rounded-sm px-3 py-1.5 text-xs focus:outline-black"
                    placeholder="Meta description for search engines..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};
