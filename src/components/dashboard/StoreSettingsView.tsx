import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CustomSelect } from '../common/CustomSelect';
import { CollectionItem, ShapeItem, StyleItem, SizingGuideSizeRow } from '../../types';
import {
  Settings,
  FolderPlus,
  Layers,
  Ruler,
  Scale,
  Plus,
  Trash2,
  Edit2,
  Check,
  Save,
  RotateCcw,
  Sparkles,
  Calculator,
  RefreshCw,
  Info,
  ChevronRight,
  Eye,
  Sliders,
  Home,
  Bed,
  UtensilsCrossed,
  Coffee
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const StoreSettingsView: React.FC = () => {
  const {
    collections,
    addCollection,
    updateCollection,
    deleteCollection,
    shapes,
    addShape,
    updateShape,
    deleteShape,
    styles,
    addStyle,
    updateStyle,
    deleteStyle,
    weightFormula,
    updateWeightFormula,
    recalculateAllProductWeights,
    sizingGuideConfig,
    updateSizingGuideConfig,
    calculateWeight,
    showToast,
    currentPermissions
  } = useStore();

  const [activeTab, setActiveTab] = useState<'collections' | 'shapes' | 'sizing' | 'weight'>('collections');

  // Permission check
  const canManage = currentPermissions.canManageStoreSettings;

  // COLLECTIONS STATE
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editColName, setEditColName] = useState('');
  const [editColDesc, setEditColDesc] = useState('');

  // SHAPES STATE
  const [newShapeName, setNewShapeName] = useState('');
  const [newShapeDesc, setNewShapeDesc] = useState('');
  const [newShapeAspect, setNewShapeAspect] = useState('');
  const [newShapeGuidance, setNewShapeGuidance] = useState('');
  const [editingShapeId, setEditingShapeId] = useState<string | null>(null);
  const [editShapeName, setEditShapeName] = useState('');
  const [editShapeDesc, setEditShapeDesc] = useState('');
  const [editShapeAspect, setEditShapeAspect] = useState('');
  const [editShapeGuidance, setEditShapeGuidance] = useState('');

  // STYLES STATE
  const [newStyleName, setNewStyleName] = useState('');
  const [newStyleDesc, setNewStyleDesc] = useState('');
  const [newStyleMultiplier, setNewStyleMultiplier] = useState(1.0);
  const [newStylePileMm, setNewStylePileMm] = useState(12);
  const [editingStyleId, setEditingStyleId] = useState<string | null>(null);
  const [editStyleName, setEditStyleName] = useState('');
  const [editStyleDesc, setEditStyleDesc] = useState('');
  const [editStyleMultiplier, setEditStyleMultiplier] = useState(1.0);
  const [editStylePileMm, setEditStylePileMm] = useState(12);

  // SIZING GUIDE LOCAL STATE
  const [guideForm, setGuideForm] = useState({ ...sizingGuideConfig });
  const [selectedShapeTipKey, setSelectedShapeTipKey] = useState<string>(shapes[0]?.name || 'Circular');
  const [currentShapeTipText, setCurrentShapeTipText] = useState(
    sizingGuideConfig.shapeSpecificTips[shapes[0]?.name || 'Circular'] || ''
  );

  // WEIGHT FORMULA TESTER
  const [testWidth, setTestWidth] = useState<number>(200);
  const [testDepth, setTestDepth] = useState<number>(200);
  const [testStyle, setTestStyle] = useState<string>(styles[0]?.name || 'Minimalist Cut-Pile');
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Handle Collections
  const handleAddCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      showToast('You do not have permission to modify store settings');
      return;
    }
    if (!newColName.trim()) return;
    addCollection(newColName.trim(), newColDesc.trim());
    setNewColName('');
    setNewColDesc('');
  };

  const handleStartEditCol = (col: CollectionItem) => {
    setEditingColId(col.id);
    setEditColName(col.name);
    setEditColDesc(col.description);
  };

  const handleSaveCol = (id: string) => {
    if (!canManage) return;
    updateCollection(id, { name: editColName.trim(), description: editColDesc.trim() });
    setEditingColId(null);
  };

  // Handle Shapes
  const handleAddShape = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    if (!newShapeName.trim()) return;
    addShape(newShapeName.trim(), newShapeDesc.trim(), newShapeAspect.trim(), newShapeGuidance.trim());
    setNewShapeName('');
    setNewShapeDesc('');
    setNewShapeAspect('');
    setNewShapeGuidance('');
  };

  const handleStartEditShape = (shape: ShapeItem) => {
    setEditingShapeId(shape.id);
    setEditShapeName(shape.name);
    setEditShapeDesc(shape.description);
    setEditShapeAspect(shape.aspectHint || '');
    setEditShapeGuidance(shape.placementGuidance || '');
  };

  const handleSaveShape = (id: string) => {
    if (!canManage) return;
    updateShape(id, {
      name: editShapeName.trim(),
      description: editShapeDesc.trim(),
      aspectHint: editShapeAspect.trim(),
      placementGuidance: editShapeGuidance.trim()
    });
    setEditingShapeId(null);
  };

  // Handle Styles
  const handleAddStyle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    if (!newStyleName.trim()) return;
    addStyle(newStyleName.trim(), newStyleMultiplier, newStyleDesc.trim(), newStylePileMm);
    setNewStyleName('');
    setNewStyleDesc('');
    setNewStyleMultiplier(1.0);
    setNewStylePileMm(12);
  };

  const handleStartEditStyle = (sty: StyleItem) => {
    setEditingStyleId(sty.id);
    setEditStyleName(sty.name);
    setEditStyleDesc(sty.techniqueDescription);
    setEditStyleMultiplier(sty.densityMultiplier);
    setEditStylePileMm(sty.pileHeightMm || 12);
  };

  const handleSaveStyle = (id: string) => {
    if (!canManage) return;
    updateStyle(id, {
      name: editStyleName.trim(),
      techniqueDescription: editStyleDesc.trim(),
      densityMultiplier: editStyleMultiplier,
      pileHeightMm: editStylePileMm
    });
    setEditingStyleId(null);
  };

  // Handle Sizing Guide Save
  const handleSaveSizingGuide = () => {
    if (!canManage) {
      showToast('You do not have permission to modify store settings');
      return;
    }
    const updatedTips = {
      ...guideForm.shapeSpecificTips,
      [selectedShapeTipKey]: currentShapeTipText
    };
    const finalConfig = {
      ...guideForm,
      shapeSpecificTips: updatedTips
    };
    updateSizingGuideConfig(finalConfig);
    showToast('Sizing guide settings saved successfully');
  };

  // Handle Weight Formula Save
  const handleSaveFormula = (updates: Partial<typeof weightFormula>) => {
    if (!canManage) {
      showToast('Permission denied');
      return;
    }
    updateWeightFormula(updates);
  };

  const handleTriggerRecalculate = () => {
    if (!canManage) {
      showToast('Permission denied');
      return;
    }
    setIsRecalculating(true);
    setTimeout(() => {
      recalculateAllProductWeights();
      setIsRecalculating(false);
      showToast('All product weights recalculated and saved with active formula');
    }, 400);
  };

  // Tested weight calculation
  const calculatedTestWeight = calculateWeight(testWidth, testDepth, testStyle);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
            Studio Core Configuration & Atelier Rules
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Store Settings & Architectural Rules
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage collections, customize shapes & styles, control the sizing guide pop-up, and fine-tune weight measurement formulas.
          </p>
        </div>

        {!canManage && (
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-sm flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>View Only: Director permissions required to edit settings</span>
          </div>
        )}
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-200 pb-px overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('collections')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'collections'
              ? 'border-black text-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>Collections ({collections.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shapes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'shapes'
              ? 'border-black text-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Shapes & Styles</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sizing')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sizing'
              ? 'border-black text-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Sizing Guide Pop-up</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('weight')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'weight'
              ? 'border-black text-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Weight Formula Engine</span>
        </button>
      </div>

      {/* 1. COLLECTIONS TAB */}
      {activeTab === 'collections' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Add Collection Form */}
          {canManage && (
            <form onSubmit={handleAddCollection} className="p-5 bg-white border border-neutral-200 rounded-sm space-y-4 shadow-2xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-neutral-500" />
                <span>Create New Studio Collection</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                    Collection Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newColName}
                    onChange={e => setNewColName(e.target.value)}
                    placeholder="e.g. Sculptural Contours"
                    className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-medium focus:outline-black bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                    Description & Atelier Notes
                  </label>
                  <input
                    type="text"
                    value={newColDesc}
                    onChange={e => setNewColDesc(e.target.value)}
                    placeholder="e.g. Hand-tufted architectural reliefs in botanical bamboo silk."
                    className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Collection</span>
                </button>
              </div>
            </form>
          )}

          {/* Collections List */}
          <div className="bg-white border border-neutral-200 rounded-sm divide-y divide-neutral-100 shadow-2xs overflow-hidden">
            <div className="p-3.5 bg-neutral-50 text-[10px] uppercase font-mono tracking-wider text-neutral-400 grid grid-cols-12">
              <span className="col-span-4">Collection Title</span>
              <span className="col-span-6">Curatorial Scope / Description</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>

            {collections.map(col => {
              const isEditing = editingColId === col.id;

              return (
                <div key={col.id} className="p-4 grid grid-cols-12 items-center gap-3 hover:bg-neutral-50/60 transition-colors">
                  {isEditing ? (
                    <>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={editColName}
                          onChange={e => setEditColName(e.target.value)}
                          className="w-full border border-neutral-400 rounded-sm px-2 py-1 text-xs font-semibold focus:outline-black"
                        />
                      </div>
                      <div className="col-span-6">
                        <input
                          type="text"
                          value={editColDesc}
                          onChange={e => setEditColDesc(e.target.value)}
                          className="w-full border border-neutral-400 rounded-sm px-2 py-1 text-xs focus:outline-black"
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSaveCol(col.id)}
                          className="p-1.5 bg-black text-white rounded-sm hover:bg-neutral-800 text-[10px] uppercase font-medium cursor-pointer"
                          title="Save changes"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingColId(null)}
                          className="p-1.5 border border-neutral-300 rounded-sm text-neutral-600 hover:bg-neutral-100 text-[10px] cursor-pointer"
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-span-4">
                        <span className="font-bold text-xs text-neutral-900 block">{col.name}</span>
                        <span className="font-mono text-[10px] text-neutral-400">slug: {col.slug}</span>
                      </div>
                      <div className="col-span-6 text-xs text-neutral-600 leading-relaxed font-light">
                        {col.description || 'No description provided.'}
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        {canManage && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEditCol(col)}
                              className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer"
                              title="Edit Collection"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove collection "${col.name}"?`)) {
                                  deleteCollection(col.id);
                                }
                              }}
                              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer"
                              title="Delete Collection"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SHAPES & STYLES TAB */}
      {activeTab === 'shapes' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* SECTION 2A: RUG SHAPES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                  Architectural Rug Shapes
                </h2>
                <p className="text-xs text-neutral-500">
                  Control the silhouettes available in product specifications and sizing guide recommendations.
                </p>
              </div>
            </div>

            {canManage && (
              <form onSubmit={handleAddShape} className="p-5 bg-white border border-neutral-200 rounded-sm space-y-4 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Rug Shape Silhouette</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                      Shape Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newShapeName}
                      onChange={e => setNewShapeName(e.target.value)}
                      placeholder="e.g. Asymmetric Hexagonal"
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-medium focus:outline-black bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                      Aspect Ratio Hint
                    </label>
                    <input
                      type="text"
                      value={newShapeAspect}
                      onChange={e => setNewShapeAspect(e.target.value)}
                      placeholder="e.g. 1:1.3 Soft Trapeze"
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                      Shape Description
                    </label>
                    <input
                      type="text"
                      value={newShapeDesc}
                      onChange={e => setNewShapeDesc(e.target.value)}
                      placeholder="e.g. Sculptural polygon with hand-beveled corners."
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                      Interior Placement Guidance (Shown on PDP Sizing Guide)
                    </label>
                    <input
                      type="text"
                      value={newShapeGuidance}
                      onChange={e => setNewShapeGuidance(e.target.value)}
                      placeholder="e.g. Complements angled architectural walls and chaise lounges."
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Shape</span>
                  </button>
                </div>
              </form>
            )}

            {/* Shapes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shapes.map(s => {
                const isEditing = editingShapeId === s.id;

                return (
                  <div key={s.id} className="p-4 bg-white border border-neutral-200 rounded-sm space-y-3 shadow-2xs hover:border-neutral-400 transition-colors">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editShapeName}
                          onChange={e => setEditShapeName(e.target.value)}
                          className="w-full border border-neutral-400 rounded-sm px-2 py-1 text-xs font-bold"
                          placeholder="Shape name"
                        />
                        <input
                          type="text"
                          value={editShapeAspect}
                          onChange={e => setEditShapeAspect(e.target.value)}
                          className="w-full border border-neutral-400 rounded-sm px-2 py-1 text-[11px]"
                          placeholder="Aspect hint"
                        />
                        <textarea
                          value={editShapeDesc}
                          onChange={e => setEditShapeDesc(e.target.value)}
                          rows={2}
                          className="w-full border border-neutral-400 rounded-sm px-2 py-1 text-xs"
                          placeholder="Description"
                        />
                        <textarea
                          value={editShapeGuidance}
                          onChange={e => setEditShapeGuidance(e.target.value)}
                          rows={2}
                          className="w-full border border-neutral-400 rounded-sm px-2 py-1 text-xs"
                          placeholder="Placement guidance"
                        />
                        <div className="flex justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSaveShape(s.id)}
                            className="px-3 py-1 bg-black text-white text-[10px] uppercase font-semibold rounded-sm cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingShapeId(null)}
                            className="px-2 py-1 border border-neutral-300 text-neutral-600 text-[10px] rounded-sm cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-xs text-neutral-900 block">{s.name}</span>
                            <span className="text-[10px] font-mono text-neutral-400 block">{s.aspectHint || '1:1 Geometric'}</span>
                          </div>
                          {canManage && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEditShape(s)}
                                className="p-1 text-neutral-400 hover:text-black rounded cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Remove shape "${s.name}"?`)) deleteShape(s.id);
                                }}
                                className="p-1 text-neutral-300 hover:text-red-600 rounded cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-neutral-600 leading-relaxed font-light">
                          {s.description}
                        </p>

                        {s.placementGuidance && (
                          <div className="p-2.5 bg-neutral-50 border border-neutral-100 rounded-xs text-[11px] text-neutral-700 font-light">
                            <span className="font-semibold text-[10px] uppercase font-mono tracking-wider block text-neutral-500 mb-0.5">
                              Placement Tip:
                            </span>
                            {s.placementGuidance}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2B: PILE TECHNIQUES & STYLES */}
          <div className="space-y-4 pt-4 border-t border-neutral-200">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Tufting Styles & Pile Techniques
              </h2>
              <p className="text-xs text-neutral-500">
                Set pile height, density multipliers (linked directly to the weight formula), and craftsmanship details.
              </p>
            </div>

            {canManage && (
              <form onSubmit={handleAddStyle} className="p-5 bg-white border border-neutral-200 rounded-sm space-y-4 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tufting Technique / Style</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                      Technique / Style Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newStyleName}
                      onChange={e => setNewStyleName(e.target.value)}
                      placeholder="e.g. Sculpted Relief & Cut Loop"
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-medium focus:outline-black bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                      Density Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.5"
                      max="2.5"
                      value={newStyleMultiplier}
                      onChange={e => setNewStyleMultiplier(parseFloat(e.target.value) || 1.0)}
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono focus:outline-black bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                      Pile Height (mm)
                    </label>
                    <input
                      type="number"
                      min="6"
                      max="40"
                      value={newStylePileMm}
                      onChange={e => setNewStylePileMm(parseInt(e.target.value) || 12)}
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono focus:outline-black bg-white"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                      Craftsmanship & Texture Description
                    </label>
                    <input
                      type="text"
                      value={newStyleDesc}
                      onChange={e => setNewStyleDesc(e.target.value)}
                      placeholder="e.g. Dual-depth hand shearing delivering dramatic tactile shadow lines under natural light."
                      className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Style</span>
                  </button>
                </div>
              </form>
            )}

            {/* Styles Table */}
            <div className="bg-white border border-neutral-200 rounded-sm divide-y divide-neutral-100 shadow-2xs overflow-hidden">
              <div className="p-3.5 bg-neutral-50 text-[10px] uppercase font-mono tracking-wider text-neutral-400 grid grid-cols-12">
                <span className="col-span-3">Style / Technique</span>
                <span className="col-span-5">Texture & Finishing</span>
                <span className="col-span-2 text-center">Pile Height</span>
                <span className="col-span-2 text-right">Density Multiplier</span>
              </div>

              {styles.map(sty => {
                const isEditing = editingStyleId === sty.id;

                return (
                  <div key={sty.id} className="p-4 grid grid-cols-12 items-center gap-3 hover:bg-neutral-50/60 transition-colors">
                    {isEditing ? (
                      <>
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={editStyleName}
                            onChange={e => setEditStyleName(e.target.value)}
                            className="w-full border border-neutral-400 rounded-sm px-2 py-1 text-xs font-semibold"
                          />
                        </div>
                        <div className="col-span-5">
                          <input
                            type="text"
                            value={editStyleDesc}
                            onChange={e => setEditStyleDesc(e.target.value)}
                            className="w-full border border-neutral-400 rounded-sm px-2 py-1 text-xs"
                          />
                        </div>
                        <div className="col-span-2 text-center">
                          <input
                            type="number"
                            value={editStylePileMm}
                            onChange={e => setEditStylePileMm(parseInt(e.target.value) || 12)}
                            className="w-16 mx-auto border border-neutral-400 rounded-sm px-2 py-1 text-xs text-center"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <input
                            type="number"
                            step="0.05"
                            value={editStyleMultiplier}
                            onChange={e => setEditStyleMultiplier(parseFloat(e.target.value) || 1.0)}
                            className="w-16 border border-neutral-400 rounded-sm px-2 py-1 text-xs text-right font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveStyle(sty.id)}
                            className="p-1 bg-black text-white rounded text-xs cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-span-3">
                          <span className="font-bold text-xs text-neutral-900 block">{sty.name}</span>
                          <span className="text-[10px] font-mono text-neutral-400">slug: {sty.slug}</span>
                        </div>
                        <div className="col-span-5 text-xs text-neutral-600 font-light leading-relaxed">
                          {sty.techniqueDescription}
                        </div>
                        <div className="col-span-2 text-center font-mono text-xs text-neutral-800">
                          {sty.pileHeightMm || 12} mm
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-3">
                          <span className="px-2 py-0.5 rounded-xs font-mono text-xs font-bold bg-neutral-100 text-neutral-800">
                            {sty.densityMultiplier}×
                          </span>
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => handleStartEditStyle(sty)}
                              className="p-1 text-neutral-400 hover:text-black rounded cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. SIZING GUIDE CUSTOMIZER TAB */}
      {activeTab === 'sizing' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-neutral-900 text-white rounded-sm">
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Storefront Sizing Experience Control</span>
              </div>
              <h2 className="text-sm font-semibold">Customize Sizing Pop-up Content & Rules</h2>
              <p className="text-xs text-neutral-400">
                Tailor introductory text, living/bedroom guidance, and specific placement hints per rug style and shape.
              </p>
            </div>

            {canManage && (
              <button
                type="button"
                onClick={handleSaveSizingGuide}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-neutral-100 text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors cursor-pointer shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Sizing Guide</span>
              </button>
            )}
          </div>

          {/* Modal Header & Copy Settings */}
          <div className="p-5 bg-white border border-neutral-200 rounded-sm space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
              Pop-up Title, Eyebrow & Material Summary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                  Eyebrow Label
                </label>
                <input
                  type="text"
                  value={guideForm.eyebrow}
                  onChange={e => setGuideForm(prev => ({ ...prev, eyebrow: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono focus:outline-black bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                  Modal Headline
                </label>
                <input
                  type="text"
                  value={guideForm.headline}
                  onChange={e => setGuideForm(prev => ({ ...prev, headline: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-serif uppercase tracking-wide focus:outline-black bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                  Introductory Atelier Statement
                </label>
                <textarea
                  rows={2}
                  value={guideForm.description}
                  onChange={e => setGuideForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black bg-white"
                />
              </div>
            </div>
          </div>

          {/* Room Placement Guidelines */}
          <div className="p-5 bg-white border border-neutral-200 rounded-sm space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2 flex items-center gap-2">
              <Home className="w-3.5 h-3.5 text-neutral-500" />
              <span>Room Layout Guidance Cards</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Living Room Placement Tip</span>
                </label>
                <textarea
                  rows={3}
                  value={guideForm.livingRoomTip}
                  onChange={e => setGuideForm(prev => ({ ...prev, livingRoomTip: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black bg-white leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Bedroom & Suite Placement Tip</span>
                </label>
                <textarea
                  rows={3}
                  value={guideForm.bedroomTip}
                  onChange={e => setGuideForm(prev => ({ ...prev, bedroomTip: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black bg-white leading-relaxed"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Dining & Open Plan Layout Tip</span>
                </label>
                <textarea
                  rows={2}
                  value={guideForm.diningRoomTip}
                  onChange={e => setGuideForm(prev => ({ ...prev, diningRoomTip: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black bg-white leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Customized Tips per Rug Shape */}
          <div className="p-5 bg-white border border-neutral-200 rounded-sm space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Customized Guidance for Specific Rug Shapes
              </h3>
              <span className="text-[11px] text-neutral-400">
                Displayed dynamically on PDP when viewing a rug of this shape
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                  Select Shape to Customize
                </label>
                <CustomSelect
                  value={selectedShapeTipKey}
                  onChange={val => {
                    setSelectedShapeTipKey(val);
                    setCurrentShapeTipText(guideForm.shapeSpecificTips[val] || '');
                  }}
                  options={shapes.map(s => ({ value: s.name, label: s.name }))}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                  Shape-Specific Sizing Advice for "{selectedShapeTipKey}"
                </label>
                <textarea
                  rows={3}
                  value={currentShapeTipText}
                  onChange={e => {
                    const txt = e.target.value;
                    setCurrentShapeTipText(txt);
                    setGuideForm(prev => ({
                      ...prev,
                      shapeSpecificTips: {
                        ...prev.shapeSpecificTips,
                        [selectedShapeTipKey]: txt
                      }
                    }));
                  }}
                  placeholder="e.g. Ensure round shape extends 30cm past round coffee table base..."
                  className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black bg-white"
                />
              </div>
            </div>
          </div>

          {/* Sizing Rows Configuration */}
          <div className="p-5 bg-white border border-neutral-200 rounded-sm space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Sizing Comparison Table Rows (S, M, L, XL)
              </h3>
              <span className="text-[11px] text-neutral-400">
                Shown in the modal's architectural comparison matrix
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 font-mono text-[10px] uppercase">
                    <th className="py-2 px-2 w-16">Code</th>
                    <th className="py-2 px-2 w-36">Label / Name</th>
                    <th className="py-2 px-2 w-28">Width (cm)</th>
                    <th className="py-2 px-2 w-28">Depth (cm)</th>
                    <th className="py-2 px-2">Best Placement Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  {guideForm.sizeRows.map((row, idx) => (
                    <tr key={row.id || idx}>
                      <td className="py-2.5 px-2 font-bold">
                        <span className="inline-block w-6 h-6 leading-6 text-center bg-neutral-900 text-white rounded text-[11px]">
                          {row.size}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={e => {
                            const val = e.target.value;
                            setGuideForm(prev => {
                              const next = [...prev.sizeRows];
                              next[idx] = { ...next[idx], name: val };
                              return { ...prev, sizeRows: next };
                            });
                          }}
                          className="w-full border border-neutral-200 rounded-sm px-2 py-1 text-xs font-sans"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={row.widthCm}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 100;
                            setGuideForm(prev => {
                              const next = [...prev.sizeRows];
                              next[idx] = { ...next[idx], widthCm: val };
                              return { ...prev, sizeRows: next };
                            });
                          }}
                          className="w-full border border-neutral-200 rounded-sm px-2 py-1 text-xs"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={row.depthCm}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 100;
                            setGuideForm(prev => {
                              const next = [...prev.sizeRows];
                              next[idx] = { ...next[idx], depthCm: val };
                              return { ...prev, sizeRows: next };
                            });
                          }}
                          className="w-full border border-neutral-200 rounded-sm px-2 py-1 text-xs"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={row.idealFor}
                          onChange={e => {
                            const val = e.target.value;
                            setGuideForm(prev => {
                              const next = [...prev.sizeRows];
                              next[idx] = { ...next[idx], idealFor: val };
                              return { ...prev, sizeRows: next };
                            });
                          }}
                          className="w-full border border-neutral-200 rounded-sm px-2 py-1 text-xs font-sans"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {canManage && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveSizingGuide}
                  className="px-4 py-2 bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                >
                  Save Sizing Guide Updates
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. WEIGHT MEASUREMENT FORMULA ENGINE TAB */}
      {activeTab === 'weight' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Formula Summary Banner */}
          <div className="p-5 bg-neutral-900 text-white rounded-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mathematical Weight Calculation Engine</span>
                </div>
                <h2 className="text-base font-semibold">Weight Measurement Formula & Parameters</h2>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
                  Rug weight is calculated as: <code className="text-amber-300 font-mono text-[11px]">Weight ({weightFormula.unit}) = (Surface Area m² × Base Density) × Style Multiplier × Material Multiplier + Packaging Tare</code>
                </p>
              </div>

              {canManage && (
                <button
                  type="button"
                  disabled={isRecalculating}
                  onClick={handleTriggerRecalculate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-neutral-100 text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
                  <span>Recalculate All Catalogue Weights</span>
                </button>
              )}
            </div>
          </div>

          {/* Formula Parameters Configuration Card */}
          <div className="p-5 bg-white border border-neutral-200 rounded-sm space-y-5 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
              Formula Constants & Factors
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Unit Switcher */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1.5">
                  Measurement Unit
                </label>
                <CustomSelect
                  value={weightFormula.unit}
                  onChange={val => handleSaveFormula({ unit: val as 'kg' | 'lbs' })}
                  options={[
                    { value: 'kg', label: 'Kilograms (kg)' },
                    { value: 'lbs', label: 'Pounds (lbs)' }
                  ]}
                  disabled={!canManage}
                />
                <span className="text-[10px] text-neutral-400 block mt-1">
                  All catalogue sizes and freight weight specs use this unit.
                </span>
              </div>

              {/* Density Constant */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1.5">
                  Base Density (kg per m²)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.05"
                    min="1.0"
                    max="10.0"
                    value={weightFormula.densityKgPerM2}
                    onChange={e => handleSaveFormula({ densityKgPerM2: parseFloat(e.target.value) || 3.45 })}
                    disabled={!canManage}
                    className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono focus:outline-black bg-white"
                  />
                  <span className="text-xs font-mono text-neutral-500 shrink-0">kg/m²</span>
                </div>
                <span className="text-[10px] text-neutral-400 block mt-1">
                  Default: 3.45 kg/m² for high-density 4500 GSM wool tufting.
                </span>
              </div>

              {/* Packaging Tare Weight */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1.5">
                  Packaging & Binding Tare
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.0"
                    max="5.0"
                    value={weightFormula.basePackagingKg}
                    onChange={e => handleSaveFormula({ basePackagingKg: parseFloat(e.target.value) || 0.8 })}
                    disabled={!canManage}
                    className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono focus:outline-black bg-white"
                  />
                  <span className="text-xs font-mono text-neutral-500 shrink-0">kg</span>
                </div>
                <span className="text-[10px] text-neutral-400 block mt-1">
                  Protective cotton binding, structural core tube & outer wrap.
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Formula Playground / Tester */}
          <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-neutral-600" />
                <span>Live Interactive Formula Simulation</span>
              </h3>
              <span className="text-[11px] font-mono text-neutral-500">
                Instantly inspect math before applying to live catalogue
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                  Rug Width (cm)
                </label>
                <input
                  type="number"
                  value={testWidth}
                  onChange={e => setTestWidth(parseInt(e.target.value) || 100)}
                  className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                  Rug Depth (cm)
                </label>
                <input
                  type="number"
                  value={testDepth}
                  onChange={e => setTestDepth(parseInt(e.target.value) || 100)}
                  className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                  Select Style / Technique
                </label>
                <CustomSelect
                  value={testStyle}
                  onChange={setTestStyle}
                  options={styles.map(s => ({
                    value: s.name,
                    label: `${s.name} (${s.densityMultiplier}×)`
                  }))}
                />
              </div>

              <div className="p-3 bg-white border border-neutral-300 rounded-sm">
                <span className="text-[9px] uppercase font-mono tracking-wider text-neutral-400 block">
                  Resulting Weight
                </span>
                <div className="text-lg font-mono font-bold text-neutral-900">
                  {calculatedTestWeight} {weightFormula.unit}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  Area: {((testWidth * testDepth) / 10000).toFixed(2)} m²
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
