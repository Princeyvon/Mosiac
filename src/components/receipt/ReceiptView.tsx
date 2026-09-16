import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Copy,
  Check,
  Printer,
  ArrowLeft,
  Share2,
  Clock,
  Truck,
  Sparkles,
  ShieldCheck,
  FileText,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  CreditCard,
  PackageCheck,
  Scissors,
  Wand2,
  Info,
  Search,
  Download,
  Loader2,
  KeyRound
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';
import { ReceiptLookupForm } from './ReceiptLookupForm';
import { exportReceiptToPdf } from '../../utils/pdfExport';

// Atmosphere blur color themes that randomize on load or on user toggle
const BLUR_PALETTES = [
  {
    name: 'Atelier Sunset',
    orbs: [
      { color: 'bg-amber-400', top: '10%', left: '15%', size: 'w-[420px] h-[420px]', opacity: 'opacity-50' },
      { color: 'bg-rose-500', top: '25%', right: '10%', size: 'w-[480px] h-[480px]', opacity: 'opacity-60' },
      { color: 'bg-indigo-600', bottom: '15%', left: '20%', size: 'w-[520px] h-[520px]', opacity: 'opacity-50' },
      { color: 'bg-emerald-400', bottom: '10%', right: '25%', size: 'w-[360px] h-[360px]', opacity: 'opacity-40' },
    ]
  },
  {
    name: 'Nordic Horizon',
    orbs: [
      { color: 'bg-cyan-400', top: '15%', left: '10%', size: 'w-[460px] h-[460px]', opacity: 'opacity-55' },
      { color: 'bg-violet-600', top: '20%', right: '15%', size: 'w-[500px] h-[500px]', opacity: 'opacity-60' },
      { color: 'bg-emerald-400', bottom: '20%', left: '25%', size: 'w-[400px] h-[400px]', opacity: 'opacity-45' },
      { color: 'bg-fuchsia-500', bottom: '10%', right: '15%', size: 'w-[440px] h-[440px]', opacity: 'opacity-50' },
    ]
  },
  {
    name: 'Travertine Glow',
    orbs: [
      { color: 'bg-orange-500', top: '10%', right: '20%', size: 'w-[450px] h-[450px]', opacity: 'opacity-55' },
      { color: 'bg-amber-300', top: '30%', left: '15%', size: 'w-[400px] h-[400px]', opacity: 'opacity-60' },
      { color: 'bg-rose-400', bottom: '15%', right: '15%', size: 'w-[480px] h-[480px]', opacity: 'opacity-50' },
      { color: 'bg-blue-600', bottom: '25%', left: '15%', size: 'w-[500px] h-[500px]', opacity: 'opacity-50' },
    ]
  },
  {
    name: 'Cosmic Violet',
    orbs: [
      { color: 'bg-purple-600', top: '15%', left: '20%', size: 'w-[520px] h-[520px]', opacity: 'opacity-65' },
      { color: 'bg-pink-500', top: '25%', right: '15%', size: 'w-[450px] h-[450px]', opacity: 'opacity-55' },
      { color: 'bg-teal-400', bottom: '10%', left: '15%', size: 'w-[380px] h-[380px]', opacity: 'opacity-45' },
      { color: 'bg-yellow-400', bottom: '20%', right: '20%', size: 'w-[420px] h-[420px]', opacity: 'opacity-50' },
    ]
  }
];

export const ReceiptView: React.FC = () => {
  const {
    currentReceiptOrderId,
    isReceiptLookupOpen,
    setIsReceiptLookupOpen,
    openReceiptLookup,
    validatedReceiptOrderIds,
    getOrderById,
    navigateToStore,
    formatPrice,
    orders
  } = useStore();

  // Direct receipt link detection: if client was sent a unique receipt link, bypass lookup
  const isDirectLink = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash;
    if (hash.startsWith('#/receipt/') && !hash.includes('/receipt/lookup')) {
      const paramId = hash.replace('#/receipt/', '').trim();
      if (paramId && paramId !== 'lookup') return true;
    }
    const searchParams = new URLSearchParams(window.location.search);
    const qReceipt = searchParams.get('receipt');
    if (qReceipt && qReceipt.trim()) return true;
    return false;
  }, []);

  const isCurrentOrderValidated = useMemo(() => {
    if (isDirectLink) return true;
    if (!currentReceiptOrderId) return false;
    return validatedReceiptOrderIds.includes(currentReceiptOrderId);
  }, [isDirectLink, currentReceiptOrderId, validatedReceiptOrderIds]);

  // Find target order or fall back to the most recent one
  const order: Order = useMemo(() => {
    if (currentReceiptOrderId) {
      const found = getOrderById(currentReceiptOrderId);
      if (found) return found;
    }
    if (validatedReceiptOrderIds.length > 0) {
      const found = getOrderById(validatedReceiptOrderIds[validatedReceiptOrderIds.length - 1]);
      if (found) return found;
    }
    return orders[0] || {
      id: 'ORD-9021',
      receiptId: 'RCP-ORD-9021-X9K',
      customerName: 'Camille Moreau',
      customerEmail: 'camille@atelier-arch.fr',
      total: 5400,
      subtotal: 5400,
      discount: 0,
      currency: 'USD',
      status: 'Processing',
      date: '2026-09-09',
      itemsCount: 1,
      paymentMethod: 'Credit Card',
      cardLast4: '4192',
      shippingMethod: 'White-Glove Inspected Freight',
      shippingFee: 0,
      carrier: 'DHL Express White-Glove (Mosiac Flight)',
      trackingNumber: 'MOS-FR-902198',
      estimatedDelivery: 'Sep 16 – Sep 18, 2026',
      destinationCity: 'Paris, France',
      items: [
        {
          productId: 'prod-monolith-1',
          productName: 'Travertine Monolith Sculpture Rug',
          productImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',
          sizeLabel: 'L',
          dimensions: '250 × 250 cm',
          colorName: 'Raw Travertine Cream',
          unitPrice: 5400,
          quantity: 1,
          total: 5400
        }
      ]
    };
  }, [currentReceiptOrderId, getOrderById, validatedReceiptOrderIds, orders]);

  // State for active auxiliary section (to avoid clogging the primary receipt)
  const [activeTab, setActiveTab] = useState<'status' | 'care' | 'returns' | 'terms' | null>(
    order.status !== 'Fulfilled' ? 'status' : null
  );

  // Palette rotation state
  const [paletteIndex, setPaletteIndex] = useState(0);
  const currentPalette = BLUR_PALETTES[paletteIndex % BLUR_PALETTES.length];

  // Copied link toast state
  const [linkCopied, setLinkCopied] = useState(false);
  const [trackingCopied, setTrackingCopied] = useState(false);

  // PDF Export state
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  // Generate unique URL for this receipt
  const receiptUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#/receipt/${order.id}`
    : `https://rugmosiac.com/#/receipt/${order.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(receiptUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      // Fallback
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    }
  };

  const handleCopyTracking = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setTrackingCopied(true);
      setTimeout(() => setTrackingCopied(false), 2200);
    } catch {
      setTrackingCopied(true);
      setTimeout(() => setTrackingCopied(false), 2200);
    }
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const res = await exportReceiptToPdf(receiptRef.current, order);
      if (res.success) {
        setPdfSuccess(true);
        setTimeout(() => setPdfSuccess(false), 3500);
      } else {
        // Fallback to browser print
        window.print();
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShuffleAtmosphere = () => {
    setPaletteIndex(prev => (prev + 1) % BLUR_PALETTES.length);
  };

  // Status step calculations
  const steps = [
    {
      id: 'step-1',
      label: 'Order Confirmed',
      desc: 'Payment authorized & logged into master archive',
      completed: true,
      active: order.status === 'Pending',
      date: order.date
    },
    {
      id: 'step-2',
      label: 'Master Loom Weaving',
      desc: '100% New Zealand highland wool tufted & sculpted',
      completed: order.status === 'Processing' || order.status === 'Dispatched' || order.status === 'Fulfilled',
      active: order.status === 'Processing',
      date: 'In Atelier'
    },
    {
      id: 'step-3',
      label: 'Quality Shearing & Inspection',
      desc: 'High-relief contours inspected by master craftsman',
      completed: order.status === 'Dispatched' || order.status === 'Fulfilled',
      active: order.status === 'Dispatched',
      date: 'Certified'
    },
    {
      id: 'step-4',
      label: 'White-Glove Delivery',
      desc: 'Direct climate-controlled transit to private residence',
      completed: order.status === 'Fulfilled',
      active: false,
      date: order.estimatedDelivery || 'In Transit'
    }
  ];

  // If user opened the lookup dialog OR current order is not validated:
  if (isReceiptLookupOpen || !isCurrentOrderValidated) {
    return (
      <div className="relative min-h-screen w-full bg-slate-950 text-neutral-100 font-sans selection:bg-white selection:text-black overflow-x-hidden">
        {/* Ambient atmospheric orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <div className="absolute inset-0 bg-slate-950/70 z-10 backdrop-blur-[40px]" />
          {currentPalette.orbs.map((orb, i) => (
            <motion.div
              key={`${paletteIndex}-${i}`}
              animate={{
                scale: [0.95, 1.15, 0.95],
                x: [0, i % 2 === 0 ? 30 : -30, 0],
                y: [0, i % 2 === 0 ? -25 : 25, 0],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`absolute rounded-full filter blur-[95px] md:blur-[130px] ${orb.color} ${orb.size} ${orb.opacity}`}
              style={{
                top: orb.top,
                left: orb.left,
                right: orb.right,
                bottom: orb.bottom,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-30 z-20" />
        </div>

        {/* Minimal top bar */}
        <header className="sticky top-0 z-40 bg-slate-950/60 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={navigateToStore}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Atelier Storefront</span>
          </button>

          <span className="hidden sm:inline-block text-white/70 text-xs font-serif italic">
            Mosiac Client Archival Registry
          </span>

          {isCurrentOrderValidated ? (
            <button
              type="button"
              onClick={() => setIsReceiptLookupOpen(false)}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer border border-white/10"
            >
              Cancel &amp; View Current Receipt
            </button>
          ) : (
            <div className="w-16" />
          )}
        </header>

        {/* Lookup form */}
        <main className="relative z-10 py-10 sm:py-16 px-4 sm:px-6 flex flex-col items-center justify-center min-h-[calc(100vh-65px)]">
          <ReceiptLookupForm
            onSuccess={() => {
              setIsReceiptLookupOpen(false);
            }}
            onCancel={() => {
              setIsReceiptLookupOpen(false);
            }}
            canCancel={isCurrentOrderValidated}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-900 font-sans selection:bg-black selection:text-white overflow-x-hidden">
      {/* 1. RANDOM BLURRY COLORFUL AMBIENT BACKGROUND */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0 print:hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-slate-950/70 z-10 backdrop-blur-[40px]" />
        
        {/* Animated dynamic blur orbs */}
        {currentPalette.orbs.map((orb, i) => (
          <motion.div
            key={`${paletteIndex}-${i}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.95, 1.15, 0.95],
              x: [0, (i % 2 === 0 ? 30 : -30), 0],
              y: [0, (i % 2 === 0 ? -25 : 25), 0],
              opacity: 1
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className={`absolute rounded-full filter blur-[95px] md:blur-[130px] ${orb.color} ${orb.size} ${orb.opacity}`}
            style={{
              top: orb.top,
              left: orb.left,
              right: orb.right,
              bottom: orb.bottom
            }}
          />
        ))}

        {/* Subtle noise/grid grain overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-30 z-20" />
      </div>

      {/* 2. TOP FLOATING CONTROL BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/60 backdrop-blur-xl border-b border-white/10 px-3 sm:px-8 py-3 flex items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={navigateToStore}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium tracking-tight transition-colors cursor-pointer border border-white/10 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Return to Store</span>
            <span className="sm:hidden">Store</span>
          </button>

          <span className="hidden sm:inline-block text-white/40 text-xs">·</span>
          <span className="hidden sm:inline-block text-white/70 text-xs tracking-tight font-serif italic truncate">
            Mosiac Digital Client Receipt &amp; Pass
          </span>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Verify / Look Up Another Order */}
          <button
            type="button"
            id="receipt-lookup-open-btn"
            onClick={openReceiptLookup}
            title="Look up and validate another order receipt"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer border border-white/10"
          >
            <Search className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline">Verify Another Order</span>
            <span className="md:hidden">Lookup</span>
          </button>

          {/* Atmosphere Randomizer */}
          <button
            type="button"
            onClick={handleShuffleAtmosphere}
            title={`Current: ${currentPalette.name} · Click to shuffle aura`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-medium transition-colors cursor-pointer border border-white/10"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[11px]">{currentPalette.name}</span>
          </button>

          {/* Copy Unique Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer border border-white/10 shadow-sm"
          >
            {linkCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-white/80" />
                <span className="hidden sm:inline">Copy Unique Link</span>
                <span className="sm:hidden">Share</span>
              </>
            )}
          </button>

          {/* Download PDF Pass */}
          <button
            type="button"
            id="receipt-download-pdf-btn"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-300 text-xs font-semibold tracking-tight transition-all cursor-pointer shadow-md"
            title="Save high-resolution archival PDF pass"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                <span className="hidden sm:inline">Generating PDF...</span>
                <span className="sm:hidden">Saving...</span>
              </>
            ) : pdfSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">PDF Saved!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save PDF Pass</span>
                <span className="sm:hidden">Save PDF</span>
              </>
            )}
          </button>

          {/* Physical Browser Print */}
          <button
            type="button"
            onClick={() => window.print()}
            title="Print paper copy via browser dialog"
            className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer border border-white/10"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="relative z-10 py-8 sm:py-14 px-4 sm:px-6 flex flex-col items-center justify-start min-h-[calc(100vh-65px)]">
        
        {/* Subtle Status Eyebrow above receipt */}
        <div className="mb-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-white text-xs font-medium print:hidden">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Payment Authorized & Recorded</span>
          <span className="text-white/40">·</span>
          <span className="font-mono text-[11px] text-white/70">{order.id}</span>
        </div>

        {/* 4. TICKET / RECEIPT CARD (Inspired directly by references) */}
        <div
          ref={receiptRef}
          id="printable-receipt-card"
          className="w-full max-w-[540px] bg-white rounded-3xl shadow-2xl shadow-black/40 overflow-hidden relative border border-neutral-100 print:shadow-none print:border-none print:m-0 print:max-w-none print:w-full"
        >
          {/* TOP OBSIDIAN BRAND HEADER */}
          <div className="bg-neutral-950 text-white p-6 sm:p-7 relative overflow-hidden">
            {/* Background geometric accents */}
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-serif italic text-xl font-normal tracking-tight">Mosiac</span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-sans border-l border-white/20 pl-2">
                  Atelier
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold tracking-wider uppercase">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{order.status === 'Fulfilled' ? 'Completed' : 'Paid & Confirmed'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
                Official Digital Receipt & Transit Pass
              </div>
              <h1 className="text-2xl font-serif font-normal tracking-tight text-white">
                Textile Commission
              </h1>
            </div>

            {/* Quick meta grid */}
            <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-neutral-800 text-xs">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                  Reference Code
                </span>
                <span className="font-mono text-white text-xs font-semibold">
                  {order.receiptId || `RCP-${order.id}`}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                  Date Authorized
                </span>
                <span className="text-white text-xs">
                  {order.date} · 14:32 UTC
                </span>
              </div>
            </div>
          </div>

          {/* TRANSIT STRIP (Boarding pass / Uber style route visualization) */}
          <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="block text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400">
                  Origin Loom
                </span>
                <span className="font-medium text-neutral-900 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-neutral-400" />
                  Atelier Nordic (Paris)
                </span>
              </div>

              {/* Transit Flight Line */}
              <div className="flex-1 mx-4 flex flex-col items-center">
                <div className="w-full flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                  <div className="flex-1 border-b border-dashed border-neutral-300 relative">
                    <Truck className="w-3.5 h-3.5 text-neutral-700 absolute left-1/2 -top-2 -translate-x-1/2 bg-neutral-50 px-0.5" />
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                </div>
                <span className="text-[9px] text-neutral-400 uppercase tracking-wider mt-1">
                  White-Glove Inspected
                </span>
              </div>

              <div className="text-right">
                <span className="block text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400">
                  Client Residence
                </span>
                <span className="font-medium text-neutral-900 text-xs">
                  {order.destinationCity || 'Paris, France'}
                </span>
              </div>
            </div>
          </div>

          {/* SCALLOPED PERFORATION NOTCHES (Classic boarding pass tear line) */}
          <div className="relative h-6 bg-white flex items-center justify-between overflow-hidden">
            {/* Left circular notch cutout */}
            <div className="w-6 h-6 rounded-full bg-slate-950 -ml-3 border-r border-neutral-200 print:hidden receipt-perforation-notch" />
            
            {/* Dashed perforation line */}
            <div className="flex-1 border-b-2 border-dashed border-neutral-200 mx-1" />
            
            {/* Right circular notch cutout */}
            <div className="w-6 h-6 rounded-full bg-slate-950 -mr-3 border-l border-neutral-200 print:hidden receipt-perforation-notch" />
          </div>

          {/* RECEIPT BODY */}
          <div className="p-6 sm:p-7 space-y-6">
            
            {/* Client Personal Greeting */}
            <div className="pb-4 border-b border-neutral-100">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-neutral-400 block mb-1">
                Client Commission Record
              </span>
              <p className="text-base font-medium text-neutral-900 leading-snug">
                {order.customerName}, thank you for commissioning Mosiac.
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                A verification record has been registered to <span className="font-medium text-neutral-800">{order.customerEmail}</span>.
              </p>
            </div>

            {/* Prominent Grand Total Display */}
            <div className="bg-neutral-50 rounded-2xl p-4 sm:p-5 flex items-baseline justify-between border border-neutral-100">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 block">
                  Amount Fulfilled
                </span>
                <span className="text-xs text-neutral-500 font-medium">
                  Includes all custom atelier finishes & freight
                </span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-serif font-normal text-neutral-950 tracking-tight">
                  {formatPrice(order.total)}
                </span>
                <span className="block text-[10px] uppercase font-mono tracking-wider text-emerald-600 font-semibold">
                  {order.currency} · Paid in Full
                </span>
              </div>
            </div>

            {/* Line Items List */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 block">
                Commissioned Artworks ({order.items?.length || order.itemsCount || 1})
              </span>

              <div className="divide-y divide-neutral-100">
                {(order.items && order.items.length > 0) ? (
                  order.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center gap-3.5">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="w-14 h-14 rounded-xl object-cover border border-neutral-200 shrink-0 bg-neutral-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                          <Scissors className="w-5 h-5 text-neutral-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-neutral-900 truncate">
                          {item.productName}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-neutral-500 mt-0.5">
                          <span className="font-medium text-neutral-700">
                            Scale: {item.sizeLabel} ({item.dimensions || '200 × 200 cm'})
                          </span>
                          <span>·</span>
                          <span>{item.colorName}</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-semibold text-neutral-900">
                          {formatPrice(item.total)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback generic item if order didn't have array
                  <div className="py-3 flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                      <Scissors className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-neutral-900">
                        Mosiac Bespoke Architectural Textile
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Hand-tufted 100% New Zealand highland wool
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-semibold text-neutral-900">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-mono">{formatPrice(order.subtotal || order.total)}</span>
              </div>

              {order.discount ? (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Atelier Promo ({order.promoCode || 'PROMO'})</span>
                  <span className="font-mono">-{formatPrice(order.discount)}</span>
                </div>
              ) : null}

              <div className="flex justify-between text-neutral-600">
                <span>White-Glove Inspected Freight</span>
                <span className="text-emerald-700 font-semibold uppercase text-[10px]">
                  Complimentary ($0)
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-200 flex justify-between text-neutral-950 font-bold text-sm">
                <span>Total Settled</span>
                <span className="font-mono text-base">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Payment & Security Footer */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-neutral-500">
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">
                  {order.paymentMethod || 'Credit Card'} (•••• {order.cardLast4 || '4192'})
                </span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-emerald-700 font-medium">256-Bit SSL Encrypted</span>
              </div>
            </div>

            {/* BARCODE & QR CODE FOOTER (Boarding pass / Ticket verification) */}
            <div className="pt-5 border-t border-neutral-200 flex items-center justify-between gap-4">
              {/* Authentic SVG Barcode */}
              <div className="flex-1 min-w-0">
                <svg
                  className="w-full h-12 text-neutral-900"
                  viewBox="0 0 280 48"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Official Verification Barcode"
                >
                  <rect x="0" y="0" width="3" height="48" />
                  <rect x="5" y="0" width="1.5" height="48" />
                  <rect x="9" y="0" width="4" height="48" />
                  <rect x="15" y="0" width="2" height="48" />
                  <rect x="19" y="0" width="1.5" height="48" />
                  <rect x="23" y="0" width="4" height="48" />
                  <rect x="29" y="0" width="1" height="48" />
                  <rect x="33" y="0" width="3" height="48" />
                  <rect x="38" y="0" width="2" height="48" />
                  <rect x="43" y="0" width="1.5" height="48" />
                  <rect x="47" y="0" width="3.5" height="48" />
                  <rect x="53" y="0" width="1" height="48" />
                  <rect x="57" y="0" width="4.5" height="48" />
                  <rect x="64" y="0" width="2" height="48" />
                  <rect x="68" y="0" width="1.5" height="48" />
                  <rect x="72" y="0" width="3" height="48" />
                  <rect x="78" y="0" width="1" height="48" />
                  <rect x="82" y="0" width="4" height="48" />
                  <rect x="88" y="0" width="2" height="48" />
                  <rect x="93" y="0" width="3" height="48" />
                  <rect x="98" y="0" width="1.5" height="48" />
                  <rect x="102" y="0" width="3.5" height="48" />
                  <rect x="108" y="0" width="1.5" height="48" />
                  <rect x="112" y="0" width="4" height="48" />
                  <rect x="118" y="0" width="1" height="48" />
                  <rect x="122" y="0" width="3" height="48" />
                  <rect x="127" y="0" width="2" height="48" />
                  <rect x="132" y="0" width="4" height="48" />
                  <rect x="138" y="0" width="1" height="48" />
                  <rect x="142" y="0" width="3" height="48" />
                  <rect x="147" y="0" width="2" height="48" />
                  <rect x="152" y="0" width="1.5" height="48" />
                  <rect x="156" y="0" width="4" height="48" />
                  <rect x="162" y="0" width="1" height="48" />
                  <rect x="166" y="0" width="3" height="48" />
                  <rect x="171" y="0" width="2" height="48" />
                  <rect x="176" y="0" width="4" height="48" />
                  <rect x="182" y="0" width="1.5" height="48" />
                  <rect x="186" y="0" width="3" height="48" />
                  <rect x="191" y="0" width="1" height="48" />
                  <rect x="195" y="0" width="4" height="48" />
                  <rect x="201" y="0" width="2" height="48" />
                  <rect x="205" y="0" width="3" height="48" />
                  <rect x="210" y="0" width="1" height="48" />
                  <rect x="214" y="0" width="4" height="48" />
                  <rect x="220" y="0" width="2" height="48" />
                  <rect x="224" y="0" width="1.5" height="48" />
                  <rect x="228" y="0" width="3" height="48" />
                  <rect x="234" y="0" width="1" height="48" />
                  <rect x="238" y="0" width="4" height="48" />
                  <rect x="244" y="0" width="2" height="48" />
                  <rect x="248" y="0" width="3.5" height="48" />
                  <rect x="254" y="0" width="1" height="48" />
                  <rect x="258" y="0" width="4" height="48" />
                  <rect x="264" y="0" width="2" height="48" />
                  <rect x="268" y="0" width="3" height="48" />
                  <rect x="274" y="0" width="2" height="48" />
                  <rect x="278" y="0" width="2" height="48" />
                </svg>
                <span className="font-mono text-[9px] tracking-[0.25em] text-neutral-400 block text-center mt-1">
                  MOSIAC·{order.id}·AUTHENTIC
                </span>
              </div>

              {/* Geometric Digital QR matrix representation */}
              <div className="shrink-0 flex flex-col items-center">
                <div
                  onClick={handleCopyLink}
                  title="Click to copy unique link"
                  className="w-14 h-14 bg-neutral-900 rounded-lg p-1.5 flex flex-col justify-between cursor-pointer hover:opacity-90 transition-opacity group relative shadow-sm"
                >
                  {/* Stylized QR patterns */}
                  <div className="flex justify-between">
                    <div className="w-3.5 h-3.5 border-2 border-white rounded-[2px] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-[1px]" />
                    </div>
                    <div className="w-3.5 h-3.5 border-2 border-white rounded-[2px] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-[1px]" />
                    </div>
                  </div>
                  <div className="flex justify-around items-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    <div className="w-2 h-1 bg-white" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="w-3.5 h-3.5 border-2 border-white rounded-[2px] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-[1px]" />
                    </div>
                    <div className="w-3 h-3 bg-white/40 flex flex-wrap gap-0.5 p-0.5">
                      <div className="w-1 h-1 bg-white" />
                      <div className="w-1 h-1 bg-white" />
                    </div>
                  </div>
                </div>
                <span className="text-[8px] text-neutral-400 uppercase tracking-widest mt-1">
                  Scan Pass
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* 5. UNCLUTTERED AUXILIARY SECTION CONTROLS (Pills under ticket) */}
        {/* User requested: "options to see order status (if order isnt received yet), care tips(after delivery), returns and refunds, terms and conditions too, but make sure they dont clog the design" */}
        <div className="w-full max-w-[540px] mt-6 print:hidden">
          
          {/* Elegant pill toggle tabs */}
          <div className="flex items-center justify-center gap-1.5 p-1 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-lg overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'status' ? null : 'status')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'status'
                  ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Order Status</span>
              {order.status !== 'Fulfilled' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'care' ? null : 'care')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'care'
                  ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Care Tips</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'returns' ? null : 'returns')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'returns'
                  ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Returns</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'terms' ? null : 'terms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'terms'
                  ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms</span>
            </button>
          </div>

          {/* EXPANDABLE DRAWER CARD (Keeps main receipt completely uncluttered) */}
          <AnimatePresence mode="wait">
            {activeTab && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -12, height: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="overflow-hidden mt-3"
              >
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/40 shadow-2xl text-neutral-900">
                  
                  {/* SECTION 1: ORDER STATUS & FABRICATION TRACKER */}
                  {activeTab === 'status' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                        <div>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold block">
                            Live Loom & Freight Tracker
                          </span>
                          <h3 className="text-sm font-semibold text-neutral-900">
                            Current Status: <span className="text-emerald-600">{order.status}</span>
                          </h3>
                        </div>
                        <span className="text-xs text-neutral-500 font-medium">
                          Estimated Delivery: <strong className="text-neutral-900">{order.estimatedDelivery || '3–5 Business Days'}</strong>
                        </span>
                      </div>

                      {/* Stepper Timeline */}
                      <div className="space-y-4 pt-1">
                        {steps.map((step, idx) => (
                          <div key={step.id} className="flex items-start gap-3 relative">
                            {idx < steps.length - 1 && (
                              <div
                                className={`absolute left-3.5 top-7 bottom-0 w-0.5 -ml-[1px] ${
                                  step.completed ? 'bg-emerald-500' : 'bg-neutral-200'
                                }`}
                              />
                            )}

                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                                step.completed
                                  ? 'bg-emerald-600 text-white'
                                  : step.active
                                  ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                                  : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                              }`}
                            >
                              {step.completed ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <span className="text-[11px] font-bold">{idx + 1}</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-center justify-between">
                                <h4 className={`text-xs font-semibold ${step.completed || step.active ? 'text-neutral-900' : 'text-neutral-500'}`}>
                                  {step.label}
                                </h4>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                  {step.date}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-500 mt-0.5">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tracking code bar */}
                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between bg-neutral-50 p-3 rounded-xl">
                        <div className="min-w-0">
                          <span className="block text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">
                            White-Glove Carrier & Air Waybill
                          </span>
                          <span className="font-mono text-xs font-bold text-neutral-800 truncate block">
                            {order.carrier || 'DHL Express White-Glove'} · {order.trackingNumber || 'MOS-772910'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyTracking(order.trackingNumber || 'MOS-772910')}
                          className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-[11px] font-medium rounded-md shadow-xs transition-colors cursor-pointer shrink-0"
                        >
                          {trackingCopied ? 'Copied' : 'Copy Air Waybill'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: CARE & MAINTENANCE TIPS (AFTER DELIVERY) */}
                  {activeTab === 'care' && (
                    <div className="space-y-3.5">
                      <div className="pb-2 border-b border-neutral-100">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold block">
                          Master Atelier Preservation
                        </span>
                        <h3 className="text-sm font-semibold text-neutral-900">
                          Care Guide for Your Bespoke Wool Rug
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                          <strong className="text-neutral-900 block font-semibold mb-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            1. Unrolling & Fiber Bloom
                          </strong>
                          <p className="text-neutral-600 text-[11px] leading-relaxed">
                            Allow 48 to 72 hours for your high-pile New Zealand wool fibers to settle and naturally breathe after climate-controlled transit.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                          <strong className="text-neutral-900 block font-semibold mb-1 flex items-center gap-1.5">
                            <Scissors className="w-3.5 h-3.5 text-indigo-600" />
                            2. Suction-Only Vacuuming
                          </strong>
                          <p className="text-neutral-600 text-[11px] leading-relaxed">
                            Vacuum once weekly using pure suction. Strictly avoid motorized beater bars to protect the sculptural hand-carved relief contours.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                          <strong className="text-neutral-900 block font-semibold mb-1 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                            3. Accidental Spot Treatment
                          </strong>
                          <p className="text-neutral-600 text-[11px] leading-relaxed">
                            Dab immediately with a clean cotton towel and cold spring water. Never rub or scrub the wool yarn twists.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                          <strong className="text-neutral-900 block font-semibold mb-1 flex items-center gap-1.5">
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                            4. Biannual 180° Rotation
                          </strong>
                          <p className="text-neutral-600 text-[11px] leading-relaxed">
                            Rotate your textile 180° twice a year to ensure uniform natural light exposure and even architectural foot traffic patina.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 3: RETURNS & ATELIER GUARANTEE */}
                  {activeTab === 'returns' && (
                    <div className="space-y-3">
                      <div className="pb-2 border-b border-neutral-100">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold block">
                          Client Protection
                        </span>
                        <h3 className="text-sm font-semibold text-neutral-900">
                          30-Day White-Glove In-Home Trial
                        </h3>
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed">
                        We understand that living with an architectural textile is an intimate spatial decision. If the scale, pile height, or chromatic nuance does not harmonize with your interior, you may request an exchange or full refund within 30 days of delivery.
                      </p>

                      <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-neutral-800 font-medium">
                          <PackageCheck className="w-4 h-4 text-emerald-600" />
                          <span>Complimentary White-Box Return Freight</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 pl-6">
                          Our logistics concierge coordinates white-glove retrieval directly from your residence at zero fee to you.
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-neutral-500">Concierge Desk: concierge@rugmosiac.com</span>
                        <a
                          href="mailto:concierge@rugmosiac.com?subject=Atelier Return Inquiry"
                          className="text-neutral-950 font-semibold hover:underline flex items-center gap-1"
                        >
                          <span>Contact Atelier</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* SECTION 4: TERMS & CONDITIONS */}
                  {activeTab === 'terms' && (
                    <div className="space-y-3 text-xs">
                      <div className="pb-2 border-b border-neutral-100">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold block">
                          Atelier Provenance & Legal
                        </span>
                        <h3 className="text-sm font-semibold text-neutral-900">
                          Terms of Commission & Ownership
                        </h3>
                      </div>

                      <div className="space-y-2 text-[11px] text-neutral-600 leading-relaxed max-h-48 overflow-y-auto pr-1">
                        <p>
                          <strong>1. Artisanal Authenticity:</strong> Each Mosiac textile is individually hand-tufted and carved by master artisans. Subtle natural deviations in pile relief (+/- 3%) and organic dye saturation are hallmarks of unique craftsmanship.
                        </p>
                        <p>
                          <strong>2. Material Provenance:</strong> Fabricated exclusively with 100% un-dyed or botanically treated New Zealand highland wool, backed with organic unbleached cotton primary cloth and natural latex adhesive.
                        </p>
                        <p>
                          <strong>3. Archival Registration:</strong> Receipt #{order.receiptId || order.id} constitutes proof of original commission and registers the textile with Mosiac Atelier’s permanent provenance archive.
                        </p>
                        <p>
                          <strong>4. Concierge Warranty:</strong> Covered by our 5-year structural warranty against tuft release or dimensional warping under normal residential use.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Close pill */}
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveTab(null)}
                      className="text-[11px] text-neutral-500 hover:text-neutral-900 font-medium cursor-pointer transition-colors"
                    >
                      Hide section details ↑
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info link */}
        <div className="mt-8 text-center text-xs text-white/50 print:hidden">
          <p>Need custom dimensional adjustments or private trade billing?</p>
          <button
            type="button"
            onClick={navigateToStore}
            className="text-white/80 hover:text-white underline underline-offset-4 mt-1 cursor-pointer transition-colors"
          >
            Return to Mosiac Storefront
          </button>
        </div>
      </main>

      {/* PRINT-ONLY STYLESHEET EMBED */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          header, footer, .print\\:hidden {
            display: none !important;
          }
          #printable-receipt-card {
            box-shadow: none !important;
            border: 1px solid #d4d4d4 !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 auto !important;
            page-break-inside: avoid !important;
          }
        }
      `}} />
    </div>
  );
};
