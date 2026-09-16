import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  FileText,
  User,
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface ReceiptLookupFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  canCancel?: boolean;
}

export const ReceiptLookupForm: React.FC<ReceiptLookupFormProps> = ({
  onSuccess,
  onCancel,
  canCancel = false
}) => {
  const { validateOrderAccess, navigateToStore, orders } = useStore();

  const [orderNumber, setOrderNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validatedSuccessName, setValidatedSuccessName] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanNum = orderNumber.trim();
    const cleanName = clientName.trim();

    if (!cleanNum) {
      setErrorMessage('Please enter your order number or reference code.');
      return;
    }
    if (!cleanName) {
      setErrorMessage('Please enter the client name on the order record.');
      return;
    }

    setIsValidating(true);
    setTimeout(() => {
      const res = validateOrderAccess(cleanNum, cleanName);
      setIsValidating(false);

      if (res.success && res.order) {
        setValidatedSuccessName(res.order.customerName);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 500);
      } else {
        setErrorMessage(
          res.error ||
            'We could not validate this order. Please verify your order reference and client name.'
        );
      }
    }, 350);
  };

  const handleQuickFill = (demoOrderNum: string, demoName: string) => {
    setOrderNumber(demoOrderNum);
    setClientName(demoName);
    setErrorMessage(null);
    setIsValidating(true);

    setTimeout(() => {
      const res = validateOrderAccess(demoOrderNum, demoName);
      setIsValidating(false);
      if (res.success && res.order) {
        setValidatedSuccessName(res.order.customerName);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 400);
      }
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.98 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[500px] bg-white rounded-3xl shadow-2xl shadow-black/40 overflow-hidden relative border border-neutral-200/80 text-neutral-900"
    >
      {/* Top Obsidian Atelier Header */}
      <div className="bg-neutral-950 text-white p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-xl font-normal tracking-tight">Mosiac</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-sans border-l border-white/20 pl-2">
              Archival Registry
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/90 border border-white/15 text-[10px] font-mono tracking-wider uppercase">
            <Lock className="w-3 h-3 text-amber-300" />
            <span>Secure Lookup</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
            Client Order &amp; Pass Verification
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-normal tracking-tight text-white leading-snug">
            Authenticate Commission Record
          </h1>
          <p className="text-xs text-neutral-400 font-light mt-1.5 leading-relaxed">
            Please enter your order reference number and the client name on file to validate and view your official digital transit pass.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="p-6 sm:p-7 space-y-6">
        {validatedSuccessName ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-mono tracking-[0.22em] text-emerald-600 font-semibold">
                Pass Authenticated
              </div>
              <h3 className="text-lg font-serif uppercase tracking-tight text-neutral-950">
                Welcome, {validatedSuccessName}
              </h3>
              <p className="text-xs text-neutral-500 font-light">
                Opening your official digital transit receipt and archival pass...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMessage}</div>
              </motion.div>
            )}

            <div>
              <label
                htmlFor="receipt-lookup-order-id"
                className="block text-[10px] uppercase font-mono tracking-wider text-neutral-600 font-semibold mb-1.5"
              >
                Order Number / Reference Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="receipt-lookup-order-id"
                  type="text"
                  required
                  placeholder="e.g. ORD-9021 or 9021"
                  value={orderNumber}
                  onChange={e => {
                    setOrderNumber(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono tracking-wider text-neutral-900 uppercase placeholder:normal-case placeholder:font-sans placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
                />
              </div>
              <p className="text-[10px] text-neutral-400 font-light mt-1">
                Located on your order confirmation email or SMS (e.g. ORD-9021).
              </p>
            </div>

            <div>
              <label
                htmlFor="receipt-lookup-client-name"
                className="block text-[10px] uppercase font-mono tracking-wider text-neutral-600 font-semibold mb-1.5"
              >
                Client / Collector Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="receipt-lookup-client-name"
                  type="text"
                  required
                  placeholder="e.g. Camille Moreau"
                  value={clientName}
                  onChange={e => {
                    setClientName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
                />
              </div>
              <p className="text-[10px] text-neutral-400 font-light mt-1">
                The name registered on the commission billing or shipping pass.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                id="receipt-lookup-submit-btn"
                type="submit"
                disabled={isValidating}
                className="w-full py-3 px-5 bg-black hover:bg-neutral-800 disabled:bg-neutral-600 text-white text-xs uppercase tracking-[0.16em] font-medium rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {isValidating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Validating Commission Record...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Validate &amp; Open Receipt</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </>
                )}
              </button>

              {canCancel && onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full py-2 text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-black transition-colors cursor-pointer"
                >
                  Cancel &amp; Return to Current Receipt
                </button>
              )}
            </div>
          </form>
        )}

        {/* Demo Archive Samples Quick-Fill Section */}
        <div className="pt-4 border-t border-neutral-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-neutral-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Demo Commissions for Review</span>
            </span>
            <span className="text-[9px] text-neutral-400 font-mono">1-Click Test</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('ORD-9021', 'Camille Moreau')}
              className="p-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-left transition-colors cursor-pointer group"
            >
              <div className="font-mono text-[10px] font-bold text-neutral-900 group-hover:text-black">
                ORD-9021
              </div>
              <div className="text-[10px] text-neutral-500 truncate">Camille Moreau</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('ORD-9020', 'Henrik Lindqvist')}
              className="p-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-left transition-colors cursor-pointer group"
            >
              <div className="font-mono text-[10px] font-bold text-neutral-900 group-hover:text-black">
                ORD-9020
              </div>
              <div className="text-[10px] text-neutral-500 truncate">Henrik Lindqvist</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('ORD-9019', 'Sora Takahashi')}
              className="p-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-left transition-colors cursor-pointer group"
            >
              <div className="font-mono text-[10px] font-bold text-neutral-900 group-hover:text-black">
                ORD-9019
              </div>
              <div className="text-[10px] text-neutral-500 truncate">Sora Takahashi</div>
            </button>
          </div>
        </div>

        {/* Storefront return link */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={navigateToStore}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black font-mono tracking-wider uppercase transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Mosiac Atelier</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
