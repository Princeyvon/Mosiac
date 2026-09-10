import React from 'react';
import { ProductColor } from '../../types';

interface VariantSwatchesProps {
  colours: ProductColor[];
  selectedColor: string;
  onSelectColor: (colorName: string) => void;
}

export const VariantSwatches: React.FC<VariantSwatchesProps> = ({
  colours,
  selectedColor,
  onSelectColor
}) => {
  if (!colours || colours.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em]">
        <span className="text-neutral-500 font-normal">Color</span>
        <span className="font-medium text-black">[{selectedColor}]</span>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {colours.map(c => {
          const isSelected = selectedColor === c.name;
          return (
            <button
              key={c.id || c.name}
              type="button"
              onClick={() => onSelectColor(c.name)}
              className={`group flex items-center gap-2 px-2.5 py-1.5 border transition-all ${
                isSelected
                  ? 'border-black bg-neutral-50'
                  : 'border-neutral-200 hover:border-neutral-400 bg-white'
              }`}
              title={c.name}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-[10px] uppercase tracking-wider text-neutral-800">
                {c.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
