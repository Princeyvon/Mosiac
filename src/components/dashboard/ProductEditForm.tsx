import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductSize, ProductColor } from '../../types';
import { ImageUploadField } from './ImageUploadField';
import { removeImageBackgroundInBrowser } from '../../utils/imageProcessing';
import { CustomSelect } from '../common/CustomSelect';
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
  Clipboard,
  Link2,
  Palette,
  ExternalLink,
  Layers,
  Scissors,
  Wand2,
  Loader2,
  Scale
} from 'lucide-react';

interface ProductEditFormProps {
  productId: string;
}

export const ProductEditForm: React.FC<ProductEditFormProps> = ({ productId }) => {
  const {
    stagedProducts,
    saveProductDraft,
    setEditingProductId,
    formatPrice,
    showToast,
    collections,
    shapes,
    calculateWeight,
    weightFormula
  } = useStore();

  const originalProduct = stagedProducts.find(p => p.id === productId);

  if (!originalProduct) {
    return (
      <div className="p-8 text-center">
        <p className="text-neutral-500">Product not found.</p>
        <button
          type="button"
          onClick={() => {
            try {
              sessionStorage.removeItem('mosiac_editing_product_id');
            } catch {}
            setEditingProductId(null);
          }}
          className="mt-4 px-4 py-2 bg-black text-white text-xs uppercase tracking-wider rounded-full"
        >
          Return to Catalogue
        </button>
      </div>
    );
  }

  // Restore unsaved work if browser was refreshed while editing
  const [form, setForm] = useState<Product>(() => {
    try {
      const draft = sessionStorage.getItem(`mosiac_edit_draft_${productId}`);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed && parsed.id === productId) {
          return { ...originalProduct, ...parsed };
        }
      }
    } catch {}
    return { ...originalProduct };
  });

  // Preserve in-progress edits across page refreshes
  useEffect(() => {
    try {
      sessionStorage.setItem(`mosiac_edit_draft_${productId}`, JSON.stringify(form));
      sessionStorage.setItem('mosiac_editing_product_id', productId);
    } catch {}
  }, [form, productId]);

  // Keyboard shortcut Ctrl+S / Cmd+S to save and publish
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProductDraft(form, true);
        try {
          sessionStorage.removeItem(`mosiac_edit_draft_${productId}`);
          sessionStorage.removeItem('mosiac_editing_product_id');
        } catch {}
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [form, productId, saveProductDraft]);
  const [newTagInput, setNewTagInput] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#222222');
  const [newColorImageUrl, setNewColorImageUrl] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [showAddGalleryInput, setShowAddGalleryInput] = useState(false);
  const [activePickerColorId, setActivePickerColorId] = useState<string | null>(null);
  const [pickerCustomUrl, setPickerCustomUrl] = useState('');

  // All available product media gathered from card, hover, and gallery images
  const allAvailableImages = Array.from(
    new Set([form.cardImage, form.hoverImage, ...form.galleryImages].filter(Boolean) as string[])
  );

  // Collapsible sections (default expanded as requested)
  const [sectionsOpen, setSectionsOpen] = useState({
    specs: true,
    variants: true,
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

  // Colours and Variant Image linking management
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const newColor: ProductColor = {
      id: 'c-' + Date.now().toString().slice(-4),
      name: newColorName.trim(),
      hex: newColorHex,
      image: newColorImageUrl.trim() || undefined
    };
    setForm(prev => ({ ...prev, colours: [...prev.colours, newColor] }));
    setNewColorName('');
    setNewColorImageUrl('');
    showToast(`Added variant: ${newColor.name}`);
  };

  const handleUpdateColor = (id: string, updates: Partial<ProductColor>) => {
    setForm(prev => ({
      ...prev,
      colours: prev.colours.map(c => (c.id === id ? { ...c, ...updates } : c))
    }));
  };

  const handleSetColorImage = (colorId: string, imageUrl: string) => {
    setForm(prev => ({
      ...prev,
      colours: prev.colours.map(c => (c.id === colorId ? { ...c, image: imageUrl } : c))
    }));
    setActivePickerColorId(null);
    showToast('Variant image linked successfully');
  };

  const handleRemoveColorImage = (colorId: string) => {
    setForm(prev => ({
      ...prev,
      colours: prev.colours.map(c => (c.id === colorId ? { ...c, image: undefined } : c))
    }));
    showToast('Unlinked variant image');
  };

  const handleSetAsPrimaryCardImage = (imageUrl: string) => {
    setForm(prev => ({ ...prev, cardImage: imageUrl }));
    showToast('Set as primary storefront card image');
  };

  const handleAutoMapVariantsToImages = () => {
    if (!form.colours || form.colours.length === 0) return;
    setForm(prev => {
      const available = [prev.cardImage, prev.hoverImage, ...prev.galleryImages].filter(Boolean) as string[];
      const mapped = prev.colours.map((c, idx) => ({
        ...c,
        image: c.image || available[idx] || prev.cardImage
      }));
      return { ...prev, colours: mapped };
    });
    showToast('Auto-linked images across all variants');
  };

  const handleRemoveColor = (id: string) => {
    setForm(prev => ({ ...prev, colours: prev.colours.filter(c => c.id !== id) }));
  };

  // Gallery management
  const [isProcessingGalleryCutout, setIsProcessingGalleryCutout] = useState(false);
  const [autoCutoutGalleryUploads, setAutoCutoutGalleryUploads] = useState(true);

  const handleAddGalleryImage = async (url: string) => {
    if (!url.trim()) return;
    if (autoCutoutGalleryUploads) {
      try {
        setIsProcessingGalleryCutout(true);
        const cutout = await removeImageBackgroundInBrowser(url.trim(), {
          tolerance: 26,
          cropToContent: true,
          smoothEdges: true
        });
        setForm(prev => ({ ...prev, galleryImages: [...prev.galleryImages, cutout] }));
        showToast('Angle uploaded with background removed');
      } catch {
        setForm(prev => ({ ...prev, galleryImages: [...prev.galleryImages, url.trim()] }));
      } finally {
        setIsProcessingGalleryCutout(false);
      }
    } else {
      setForm(prev => ({ ...prev, galleryImages: [...prev.galleryImages, url.trim()] }));
    }
    setNewGalleryUrl('');
    setShowAddGalleryInput(false);
  };

  const handleCutoutSingleGalleryImage = async (index: number) => {
    const targetUrl = form.galleryImages[index];
    if (!targetUrl) return;
    try {
      setIsProcessingGalleryCutout(true);
      const cutout = await removeImageBackgroundInBrowser(targetUrl, {
        tolerance: 26,
        cropToContent: true,
        smoothEdges: true
      });
      setForm(prev => {
        const next = [...prev.galleryImages];
        next[index] = cutout;
        return { ...prev, galleryImages: next };
      });
      showToast(`Background removed for gallery angle #${index + 1}`);
    } catch {
      showToast('Could not process background removal for this angle');
    } finally {
      setIsProcessingGalleryCutout(false);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setForm(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) }));
  };

  // Sizes, Pricing, and Weight Table management
  const handleAddSize = () => {
    const width = 200;
    const depth = 200;
    const newSize: ProductSize = {
      id: 's-' + Date.now().toString().slice(-4),
      label: 'M',
      width,
      depth,
      price: form.fromPrice || 1850,
      weight: calculateWeight(width, depth, form.shape, form.material)
    };
    setForm(prev => ({ ...prev, sizes: [...prev.sizes, newSize] }));
  };

  const handleAddSpecificSize = (label: 'S' | 'M' | 'L' | 'XL') => {
    const defaults = {
      S: { width: 150, depth: 150, price: form.fromPrice || 1850 },
      M: { width: 200, depth: 200, price: Math.round((form.fromPrice || 1850) * 1.45) },
      L: { width: 250, depth: 250, price: Math.round((form.fromPrice || 1850) * 2.05) },
      XL: { width: 300, depth: 300, price: Math.round((form.fromPrice || 1850) * 2.75) },
    }[label];

    const newSize: ProductSize = {
      id: 's-' + label.toLowerCase() + '-' + Date.now().toString().slice(-4),
      label,
      width: defaults.width,
      depth: defaults.depth,
      price: defaults.price,
      weight: calculateWeight(defaults.width, defaults.depth, form.shape, form.material)
    };
    setForm(prev => ({ ...prev, sizes: [...prev.sizes, newSize] }));
  };

  const handleApplyStandardSizes = () => {
    const base = form.fromPrice || 1850;
    const stdSizes: ProductSize[] = [
      { id: 's-s-' + Date.now(), label: 'S', width: 150, depth: 150, price: base, weight: calculateWeight(150, 150, form.shape, form.material) },
      { id: 's-m-' + Date.now(), label: 'M', width: 200, depth: 200, price: Math.round(base * 1.45), weight: calculateWeight(200, 200, form.shape, form.material) },
      { id: 's-l-' + Date.now(), label: 'L', width: 250, depth: 250, price: Math.round(base * 2.05), weight: calculateWeight(250, 250, form.shape, form.material) },
      { id: 's-xl-' + Date.now(), label: 'XL', width: 300, depth: 300, price: Math.round(base * 2.75), weight: calculateWeight(300, 300, form.shape, form.material) },
    ];
    setForm(prev => ({ ...prev, sizes: stdSizes }));
    showToast('Applied standard S, M, L, XL sizes with dynamic weights');
  };

  const handleRecalculateAllWeights = () => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.map(sz => ({
        ...sz,
        weight: calculateWeight(sz.width, sz.depth, form.shape, form.material)
      }))
    }));
    showToast('Recalculated all sizes using studio weight formula');
  };

  const handleUpdateSize = (index: number, field: keyof ProductSize, value: any) => {
    setForm(prev => {
      const nextSizes = [...prev.sizes];
      const target = { ...nextSizes[index], [field]: value };

      // Auto update weight when width or depth changes using studio weight formula
      if (field === 'width' || field === 'depth') {
        const w = field === 'width' ? Number(value) : target.width;
        const d = field === 'depth' ? Number(value) : target.depth;
        target.weight = calculateWeight(w, d, form.shape, form.material);
      }

      nextSizes[index] = target;
      return { ...prev, sizes: nextSizes };
    });
  };

  const handleRemoveSize = (index: number) => {
    setForm(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }));
  };

  const handleSave = (e?: React.FormEvent, publishLive: boolean = true) => {
    if (e) e.preventDefault();
    saveProductDraft(form, publishLive);
    try {
      sessionStorage.removeItem(`mosiac_edit_draft_${productId}`);
      sessionStorage.removeItem('mosiac_editing_product_id');
    } catch {}
  };

  const handleCancel = () => {
    try {
      sessionStorage.removeItem(`mosiac_edit_draft_${productId}`);
      sessionStorage.removeItem('mosiac_editing_product_id');
    } catch {}
    setEditingProductId(null);
  };

  return (
    <form onSubmit={(e) => handleSave(e, true)} className="space-y-8 max-w-7xl mx-auto pb-16">
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

        {/* Top-right Cancel + Save Draft + Publish Changes buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-[11px] uppercase tracking-wider font-semibold rounded-full border border-neutral-300 text-neutral-700 hover:border-black hover:text-black transition-colors"
          >
            Cancel
          </button>
          <button
            id="dash-save-draft-btn"
            type="button"
            onClick={() => handleSave(undefined, false)}
            className="px-4 py-2 text-[11px] uppercase tracking-wider font-semibold rounded-full border border-neutral-800 text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            Save Draft
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
                    <CustomSelect
                      value={form.collection}
                      onChange={val => setForm({ ...form, collection: val })}
                      options={[
                        ...collections.map(c => ({ value: c.name, label: c.name })),
                        ...(form.collection && !collections.some(c => c.name === form.collection)
                          ? [{ value: form.collection, label: form.collection }]
                          : [])
                      ]}
                      buttonClassName="py-2 px-3 text-xs bg-white border-neutral-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1.5">
                      Shape / Style
                    </label>
                    <CustomSelect
                      value={form.shape}
                      onChange={val => setForm({ ...form, shape: val })}
                      options={[
                        ...shapes.map(s => ({ value: s.name, label: s.name })),
                        ...(form.shape && !shapes.some(s => s.name === form.shape)
                          ? [{ value: form.shape, label: form.shape }]
                          : [])
                      ]}
                      buttonClassName="py-2 px-3 text-xs bg-white border-neutral-300"
                    />
                  </div>
                </div>

                {/* Availability & Lead Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 mb-1.5">
                      Availability
                    </label>
                    <CustomSelect
                      value={form.availability}
                      onChange={val => {
                        setForm({ ...form, availability: val as any, fulfilment: val as any });
                      }}
                      options={[
                        { value: 'Made to order', label: 'Made to order' },
                        { value: 'In stock', label: 'In stock' },
                        { value: 'Sold out', label: 'Sold out' },
                      ]}
                      buttonClassName="py-2 px-3 text-xs bg-white border-neutral-300 font-medium"
                    />
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

              </div>
            )}
          </div>

          {/* Colourways, Swatches & Linked Variant Imagery (Dedicated Section) */}
          <div className="bg-white p-6 border border-neutral-200 rounded-sm space-y-4">
            <div
              onClick={() => toggleSection('variants')}
              className="flex items-center justify-between border-b border-neutral-100 pb-2 cursor-pointer select-none group"
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-neutral-700" />
                <h2 className="text-[12px] uppercase tracking-wider font-bold text-neutral-900 group-hover:text-black">
                  Colourways & Linked Variant Imagery ({form.colours.length})
                </h2>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAutoMapVariantsToImages();
                  }}
                  className="text-[9px] uppercase tracking-wider font-semibold px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-sm text-neutral-700 transition-colors cursor-pointer"
                  title="Automatically match gallery photos to each variant"
                >
                  Auto-Map Images
                </button>
                <div className="text-neutral-400 group-hover:text-black">
                  {sectionsOpen.variants ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {sectionsOpen.variants && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Link distinct imagery and swatches to each edition. When visitors browse the <strong>Variants View</strong> or tap a swatch on the storefront <strong>PDP</strong>, the carousel and gallery immediately transition to display that edition&apos;s linked imagery.
                </p>

                {/* List of Configured Color Variants */}
                <div className="space-y-2.5">
                  {form.colours.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-neutral-50/80 border border-neutral-200 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group hover:border-neutral-300 transition-colors"
                    >
                      {/* Left: Swatch picker & Label & Hex */}
                      <div className="flex items-center gap-2.5 min-w-[200px] flex-1">
                        {/* Swatch & Live Hex input */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="color"
                            value={c.hex}
                            onChange={e => handleUpdateColor(c.id, { hex: e.target.value })}
                            className="w-7 h-7 p-0.5 border border-neutral-300 rounded-sm cursor-pointer"
                            title="Change swatch colour"
                          />
                          <input
                            type="text"
                            value={c.hex}
                            onChange={e => handleUpdateColor(c.id, { hex: e.target.value })}
                            className="w-16 border border-neutral-300 rounded-sm px-1.5 py-1 text-[10px] font-mono text-neutral-600 focus:outline-black uppercase"
                          />
                        </div>

                        {/* Variant Name input */}
                        <input
                          type="text"
                          value={c.name}
                          onChange={e => handleUpdateColor(c.id, { name: e.target.value })}
                          className="flex-1 border border-neutral-300 rounded-sm px-2.5 py-1 text-xs font-medium text-neutral-900 focus:outline-black bg-white"
                          placeholder="Edition name"
                        />
                      </div>

                      {/* Right: Linked Image Preview & Quick Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        {c.image ? (
                          <div className="flex items-center gap-2 bg-white border border-neutral-200 p-1 rounded-sm shadow-2xs">
                            <div className="w-10 h-10 rounded-xs bg-neutral-100 overflow-hidden border border-neutral-200 shrink-0">
                              <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col gap-0.5 pr-1">
                              <span className="text-[9px] uppercase font-mono tracking-tight text-emerald-700 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Linked Image
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setActivePickerColorId(c.id)}
                                  className="text-[9px] text-neutral-600 hover:text-black underline cursor-pointer"
                                >
                                  Change
                                </button>
                                {c.image !== form.cardImage && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetAsPrimaryCardImage(c.image!)}
                                    className="text-[9px] text-neutral-500 hover:text-black cursor-pointer"
                                    title="Make this variant's image the storefront card image"
                                  >
                                    Set as Card
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveColorImage(c.id)}
                                  className="text-[9px] text-red-500 hover:text-red-700 cursor-pointer"
                                >
                                  Unlink
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActivePickerColorId(c.id)}
                            className="inline-flex items-center gap-1.5 border border-dashed border-neutral-300 hover:border-black bg-white px-2.5 py-1.5 rounded-sm text-[10px] text-neutral-600 hover:text-black transition-colors cursor-pointer"
                          >
                            <Link2 className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Link Variant Image</span>
                          </button>
                        )}

                        {/* Delete variant */}
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(c.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer ml-1"
                          title="Delete variant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Variant Form */}
                <div className="p-3 bg-neutral-100/70 border border-neutral-200 rounded-sm space-y-2">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-700">
                    Add New Colourway Edition
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={e => setNewColorHex(e.target.value)}
                      className="w-8 h-8 p-0.5 border border-neutral-300 rounded-sm cursor-pointer"
                      title="Select hex"
                    />
                    <input
                      type="text"
                      value={newColorHex}
                      onChange={e => setNewColorHex(e.target.value)}
                      className="w-18 border border-neutral-300 rounded-sm px-2 py-1.5 text-xs font-mono uppercase bg-white focus:outline-black"
                    />
                    <input
                      type="text"
                      value={newColorName}
                      onChange={e => setNewColorName(e.target.value)}
                      className="flex-1 min-w-[130px] border border-neutral-300 rounded-sm px-3 py-1.5 text-xs bg-white focus:outline-black"
                      placeholder="Colourway label (e.g. Basalt & Bronze)"
                    />
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-3 py-1.5 text-[10px] uppercase font-semibold bg-black text-white hover:bg-neutral-800 rounded-sm transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Edition</span>
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
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-neutral-700" />
                <h2 className="text-[12px] uppercase tracking-wider font-bold text-neutral-900 group-hover:text-black">
                  Imagery & 360° Turntable Gallery
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {/* Quick Craiyon Remover Web Link */}
                <a
                  href="https://www.craiyon.com/en/background-remover"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  title="Open Craiyon AI Background Remover in new tab to format photos uniformly"
                  className="inline-flex items-center gap-1 text-[9px] uppercase font-mono tracking-wider font-semibold px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-sm transition-colors cursor-pointer border border-neutral-200"
                >
                  <Wand2 className="w-2.5 h-2.5 text-neutral-600" />
                  <span>Craiyon BG Remover</span>
                  <ExternalLink className="w-2.5 h-2.5 text-neutral-400" />
                </a>
                <div className="text-neutral-400 group-hover:text-black">
                  {sectionsOpen.media ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {sectionsOpen.media && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Craiyon Tool Info Banner & Automatic Process Guide */}
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-neutral-700" />
                      <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-900">
                        Uniform Rug Background Isolation
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 leading-relaxed max-w-xl">
                      Uploads can run through automatic edge cutout by default, stripping floors and room surroundings to present pristine rug silhouettes. Use the quick link to open <strong>Craiyon AI Background Remover</strong> for cloud batch processing.
                    </p>
                  </div>
                  <a
                    href="https://www.craiyon.com/en/background-remover"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white hover:bg-neutral-800 text-[9px] uppercase font-semibold tracking-wider rounded-sm shrink-0 transition-colors"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Open Craiyon</span>
                    <ExternalLink className="w-2.5 h-2.5 text-white/70" />
                  </a>
                </div>

                {/* Grid & Hover Image Slots with Clipboard & Upload support */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ImageUploadField
                    label="Card Image (Grid tile)"
                    value={form.cardImage}
                    onChange={url => setForm(prev => ({ ...prev, cardImage: url }))}
                    aspectRatio="square"
                    helperText="Primary storefront visual asset"
                    autoRemoveBgDefault={true}
                  />

                  <ImageUploadField
                    label="Hover Image (Swap on hover)"
                    value={form.hoverImage || ''}
                    onChange={url => setForm(prev => ({ ...prev, hoverImage: url }))}
                    aspectRatio="square"
                    helperText="Secondary angle shown on mouse hover"
                    autoRemoveBgDefault={true}
                  />
                </div>

                {/* Product Page Gallery (Feeds PDP turntable) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-700">
                        Product Page Gallery ({form.galleryImages.length} angles)
                      </label>
                      <p className="text-[10px] text-neutral-400">
                        Upload or paste angles to power the storefront Drag-to-Rotate 360° viewer.
                      </p>
                    </div>

                    {/* Auto-cutout toggle for gallery angles */}
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-mono text-neutral-600 cursor-pointer select-none bg-neutral-100 px-2 py-1 rounded-sm border border-neutral-200">
                        <input
                          type="checkbox"
                          checked={autoCutoutGalleryUploads}
                          onChange={e => setAutoCutoutGalleryUploads(e.target.checked)}
                          className="w-3 h-3 text-black rounded-xs border-neutral-300 focus:ring-0 cursor-pointer"
                        />
                        <span>Auto-cutout angles on upload</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                    {form.galleryImages.map((url, idx) => {
                      const linkedColor = form.colours.find(c => c.image === url);
                      return (
                        <div key={idx} className="flex flex-col">
                          <div className="group relative aspect-square bg-neutral-100 border border-neutral-200 rounded-sm overflow-hidden bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:8px_8px]">
                            <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-contain p-1" />
                            <span className="absolute bottom-0.5 left-1 text-[8px] font-mono text-white bg-black/60 px-1 rounded-xs pointer-events-none">
                              #{idx + 1}
                            </span>
                            {linkedColor && (
                              <span className="absolute top-0.5 left-0.5 flex items-center gap-1 bg-black/85 text-white text-[7px] font-mono px-1 py-0.5 rounded-xs pointer-events-none max-w-[85%]">
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0 border border-white/40"
                                  style={{ backgroundColor: linkedColor.hex }}
                                />
                                <span className="truncate">{linkedColor.name}</span>
                              </span>
                            )}
                            
                            {/* Hover Actions: Cutout background or delete */}
                            <div className="absolute top-0.5 right-0.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleCutoutSingleGalleryImage(idx)}
                                className="p-1 bg-black/80 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                                title="Remove background for this angle"
                              >
                                <Scissors className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                className="p-1 bg-black/80 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                                title="Delete from gallery"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>

                          {/* Quick link variant dropdown */}
                          <div className="mt-1">
                            <CustomSelect
                              value={linkedColor?.id || ''}
                              onChange={selId => {
                                if (selId) {
                                  handleSetColorImage(selId, url);
                                } else if (linkedColor) {
                                  handleRemoveColorImage(linkedColor.id);
                                }
                              }}
                              options={[
                                { value: '', label: 'Link Variant...' },
                                ...form.colours.map(c => ({ value: c.id, label: c.name }))
                              ]}
                              buttonClassName="py-0.5 px-1 text-[9px] font-mono bg-white border-neutral-200"
                            />
                          </div>
                        </div>
                      );
                    })}

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
                      <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
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

                        <a
                          href="https://www.craiyon.com/en/background-remover"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[9px] uppercase font-mono text-neutral-500 hover:text-black transition-colors ml-auto"
                        >
                          <Wand2 className="w-2.5 h-2.5" />
                          <span>Craiyon Remover</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
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
                  Available Sizing (S, M, L, XL) & Weight
                </h2>
                <p className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  <span>Managed by Studio Admin · Automatically reflected on Storefront S, M, L, XL selector</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-neutral-400 group-hover:text-black">
                  {sectionsOpen.sizing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {sectionsOpen.sizing && (
              <div className="space-y-3 animate-in fade-in duration-150">
                {/* Admin Quick Sizing Presets Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-neutral-50 border border-neutral-200 rounded-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">Quick Add:</span>
                    {(['S', 'M', 'L', 'XL'] as const).map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleAddSpecificSize(sz)}
                        className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white hover:bg-black hover:text-white border border-neutral-300 rounded-sm transition-colors cursor-pointer"
                        title={`Add ${sz} standard size`}
                      >
                        +{sz}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRecalculateAllWeights}
                      className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-neutral-700 hover:text-black hover:underline cursor-pointer font-medium"
                      title="Apply current store weight formula to all sizes"
                    >
                      <Scale className="w-3 h-3 text-neutral-500" />
                      <span>Recalculate Weights</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyStandardSizes}
                      className="text-[10px] font-mono uppercase tracking-wider text-neutral-700 hover:text-black hover:underline cursor-pointer font-medium"
                    >
                      Reset to Standard (S, M, L, XL)
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] text-left">
                    <thead>
                      <tr className="border-b border-neutral-200 text-neutral-400 font-mono text-[9px] uppercase tracking-wider">
                        <th className="pb-2">Size (S, M, L, XL)</th>
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
                          <td className="py-2 pr-2 w-32">
                            <CustomSelect
                              value={size.label}
                              onChange={val => handleUpdateSize(idx, 'label', val)}
                              options={[
                                { value: 'S', label: 'S (Small)' },
                                { value: 'M', label: 'M (Medium)' },
                                { value: 'L', label: 'L (Large)' },
                                { value: 'XL', label: 'XL (Extra Large)' },
                                { value: 'Custom', label: 'Custom' },
                              ]}
                              buttonClassName="py-1 px-2 text-[11px] font-mono font-bold bg-white border-neutral-200"
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

      {/* Modal: Link Image to Variant */}
      {activePickerColorId && (() => {
        const targetColor = form.colours.find(c => c.id === activePickerColorId);
        if (!targetColor) return null;
        return (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white max-w-lg w-full rounded-sm border border-neutral-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                    style={{ backgroundColor: targetColor.hex }}
                  />
                  <div>
                    <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-900">
                      Link Image to Variant: {targetColor.name}
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      Select an image from this product or upload a new photo
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePickerColorId(null)}
                  className="p-1 text-neutral-400 hover:text-black cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4">
                {/* 1. Pick from Existing Product Media */}
                <div>
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-neutral-700 mb-2">
                    Available Product Images ({allAvailableImages.length})
                  </div>
                  {allAvailableImages.length === 0 ? (
                    <p className="text-xs text-neutral-400 py-3">No images uploaded for this product yet.</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {allAvailableImages.map((imgUrl, i) => {
                        const isSelected = targetColor.image === imgUrl;
                        return (
                          <div
                            key={i}
                            onClick={() => handleSetColorImage(targetColor.id, imgUrl)}
                            className={`group relative aspect-square rounded-sm overflow-hidden border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-black ring-2 ring-black/20'
                                : 'border-neutral-200 hover:border-neutral-400'
                            }`}
                          >
                            <img src={imgUrl} alt={`Option ${i + 1}`} className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-black/35 flex items-center justify-center text-white">
                                <Check className="w-5 h-5" />
                              </div>
                            )}
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-mono text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to link
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Upload New Image or Paste URL */}
                <div className="pt-3 border-t border-neutral-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] uppercase font-semibold tracking-wider text-neutral-700">
                      Upload or Paste Image for this Variant
                    </div>
                    <a
                      href="https://www.craiyon.com/en/background-remover"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[9px] uppercase font-mono text-neutral-500 hover:text-black transition-colors"
                      title="Open Craiyon AI Background Remover"
                    >
                      <Wand2 className="w-2.5 h-2.5" />
                      <span>Craiyon Remover</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pickerCustomUrl}
                      onChange={e => setPickerCustomUrl(e.target.value)}
                      placeholder="Paste image URL..."
                      className="flex-1 border border-neutral-300 rounded-sm px-2.5 py-1.5 text-xs font-mono focus:outline-black"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (pickerCustomUrl.trim()) {
                          try {
                            const cutout = await removeImageBackgroundInBrowser(pickerCustomUrl.trim());
                            handleSetColorImage(targetColor.id, cutout);
                            if (!form.galleryImages.includes(cutout)) {
                              handleAddGalleryImage(cutout);
                            }
                          } catch {
                            handleSetColorImage(targetColor.id, pickerCustomUrl.trim());
                          }
                          setPickerCustomUrl('');
                        }
                      }}
                      className="px-3 py-1.5 bg-black text-white text-[10px] uppercase font-semibold tracking-wider rounded-sm cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] uppercase tracking-wider font-semibold rounded-sm cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload & Auto-Cutout</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const r = new FileReader();
                            r.onload = async () => {
                              if (typeof r.result === 'string') {
                                try {
                                  const cutout = await removeImageBackgroundInBrowser(r.result);
                                  handleSetColorImage(targetColor.id, cutout);
                                  if (!form.galleryImages.includes(cutout)) {
                                    handleAddGalleryImage(cutout);
                                  }
                                } catch {
                                  handleSetColorImage(targetColor.id, r.result);
                                }
                              }
                            };
                            r.readAsDataURL(f);
                          }
                        }}
                      />
                    </label>

                    {targetColor.image && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (targetColor.image) {
                            try {
                              const cutout = await removeImageBackgroundInBrowser(targetColor.image);
                              handleSetColorImage(targetColor.id, cutout);
                              showToast('Background cleared from current variant image');
                            } catch {
                              showToast('Could not cutout this image');
                            }
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-[10px] uppercase font-semibold tracking-wider rounded-sm cursor-pointer"
                      >
                        <Scissors className="w-3 h-3" />
                        <span>Cutout Current</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
                {targetColor.image ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleRemoveColorImage(targetColor.id);
                      setActivePickerColorId(null);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    Unlink Image
                  </button>
                ) : <span />}
                <button
                  type="button"
                  onClick={() => setActivePickerColorId(null)}
                  className="px-4 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-[10px] uppercase font-semibold tracking-wider rounded-sm cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Sticky Bottom Bar for Quick Saving & Refreshed State Visibility */}
      <div className="sticky bottom-4 z-40 bg-neutral-900/90 text-white backdrop-blur-md px-6 py-3.5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-neutral-700/50">
        <div className="flex items-center gap-2 text-xs text-neutral-300">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Changes are saved permanently · Press <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px] font-mono text-neutral-200">⌘S</kbd> / <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px] font-mono text-neutral-200">Ctrl+S</kbd> to publish</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-1.5 text-[11px] uppercase tracking-wider font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave(undefined, false)}
            className="px-4 py-1.5 text-[11px] uppercase tracking-wider font-medium rounded-full bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600 transition-colors cursor-pointer"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave(undefined, true)}
            className="inline-flex items-center gap-2 px-5 py-1.5 text-[11px] uppercase tracking-wider font-semibold rounded-full bg-white text-black hover:bg-neutral-100 transition-colors shadow-sm cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Publish Changes</span>
          </button>
        </div>
      </div>
    </form>
  );
};
