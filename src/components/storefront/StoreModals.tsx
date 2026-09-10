import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';

export const StoreModals: React.FC = () => {
  const { activeModal, setActiveModal, cartSubtotalUSD, formatPrice, clearCart, showToast } = useStore();
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  if (!activeModal) return null;

  const closeModal = () => {
    setActiveModal(null);
    setCheckoutComplete(false);
    setContactSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={closeModal} />

      <div className="relative bg-white w-full max-w-lg border border-black/10 shadow-2xl z-10 p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={closeModal}
          className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Contact Modal */}
        {activeModal === 'contact' && (
          <div className="space-y-4">
            <h2 className="text-[14px] uppercase tracking-[0.25em] font-medium text-black">
              Studio Inquiry & Trade
            </h2>
            <p className="text-[12px] text-neutral-500 font-light leading-relaxed">
              We welcome private commissions, trade partnerships, and gallery inquiries. Please detail your project scope below.
            </p>

            {contactSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-black stroke-[1.5]" />
                <p className="text-[12px] uppercase tracking-wider font-medium">Inquiry Received</p>
                <p className="text-[11px] text-neutral-500">A studio curator will be in contact within 24 hours.</p>
              </div>
            ) : (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  setContactSubmitted(true);
                  showToast('Inquiry submitted');
                }}
                className="space-y-3 pt-2"
              >
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-neutral-500 mb-1">Name</label>
                  <input required type="text" className="w-full border border-neutral-200 px-3 py-2 text-[12px] focus:outline-black" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-neutral-500 mb-1">Email</label>
                  <input required type="email" className="w-full border border-neutral-200 px-3 py-2 text-[12px] focus:outline-black" placeholder="jane@arch.com" />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-neutral-500 mb-1">Message</label>
                  <textarea rows={3} required className="w-full border border-neutral-200 px-3 py-2 text-[12px] focus:outline-black" placeholder="Please specify items of interest or bespoke dimensions..." />
                </div>
                <button type="submit" className="w-full bg-black text-white text-[10px] uppercase tracking-[0.2em] py-3 hover:bg-neutral-800 transition-colors">
                  Send Inquiry
                </button>
              </form>
            )}
          </div>
        )}

        {/* Policies Modal */}
        {(activeModal === 'policies' || activeModal === 'faq') && (
          <div className="space-y-5">
            <h2 className="text-[14px] uppercase tracking-[0.25em] font-medium text-black">
              Studio Policies & Standards
            </h2>
            <div className="space-y-4 text-[12px] text-neutral-600 font-light leading-relaxed">
              <div>
                <h3 className="text-[11px] uppercase tracking-wider font-medium text-black mb-1">Craftsmanship & Variations</h3>
                <p>Every piece in our catalogue is handcrafted from natural stone, wild clay, cast bronze, or organic fibers. Subtle variations in fissure, grain, and patina are intentional markers of authenticity.</p>
              </div>
              <div>
                <h3 className="text-[11px] uppercase tracking-wider font-medium text-black mb-1">Returns & Inspection Period</h3>
                <p>We provide a 14-day return inspection window for stock items in pristine original crating. Made-to-order architectural commissions are non-refundable once casting or quarry cutting has commenced.</p>
              </div>
              <div>
                <h3 className="text-[11px] uppercase tracking-wider font-medium text-black mb-1">Global Freight & White Glove</h3>
                <p>All large items are crated in custom timber cases and transported with climate-monitored air freight. Local delivery teams unpack, position, and remove all crating materials.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="w-full border border-neutral-200 text-[10px] uppercase tracking-[0.2em] py-2.5 hover:border-black transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* Journal Modal */}
        {activeModal === 'journal' && (
          <div className="space-y-4">
            <h2 className="text-[14px] uppercase tracking-[0.25em] font-medium text-black">
              Studio Journal — Issue 04
            </h2>
            <p className="text-[11px] uppercase tracking-widest text-neutral-400">Notes on Monolithic Reductions</p>
            <div className="space-y-3 text-[12px] text-neutral-600 font-light leading-relaxed">
              <p>
                In our newest body of work, we eliminated decorative joinery in favor of raw mass. Roman travertine quarry blocks were selected for cellular density and carved using dry-diamond planar tools.
              </p>
              <p>
                The resulting silhouettes do not gesture toward ornament; rather, they anchor space through sheer volumetric weight and silent light reflection.
              </p>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="w-full bg-black text-white text-[10px] uppercase tracking-[0.2em] py-2.5 hover:bg-neutral-800 transition-colors"
            >
              Return to Shop
            </button>
          </div>
        )}

        {/* Checkout Modal */}
        {activeModal === 'checkout' && (
          <div className="space-y-5">
            <h2 className="text-[14px] uppercase tracking-[0.25em] font-medium text-black">
              Order Checkout
            </h2>

            {checkoutComplete ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 mx-auto text-black stroke-[1.2]" />
                <h3 className="text-[13px] uppercase tracking-[0.2em] font-medium">Order Confirmed</h3>
                <p className="text-[11px] text-neutral-500 font-mono">Reference: #FRM-{Math.floor(10000 + Math.random() * 90000)}</p>
                <p className="text-[12px] text-neutral-600 font-light leading-relaxed">
                  Thank you for collecting with FORMA. A confirmation email with timber crating schedule has been dispatched.
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-4 text-[10px] uppercase tracking-[0.2em] px-6 py-3 bg-black text-white hover:bg-neutral-800 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  clearCart();
                  setCheckoutComplete(true);
                  showToast('Order placed successfully!');
                }}
                className="space-y-4"
              >
                <div className="bg-neutral-50 p-3 border border-neutral-100 flex justify-between items-center text-[12px]">
                  <span className="uppercase tracking-widest text-[10px] text-neutral-500">Order Subtotal</span>
                  <span className="font-mono font-medium">{formatPrice(cartSubtotalUSD)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-neutral-500 mb-1">First Name</label>
                    <input required type="text" defaultValue="Elena" className="w-full border border-neutral-200 px-3 py-2 text-[12px]" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-neutral-500 mb-1">Last Name</label>
                    <input required type="text" defaultValue="Vance" className="w-full border border-neutral-200 px-3 py-2 text-[12px]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-neutral-500 mb-1">Delivery Address</label>
                  <input required type="text" defaultValue="742 Evergreen Terrace, Suite 4B" className="w-full border border-neutral-200 px-3 py-2 text-[12px]" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-neutral-500 mb-1">City / Region</label>
                    <input required type="text" defaultValue="New York, NY" className="w-full border border-neutral-200 px-3 py-2 text-[12px]" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-neutral-500 mb-1">Postal Code</label>
                    <input required type="text" defaultValue="10012" className="w-full border border-neutral-200 px-3 py-2 text-[12px]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-neutral-500 mb-1">Simulated Card Details</label>
                  <input required type="text" defaultValue="•••• •••• •••• 4242  (08/29)" className="w-full border border-neutral-200 px-3 py-2 text-[12px] font-mono bg-neutral-50 text-neutral-600" />
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white text-[11px] uppercase tracking-[0.2em] py-3.5 hover:bg-neutral-800 transition-colors flex items-center justify-between px-4"
                >
                  <span>Authorize Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
