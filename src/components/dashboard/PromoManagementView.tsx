import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ImageUploadField } from './ImageUploadField';
import {
  Megaphone,
  Plus,
  Play,
  Check,
  Tag,
  Clock,
  ExternalLink,
  Percent,
  Sparkles,
  Eye,
  Sliders
} from 'lucide-react';

export const PromoManagementView: React.FC = () => {
  const {
    promoPopupConfig,
    updatePromoPopupConfig,
    triggerPromoPreview,
    navigateToStore,
    showToast
  } = useStore();

  const [form, setForm] = useState({ ...promoPopupConfig });
  const [isSaved, setIsSaved] = useState(false);

  // Promotional discount codes list
  const [promoCodesList, setPromoCodesList] = useState([
    { code: 'SAMPLE70', percent: 70, label: '70% Off Sample Sale', status: 'Active', uses: 48 },
    { code: 'MOSIAC10', percent: 10, label: '10% Off Collector Welcome', status: 'Active', uses: 94 },
    { code: 'ARCHTRADE15', percent: 15, label: '15% Off Architectural Trade', status: 'Active', uses: 28 },
    { code: 'STUDIOOPEN', percent: 20, label: '20% Off Launch Edition', status: 'Paused', uses: 112 },
  ]);

  const [showNewCodeForm, setShowNewCodeForm] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoPercent, setNewPromoPercent] = useState(25);
  const [newPromoLabel, setNewPromoLabel] = useState('25% Off Private Client');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updatePromoPopupConfig(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newPromoCode.trim().toUpperCase();
    if (!clean) return;

    setPromoCodesList(prev => [
      {
        code: clean,
        percent: Number(newPromoPercent) || 20,
        label: newPromoLabel,
        status: 'Active',
        uses: 0
      },
      ...prev
    ]);

    setShowNewCodeForm(false);
    setNewPromoCode('');
    showToast(`Created promo code: ${clean} (${newPromoPercent}% off)`);
  };

  const toggleCodeStatus = (code: string) => {
    setPromoCodesList(prev =>
      prev.map(c =>
        c.code === code ? { ...c, status: c.status === 'Active' ? 'Paused' : 'Active' } : c
      )
    );
    showToast(`Toggled code status for ${code}`);
  };

  const handleTestInStorefront = () => {
    updatePromoPopupConfig(form);
    triggerPromoPreview();
    navigateToStore();
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
            Marketing & Conversion · Automated Timed Popups
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Promo Pop-up & Promotional Codes
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure the 30-second entrance promo banner, design custom headlines, and generate discount codes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleTestInStorefront}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs uppercase font-medium tracking-wider rounded-sm border border-neutral-300 text-neutral-800 hover:border-black transition-colors cursor-pointer bg-white shadow-2xs"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Test Popup in Storefront</span>
          </button>
          <button
            type="submit"
            form="promo-config-form"
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-black text-white text-xs uppercase font-semibold tracking-wider rounded-sm hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Configuration</span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration Form */}
        <form
          id="promo-config-form"
          onSubmit={handleSaveConfig}
          className="lg:col-span-7 space-y-6"
        >
          {/* Main Activation Card */}
          <div className="bg-white border border-neutral-200 rounded-sm p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-black" />
                <span>Timer & Status</span>
              </h2>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={e => setForm(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-4 h-4 rounded-xs text-black focus:ring-black cursor-pointer"
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-800">
                  {form.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                  Delay Before Popup Displays (Seconds)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={form.delaySeconds}
                    onChange={e =>
                      setForm(prev => ({ ...prev, delaySeconds: Number(e.target.value) || 30 }))
                    }
                    className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono focus:outline-black bg-white"
                  />
                  <span className="text-xs text-neutral-500 font-mono shrink-0">sec</span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Per user request, default is set to 30 seconds after page loads.
                </p>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                  Target Storefront Filter
                </label>
                <input
                  type="text"
                  value={form.filterTag || ''}
                  onChange={e => setForm(prev => ({ ...prev, filterTag: e.target.value }))}
                  placeholder="e.g. on-sale"
                  className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono focus:outline-black bg-white"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  When user clicks &quot;Shop Now&quot;, this filter activates automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Copywriting & Content */}
          <div className="bg-white border border-neutral-200 rounded-sm p-6 space-y-4 shadow-2xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
              Pop-up Typography & Messaging
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                  Pill Badge Label
                </label>
                <input
                  type="text"
                  value={form.badgeText}
                  onChange={e => setForm(prev => ({ ...prev, badgeText: e.target.value }))}
                  placeholder="e.g. SAMPLE SALE"
                  className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono uppercase focus:outline-black bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                  Eyebrow Text
                </label>
                <input
                  type="text"
                  value={form.eyebrow}
                  onChange={e => setForm(prev => ({ ...prev, eyebrow: e.target.value }))}
                  placeholder="e.g. ONLINE SAMPLE SALE NOW LIVE!"
                  className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono uppercase focus:outline-black bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                Headline (Primary Offer Title)
              </label>
              <input
                type="text"
                required
                value={form.headline}
                onChange={e => setForm(prev => ({ ...prev, headline: e.target.value }))}
                placeholder="e.g. Shop up to 70% off select sample sale items!"
                className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-medium focus:outline-black bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                Subtext & Expiry Note
              </label>
              <input
                type="text"
                value={form.subtext}
                onChange={e => setForm(prev => ({ ...prev, subtext: e.target.value }))}
                placeholder="e.g. Ends September 7th. Exclusions apply."
                className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                  Primary Promo Code
                </label>
                <input
                  type="text"
                  value={form.discountCode}
                  onChange={e =>
                    setForm(prev => ({ ...prev, discountCode: e.target.value.toUpperCase().trim() }))
                  }
                  placeholder="e.g. SAMPLE70"
                  className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider focus:outline-black bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                  Call to Action Button Text
                </label>
                <input
                  type="text"
                  value={form.buttonText}
                  onChange={e => setForm(prev => ({ ...prev, buttonText: e.target.value }))}
                  placeholder="e.g. SHOP NOW!"
                  className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs uppercase font-medium focus:outline-black bg-white"
                />
              </div>
            </div>
          </div>

          {/* Banner Media */}
          <div className="bg-white border border-neutral-200 rounded-sm p-6 space-y-4 shadow-2xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
              Pop-up Imagery & Visual Asset
            </h2>

            <ImageUploadField
              label="Promotional Hero Image"
              value={form.imageUrl}
              onChange={url => setForm(prev => ({ ...prev, imageUrl: url }))}
              aspectRatio="wide"
              helperText="Upload an editorial photograph or paste directly from clipboard"
            />
          </div>
        </form>

        {/* Right Column: Live Mockup Preview & Codes Table */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Preview Box */}
          <div className="bg-neutral-900 text-white p-5 rounded-sm shadow-md space-y-3">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview Rendering</span>
              </span>
              <span>30s Trigger</span>
            </div>

            {/* Modal Mockup */}
            <div className="bg-white text-neutral-900 rounded-sm border border-neutral-200 overflow-hidden shadow-xl text-left">
              {form.imageUrl && (
                <div className="w-full h-36 bg-neutral-100 relative overflow-hidden">
                  <img
                    src={form.imageUrl}
                    alt="Promo banner"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {form.badgeText && (
                    <div className="absolute top-2.5 left-2.5 bg-black text-white text-[8px] uppercase tracking-[0.2em] font-mono px-2 py-0.5 rounded-sm">
                      {form.badgeText}
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 space-y-2.5">
                {form.eyebrow && (
                  <div className="text-[9px] uppercase font-mono tracking-widest text-neutral-400">
                    {form.eyebrow}
                  </div>
                )}
                <h4 className="text-sm font-serif uppercase tracking-tight leading-snug">
                  {form.headline || 'Offer Headline'}
                </h4>
                {form.subtext && (
                  <p className="text-[11px] text-neutral-500 font-light">{form.subtext}</p>
                )}
                {form.discountCode && (
                  <div className="flex items-center justify-between p-2 bg-neutral-50 border border-neutral-200 rounded-sm text-xs font-mono">
                    <span className="text-[10px] text-neutral-500">CODE:</span>
                    <span className="font-bold">{form.discountCode}</span>
                  </div>
                )}
                <button
                  type="button"
                  className="w-full py-2 bg-black text-white text-[10px] uppercase tracking-[0.2em] font-semibold rounded-sm mt-1"
                >
                  {form.buttonText || 'Shop Now!'}
                </button>
              </div>
            </div>
          </div>

          {/* Promotional Codes Table */}
          <div className="bg-white border border-neutral-200 rounded-sm p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Promotional Discount Codes
                </h3>
                <p className="text-[10px] text-neutral-400">
                  Codes registered here automatically deduct percentage discount at checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewCodeForm(!showNewCodeForm)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-black text-white text-[10px] uppercase font-semibold rounded-sm hover:bg-neutral-800 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{showNewCodeForm ? 'Close' : 'New Code'}</span>
              </button>
            </div>

            {/* Quick Generator Form */}
            {showNewCodeForm && (
              <form
                onSubmit={handleCreateCode}
                className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-sm space-y-3 text-xs"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] uppercase font-mono text-neutral-500 mb-1">
                      Code String
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VIP25"
                      value={newPromoCode}
                      onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                      className="w-full border border-neutral-300 rounded-sm px-2.5 py-1 text-xs font-mono uppercase bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-mono text-neutral-500 mb-1">
                      Discount %
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      required
                      value={newPromoPercent}
                      onChange={e => setNewPromoPercent(Number(e.target.value))}
                      className="w-full border border-neutral-300 rounded-sm px-2.5 py-1 text-xs font-mono bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-mono text-neutral-500 mb-1">
                    Description Label
                  </label>
                  <input
                    type="text"
                    value={newPromoLabel}
                    onChange={e => setNewPromoLabel(e.target.value)}
                    placeholder="e.g. 25% Off VIP Collector"
                    className="w-full border border-neutral-300 rounded-sm px-2.5 py-1 text-xs bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 bg-black text-white text-[10px] uppercase font-semibold tracking-wider rounded-sm hover:bg-neutral-800 cursor-pointer"
                >
                  Generate & Activate Code
                </button>
              </form>
            )}

            <div className="divide-y divide-neutral-100 text-xs">
              {promoCodesList.map(item => (
                <div key={item.code} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-neutral-900">{item.code}</span>
                      <span className="text-[10px] font-mono bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded-xs">
                        {item.percent}% OFF
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400">{item.label}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleCodeStatus(item.code)}
                      className={`px-2 py-0.5 text-[9px] uppercase font-mono rounded-sm transition-colors cursor-pointer ${
                        item.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                      }`}
                    >
                      {item.status}
                    </button>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {item.uses} uses
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
