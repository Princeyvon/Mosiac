import React, { useState, useRef } from 'react';
import { Upload, Clipboard, Image as ImageIcon, X, Check } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: 'square' | 'wide' | 'tall';
  helperText?: string;
  id?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  aspectRatio = 'square',
  helperText,
  id
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload reader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so user can re-upload same file if desired
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Clipboard paste handler
  const handlePasteClipboard = async () => {
    try {
      // First try navigator.clipboard.read for image blob
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find(type => type.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                onChange(reader.result);
                setPasteSuccess(true);
                setTimeout(() => setPasteSuccess(false), 2000);
              }
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }

      // Fallback: try reading text from clipboard (image URL)
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image/'))) {
          onChange(text.trim());
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2000);
          return;
        }
      }

      alert('Please copy an image or image URL to your clipboard first, then click paste.');
    } catch {
      // Prompt user as fallback
      const pasted = window.prompt('Paste image URL or Base64 data:');
      if (pasted && pasted.trim()) {
        onChange(pasted.trim());
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    }
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'wide'
      ? 'aspect-video'
      : 'aspect-[3/4]';

  return (
    <div className="space-y-1.5" id={id}>
      <div className="flex items-center justify-between">
        <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-700">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] text-red-500 hover:text-red-700 transition-colors cursor-pointer"
          >
            Remove
          </button>
        )}
      </div>

      {helperText && (
        <p className="text-[10px] text-neutral-400 font-light">{helperText}</p>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative ${aspectClass} bg-neutral-50 border-2 rounded-sm overflow-hidden flex flex-col items-center justify-center transition-all ${
          isDragging
            ? 'border-black bg-neutral-100 scale-[1.01]'
            : 'border-dashed border-neutral-300 hover:border-neutral-400'
        }`}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Uploaded visual asset"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 bg-white text-black text-[10px] font-medium uppercase tracking-wider rounded-sm shadow-xs hover:bg-neutral-100 cursor-pointer flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="px-2.5 py-1.5 bg-black text-white text-[10px] font-medium uppercase tracking-wider rounded-sm shadow-xs hover:bg-neutral-800 cursor-pointer flex items-center gap-1"
              >
                <Clipboard className="w-3 h-3" />
                <span>Paste</span>
              </button>
            </div>
          </>
        ) : (
          <div className="p-4 text-center space-y-2">
            <ImageIcon className="w-7 h-7 mx-auto text-neutral-300 stroke-1" />
            <div className="text-[11px] text-neutral-500">
              Drag & drop image here or browse
            </div>
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 bg-neutral-900 text-white text-[10px] font-medium uppercase tracking-wider rounded-sm hover:bg-black transition-colors cursor-pointer flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>Upload</span>
              </button>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="px-2.5 py-1 bg-neutral-100 text-neutral-700 text-[10px] font-medium uppercase tracking-wider rounded-sm hover:bg-neutral-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                {pasteSuccess ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Pasted!</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3 h-3" />
                    <span>Paste</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Manual URL input option */}
      <div className="pt-1">
        <input
          type="text"
          value={value.startsWith('data:image') ? '[Uploaded Image File]' : value}
          onChange={e => onChange(e.target.value)}
          placeholder="Or paste direct image URL (https://...)"
          className="w-full border border-neutral-300 rounded-sm px-2.5 py-1 text-[11px] font-mono focus:outline-black bg-white"
        />
      </div>
    </div>
  );
};
