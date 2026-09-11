import React, { useState } from 'react';
import { X, Ruler, Check, Sparkles, Home, Bed, Coffee, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SizingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productShape?: string;
}

export const SizingGuideModal: React.FC<SizingGuideModalProps> = ({
  isOpen,
  onClose,
  productName = 'Atelier Rug',
  productShape = 'Circular / Standard',
}) => {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  // Standard Mosiac Rug Size Specifications
  const sizingData = [
    {
      size: 'S',
      name: 'Small / Accent',
      metricCm: '150 × 150 cm',
      imperialFt: `4'11" × 4'11" (approx. 5' × 5')`,
      areaMetric: '2.25 m²',
      areaImperial: '24.2 sq ft',
      weight: 'approx. 10 – 12 kg',
      idealFor: 'Entryways, intimate reading nooks, bedside accent, executive desk vignettes',
      icon: Coffee,
    },
    {
      size: 'M',
      name: 'Medium / Studio',
      metricCm: '200 × 200 cm',
      imperialFt: `6'7" × 6'7" (approx. 6.5' × 6.5')`,
      areaMetric: '4.00 m²',
      areaImperial: '43.1 sq ft',
      weight: 'approx. 18 – 22 kg',
      idealFor: 'Two-to-three seater sofas, apartment living rooms, queen bed footings, home offices',
      icon: Home,
    },
    {
      size: 'L',
      name: 'Large / Living',
      metricCm: '250 × 250 cm',
      imperialFt: `8'2" × 8'2" (approx. 8' × 8')`,
      areaMetric: '6.25 m²',
      areaImperial: '67.3 sq ft',
      weight: 'approx. 28 – 32 kg',
      idealFor: 'Full living room conversational groupings (front sofa legs anchored), 6-seat dining areas',
      icon: Home,
    },
    {
      size: 'XL',
      name: 'Extra Large / Grand',
      metricCm: '300 × 300 cm',
      imperialFt: `9'10" × 9'10" (approx. 10' × 10')`,
      areaMetric: '9.00 m²',
      areaImperial: '96.9 sq ft',
      weight: 'approx. 40 – 45 kg',
      idealFor: 'Grand open-plan living salons, master suites anchoring king beds with nightstands, 8–10 seat dining tables',
      icon: Bed,
    },
  ];

  if (!isOpen) return null;

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
              <span>Studio Sizing & Placement Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif uppercase tracking-tight text-neutral-900">
              Scale & Dimensions Reference
            </h2>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Every Mosiac piece is hand-tufted from pure New Zealand wool and luster-spun bamboo silk. Use this architectural guide to select the ideal scale for your interior.
            </p>
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
                Metric (cm / m²)
              </button>
              <button
                type="button"
                onClick={() => setUnit('imperial')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  unit === 'imperial' ? 'bg-white text-black font-semibold shadow-2xs' : 'text-neutral-500 hover:text-black'
                }`}
              >
                Imperial (ft / in)
              </button>
            </div>
          </div>

          {/* Designed Comparison Table */}
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-left border-collapse min-w-[540px]">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.16em]">
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Dimensions</th>
                  <th className="py-2.5 px-3">Surface Area</th>
                  <th className="py-2.5 px-3">Estimated Weight</th>
                  <th className="py-2.5 px-3">Best Room Placement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {sizingData.map(item => (
                  <tr key={item.size} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-sm text-neutral-900">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-neutral-900 text-white font-mono text-xs">
                        {item.size}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-medium text-neutral-800">
                      {unit === 'metric' ? item.metricCm : item.imperialFt}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-neutral-600">
                      {unit === 'metric' ? item.areaMetric : item.areaImperial}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-neutral-500 text-[11px]">
                      {item.weight}
                    </td>
                    <td className="py-3.5 px-3 text-neutral-600 text-[11px] font-light leading-snug max-w-xs">
                      {item.idealFor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Placement Visual Diagrams Card */}
          <div className="mt-6 pt-6 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-xl space-y-2">
              <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-neutral-800 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-neutral-500" />
                <span>Living Room Layout Tip</span>
              </div>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                For standard seating groups, choose <strong>L (250cm)</strong> so front sofa legs rest naturally over the rug, anchoring the coffee table. For compact apartments or statement focal points, choose <strong>M (200cm)</strong>.
              </p>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-xl space-y-2">
              <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-neutral-800 flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-neutral-500" />
                <span>Bedroom & Suite Tip</span>
              </div>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                For a king bed, select <strong>XL (300cm)</strong> to provide generous 60–80cm margins on either side and the foot of the bed. For queen beds, <strong>L (250cm)</strong> offers ideal proportion.
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
              <div className="text-xs font-medium">Need custom dimensions or tailored architectural shapes?</div>
              <div className="text-[11px] text-neutral-400">Our studio crafts custom tufted pieces to exact millimeter specifications.</div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                window.open('https://ig.me/m/rugmosiac', '_blank', 'noopener,noreferrer');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-black hover:bg-neutral-100 text-[10px] uppercase tracking-wider font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <span>Inquire on Instagram</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
