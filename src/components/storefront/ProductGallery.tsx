import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Rotate3D, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [dragHintVisible, setDragHintVisible] = useState(true);
  const startXRef = useRef(0);
  const currentIndexRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const safeImages = images && images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=85'
  ];
  const count = safeImages.length;

  useEffect(() => {
    currentIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Handle pointer / drag events for turntable rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setHasInteracted(true);
    startXRef.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || count <= 1) return;
    const deltaX = e.clientX - startXRef.current;
    const pixelsPerFrame = 35; // sensitivity
    const frameShift = Math.floor(deltaX / pixelsPerFrame);

    if (Math.abs(frameShift) >= 1) {
      let nextIndex = (currentIndexRef.current - frameShift) % count;
      if (nextIndex < 0) nextIndex += count;
      setActiveIndex(nextIndex);
      startXRef.current = e.clientX;
    }
  }, [isDragging, count]);

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const stepAngle = Math.round((360 / count) * activeIndex);

  return (
    <div className="w-full flex flex-col gap-3 select-none">
      {/* Primary Turntable Viewport */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative aspect-[4/3] md:aspect-square w-full bg-neutral-50 flex items-center justify-center p-6 md:p-12 overflow-hidden touch-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <img
          src={safeImages[activeIndex]}
          alt={`${productName} angle ${activeIndex + 1}`}
          className="w-full h-full object-contain pointer-events-none transition-transform duration-100"
          draggable={false}
        />

        {/* Drag to Rotate HUD badge */}
        <div
          className={`absolute top-4 left-4 bg-white/90 backdrop-blur-xs border border-black/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-800 flex items-center gap-1.5 transition-opacity duration-300 ${
            dragHintVisible ? 'opacity-100' : 'opacity-40 hover:opacity-100'
          }`}
          onMouseEnter={() => setDragHintVisible(true)}
        >
          <Rotate3D className="w-3.5 h-3.5 text-neutral-700 animate-pulse" />
          <span>Drag to Rotate</span>
          <span className="font-mono text-neutral-400 pl-1">[{stepAngle}°]</span>
        </div>

        {/* Interaction helper overlay on mobile or desktop initial view */}
        {!hasInteracted && (
          <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none">
            <span className="bg-black/80 text-white text-[9px] uppercase tracking-[0.25em] px-3 py-1 font-light backdrop-blur-xs">
              ‹ Scrub left / right ›
            </span>
          </div>
        )}

        {/* Subtle Next/Prev buttons on edge hover */}
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setActiveIndex(prev => (prev - 1 + count) % count);
            setHasInteracted(true);
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-neutral-700 hover:text-black transition-colors rounded-full shadow-xs opacity-0 hover:opacity-100 md:group-hover:opacity-100"
          aria-label="Previous angle"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setActiveIndex(prev => (prev + 1) % count);
            setHasInteracted(true);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-neutral-700 hover:text-black transition-colors rounded-full shadow-xs opacity-0 hover:opacity-100 md:group-hover:opacity-100"
          aria-label="Next angle"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal Filmstrip of Thumbnails */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {safeImages.map((imgUrl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setActiveIndex(idx);
              setHasInteracted(true);
            }}
            className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-neutral-100 overflow-hidden border transition-all ${
              activeIndex === idx
                ? 'border-black opacity-100 ring-1 ring-black'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img
              src={imgUrl}
              alt={`${productName} thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0.5 right-1 text-[8px] font-mono text-neutral-400 bg-white/80 px-0.5">
              {idx + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
