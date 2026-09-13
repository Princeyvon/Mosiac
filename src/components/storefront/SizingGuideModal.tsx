import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Ruler, Check, Sparkles, Home, Bed, UtensilsCrossed, ArrowUpRight, Scale, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SizingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productShape?: string;
  productStyle?: string;
  productMaterial?: string;
}

export const SizingGuideModal: React.FC<SizingGuideModalProps> = ({
  isOpen,
  onClose,
  productName = 'Atelier Rug',
  productShape = 'Circular',
  productStyle = 'High-Relief Hand Carved',
  productMaterial = '100% Hand-Tufted New Zealand Wool',
}) => {
  const { sizingGuideConfig, shapes, styles, calculateWeight, weightFormula } = useStore();
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  if (!isOpen) return null;

  // Find shape-specific guidance if available
  const matchedShape = shapes.find(
    s => s.name.toLowerCase() === productShape.toLowerCase() || s.slug === productShape.toLowerCase()
  );

  const shapeTip =
    sizingGuideConfig.shapeSpecificTips[productShape] ||
    matchedShape?.placementGuidance ||
    matchedShape?.description;

  const cmToFtIn = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  const cmToSqFt = (widthCm: number, depthCm: number) => {
    const areaM2 = (widthCm / 100) * (depthCm / 100);
    const sqFt = areaM2 * 10.7639;
    return `${sqFt.toFixed(1)} sq ft`;
  };

  return (
    <AnimatePresence>
      <div
        id="sizing-guide-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto"
        onClick={e => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          id="sizing-guide-modal"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl bg-white border border-neutral-200 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 text-neutral-900 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            id="close-sizing-guide-btn"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-black rounded-full transition-colors cursor-pointer"
            aria-label="Close sizing guide"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="space-y-1.5 pr-10 mb-6">
            <div className="inline-flex items-center gap-1.5 text-neutral-500 font-mono text-[10px] uppercase tracking-[0.2em]">
              <Ruler className="w-3.5 h-3.5" />
              <span>{sizingGuideConfig.eyebrow || 'Studio Sizing & Placement Guide'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif uppercase tracking-tight text-neutral-900">
              {sizingGuideConfig.headline || 'Scale & Dimensions Reference'}
            </h2>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              {sizingGuideConfig.description ||
                'Every Mosiac piece is hand-tufted from pure New Zealand virgin wool and luster-spun botanical bamboo silk. Use this architectural guide to select the ideal scale for your interior.'}
            </p>

            {/* Target Rug Pill */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-mono text-neutral-400">Inspecting:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-semibold text-neutral-800">
                {productName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-[10px] font-mono text-neutral-600">
                Shape: {productShape}
              </span>
              {productStyle && (
                <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-[10px] font-mono text-neutral-600">
                  Style: {productStyle}
                </span>
              )}
            </div>
          </div>

          {/* Unit Switcher */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Measurement Standard
            </span>
            <div className="inline-flex items-center bg-neutral-100 p-0.5 rounded-lg text-[11px] font-mono uppercase">
              <button
                type="button"
                onClick={() => setUnit('metric')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  unit === 'metric' ? 'bg-white text-black font-semibold shadow-2xs' : 'text-neutral-500 hover:text-black'
                }`}
              >
                Metric (cm / m² / kg)
              </button>
              <button
                type="button"
                onClick={() => setUnit('imperial')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  unit === 'imperial' ? 'bg-white text-black font-semibold shadow-2xs' : 'text-neutral-500 hover:text-black'
                }`}
              >
                Imperial (ft / in / lbs)
              </button>
            </div>
          </div>

          {/* Sizing Comparison Table */}
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-left border-collapse min-w-[560px]">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.16em]">
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Dimensions</th>
                  <th className="py-2.5 px-3">Surface Area</th>
                  <th className="py-2.5 px-3">Dynamic Weight</th>
                  <th className="py-2.5 px-3">Best Room Placement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {sizingGuideConfig.sizeRows.map(item => {
                  const areaM2 = ((item.widthCm / 100) * (item.depthCm / 100)).toFixed(2);
                  const dynamicWeight = calculateWeight(item.widthCm, item.depthCm, productStyle, productMaterial);
                  const weightDisplay =
                    unit === 'metric'
                      ? `~ ${dynamicWeight} kg`
                      : `~ ${Math.round(dynamicWeight * (weightFormula.unit === 'kg' ? 2.20462 : 1) * 10) / 10} lbs`;

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-sm text-neutral-900">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-neutral-900 text-white font-mono text-xs">
                          {item.size}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-medium text-neutral-800">
                        {unit === 'metric'
                          ? `${item.widthCm} × ${item.depthCm} cm`
                          : `${cmToFtIn(item.widthCm)} × ${cmToFtIn(item.depthCm)}`}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-neutral-600">
                        {unit === 'metric' ? `${areaM2} m²` : cmToSqFt(item.widthCm, item.depthCm)}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-neutral-500 text-[11px]">
                        {weightDisplay}
                      </td>
                      <td className="py-3.5 px-3 text-neutral-600 text-[11px] font-light leading-snug max-w-xs">
                        {item.idealFor}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Shape-Specific Architectural Guidance (Dynamic per Rug Shape) */}
          {shapeTip && (
            <div className="mt-5 p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl space-y-1">
              <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Tailored Shape Placement: {productShape}</span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed font-light">
                {shapeTip}
              </p>
            </div>
          )}

          {/* Placement Visual Diagrams Card */}
          <div className="mt-5 pt-5 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-xl space-y-2">
              <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-neutral-800 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-neutral-500" />
                <span>Living Room Layout Tip</span>
              </div>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                {sizingGuideConfig.livingRoomTip ||
                  'For standard seating groups, choose L (250cm) so front sofa legs rest naturally over the rug, anchoring the coffee table. For compact apartments or statement focal points, choose M (200cm).'}
              </p>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-xl space-y-2">
              <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-neutral-800 flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-neutral-500" />
                <span>Bedroom & Suite Tip</span>
              </div>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                {sizingGuideConfig.bedroomTip ||
                  'For a king bed, select XL (300cm) to provide generous 60–80cm margins on either side and the foot of the bed. For queen beds, L (250cm) offers ideal proportion.'}
              </p>
            </div>
          </div>

          {/* Custom Sizing Studio Banner */}
          <div className="mt-5 p-4 bg-neutral-900 text-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Bespoke Dimensions</span>
              </div>
              <div className="text-xs font-medium">
                {sizingGuideConfig.customInquiryText ||
                  'Need custom dimensions or tailored architectural shapes? Our studio crafts custom tufted pieces to exact millimeter specifications.'}
              </div>
              <div className="text-[11px] text-neutral-400">
                Direct atelier communication for bespoke weave orders and architectural trade quotes.
              </div>
            </div>
            <a
              href={sizingGuideConfig.customInquiryUrl || 'https://ig.me/m/rugmosiac'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-black hover:bg-neutral-100 text-[10px] uppercase tracking-wider font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <span>Inquire on Instagram</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
