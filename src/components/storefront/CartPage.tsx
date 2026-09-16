import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowLeft, ChevronDown, Plus, Minus, X, CreditCard, CheckCircle2, ShoppingBag, Receipt, Copy, Check, ExternalLink, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../../types';
import { CustomSelect } from '../common/CustomSelect';

export const CartPage: React.FC = () => {
  const {
    cart,
    products,
    updateCartQuantity,
    updateCartItemSize,
    removeFromCart,
    cartSubtotalUSD,
    cartPromoDiscountUSD,
    cartFinalTotalUSD,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    formatPrice,
    navigateToStore,
    submitCheckoutOrder,
    navigateToReceipt,
  } = useStore();

  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'paypal'>('credit');
  const [nameOnCard, setNameOnCard] = useState('John Carter');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 2153');
  const [expMonth, setExpMonth] = useState('05');
  const [expYear, setExpYear] = useState('2026');
  const [cvv, setCvv] = useState('156');
  const [customerEmail, setCustomerEmail] = useState('client@mosiac-design.com');

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput.trim());
    if (res.success) {
      setPromoMessage({ text: res.message, error: false });
      setPromoInput('');
    } else {
      setPromoMessage({ text: res.message, error: true });
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      const order = submitCheckoutOrder({
        customerName: nameOnCard || 'Private Client',
        customerEmail: customerEmail || 'client@mosiac.com',
        paymentMethod: paymentMethod === 'credit' ? 'Credit Card' : 'PayPal',
        cardLast4: cardNumber.slice(-4)
      });
      setIsProcessing(false);
      setCompletedOrder(order);
    }, 1000);
  };

  return (
    <div className="w-full bg-white text-neutral-900 min-h-[calc(100vh-60px)] pb-24 pt-6 sm:pt-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 mb-6 sm:mb-8 font-serif">
          Shopping Cart.
        </h1>

        {cart.length === 0 && !completedOrder ? (
          <div className="py-16 text-center max-w-md mx-auto">
            <ShoppingBag className="w-12 h-12 stroke-[1.2] mx-auto text-neutral-300 mb-4" />
            <h2 className="text-base font-medium text-neutral-800 uppercase tracking-wider mb-2">Your Bag is Empty</h2>
            <p className="text-xs text-neutral-400 font-light mb-6">Explore the studio collection to add bespoke rugs to your cart.</p>
            <button
              type="button"
              onClick={navigateToStore}
              className="px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium bg-black text-white rounded-sm hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Explore Catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Cart Table */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="overflow-x-auto pb-2 sm:pb-0">
                <div className="min-w-[480px] sm:min-w-0">
                  {/* Table Column Headers */}
                <div className="grid grid-cols-12 pb-3 border-b border-neutral-200 text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-neutral-400 font-medium">
                  <div className="col-span-5 sm:col-span-5">Product</div>
                  <div className="col-span-3 sm:col-span-3 text-center sm:text-left">Size</div>
                  <div className="col-span-2 sm:col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 sm:col-span-2 text-right">Total Price</div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-neutral-100">
                  {cart.map((item, idx) => {
                    const product = products.find(p => p.id === item.productId);
                    if (!product) return null;

                    const currentSize = product.sizes.find(s => s.id === item.sizeId) || product.sizes[0];
                    const itemPrice = currentSize ? currentSize.price : product.fromPrice;
                    const itemTotal = itemPrice * item.quantity;

                    return (
                      <div key={`${item.productId}-${item.sizeId}-${item.colorName}-${idx}`} className="py-4 sm:py-5 grid grid-cols-12 items-center gap-2">
                        {/* Product Thumbnail & Title */}
                        <div className="col-span-5 sm:col-span-5 flex items-center gap-3 sm:gap-4">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-sm bg-neutral-100 overflow-hidden flex items-center justify-center shrink-0 p-1.5">
                            <img
                              src={product.cardImage}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0 pr-1">
                            <div className="text-xs sm:text-sm font-medium text-neutral-900 truncate font-serif">
                              {product.name}
                            </div>
                            <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                              {item.colorName}
                            </div>
                          </div>
                        </div>

                        {/* Size Selector Dropdown */}
                        <div className="col-span-3 sm:col-span-3 flex justify-center sm:justify-start min-w-0 sm:min-w-[110px]">
                          <CustomSelect
                            value={item.sizeId}
                            onChange={(val) => updateCartItemSize(idx, val)}
                            options={product.sizes.map(s => ({
                              value: s.id,
                              label: s.label
                            }))}
                            buttonClassName="py-1 px-2 sm:px-2.5 text-[10px] sm:text-[11px] bg-neutral-50 hover:bg-neutral-100 border-neutral-200 truncate"
                            menuClassName="min-w-[120px] sm:min-w-[160px]"
                          />
                        </div>

                      {/* Quantity Stepper */}
                      <div className="col-span-2 sm:col-span-2 flex items-center justify-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(idx, -1)}
                          className="w-6 h-6 rounded-sm hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-black cursor-pointer transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-medium select-none w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(idx, 1)}
                          className="w-6 h-6 rounded-sm hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-black cursor-pointer transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total Price & Remove Button */}
                      <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-2">
                        <span className="text-xs sm:text-sm font-semibold font-mono text-neutral-900">
                          {formatPrice(itemTotal)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(idx)}
                          className="p-1 text-neutral-300 hover:text-neutral-700 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              </div>
              </div>

              {/* Promo Code Entry & Subtotal */}
              <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-start gap-6">
                {/* Promo code field */}
                <div className="w-full sm:max-w-xs">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-600 font-semibold mb-2">
                    Have a Promo Code?
                  </div>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-sm text-xs">
                      <div>
                        <span className="font-mono font-bold text-emerald-800">{appliedPromo.code}</span>
                        <span className="text-emerald-700 ml-2">
                          {appliedPromo.discountFixedRWF
                            ? `(${appliedPromo.discountFixedRWF.toLocaleString()} Rwf Free Credit)`
                            : `(${appliedPromo.discountPercent}% off)`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removePromoCode}
                        className="text-[10px] text-neutral-400 hover:text-red-600 uppercase tracking-wider underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="e.g. RWF25K or MOSIAC10"
                        className="flex-1 bg-white border border-neutral-300 rounded-sm px-3 py-1.5 text-xs font-mono uppercase focus:outline-none focus:border-black"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-black text-white text-[10px] uppercase tracking-wider font-semibold rounded-sm hover:bg-neutral-800 cursor-pointer transition-colors"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  {promoMessage && (
                    <p className={`text-[11px] mt-1.5 ${promoMessage.error ? 'text-red-500' : 'text-emerald-600'}`}>
                      {promoMessage.text}
                    </p>
                  )}
                </div>

                {/* Subtotal breakdown */}
                <div className="w-full sm:w-64 flex flex-col items-end space-y-2 text-xs">
                  <div className="flex justify-between w-full text-neutral-500">
                    <span>Subtotal:</span>
                    <span className="font-mono font-medium text-neutral-900">{formatPrice(cartSubtotalUSD)}</span>
                  </div>

                  {cartPromoDiscountUSD > 0 && (
                    <div className="flex justify-between w-full text-emerald-600">
                      <span>
                        {appliedPromo?.discountFixedRWF
                          ? `Promo Credit (${appliedPromo.discountFixedRWF.toLocaleString()} Rwf):`
                          : `Promo Discount (${appliedPromo?.discountPercent}%):`}
                      </span>
                      <span className="font-mono font-medium">-{formatPrice(cartPromoDiscountUSD)}</span>
                    </div>
                  )}

                  <div className="flex justify-between w-full text-neutral-500">
                    <span>Shipping:</span>
                    <span className="font-mono font-medium text-emerald-600 uppercase tracking-wider text-[11px]">Free</span>
                  </div>
                  <div className="flex justify-between w-full text-neutral-900 pt-2 border-t border-neutral-200 text-sm font-bold">
                    <span>Total:</span>
                    <span className="font-mono">{formatPrice(cartFinalTotalUSD)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Payment Info. card */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-[#f8f8f9] rounded-sm p-6 sm:p-7 border border-neutral-200">
                <h2 className="text-base font-bold text-neutral-900 mb-5">
                  Payment Info.
                </h2>

                <form onSubmit={handleCheckout} className="space-y-4">
                  {/* Payment Method Selector */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block mb-2">
                      Payment Method:
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'credit'}
                          onChange={() => setPaymentMethod('credit')}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <span className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-neutral-600" />
                          Credit Card
                        </span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'paypal'}
                          onChange={() => setPaymentMethod('paypal')}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <span>PayPal</span>
                      </label>
                    </div>
                  </div>

                  {/* Name On Card */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block mb-1">
                      Name On Card:
                    </label>
                    <input
                      type="text"
                      required
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-sm px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-black transition-colors"
                      placeholder="e.g. John Carter"
                    />
                  </div>

                  {/* Customer Email */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block mb-1">
                      Order Notification Email:
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-sm px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-black transition-colors"
                      placeholder="client@mosiac.com"
                    />
                  </div>

                  {/* Card Number */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block mb-1">
                      Card Number:
                    </label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-black transition-colors"
                      placeholder="•••• •••• •••• 2153"
                    />
                  </div>

                  {/* Expiration Date & CVV */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block mb-1">
                        Expiration Date:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <CustomSelect
                          value={expMonth}
                          onChange={(val) => setExpMonth(val)}
                          options={['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => ({
                            value: m,
                            label: m
                          }))}
                          buttonClassName="py-1.5 px-2.5 text-xs bg-white border-neutral-300"
                        />
                        <CustomSelect
                          value={expYear}
                          onChange={(val) => setExpYear(val)}
                          options={['2026', '2027', '2028', '2029', '2030'].map(y => ({
                            value: y,
                            label: y
                          }))}
                          buttonClassName="py-1.5 px-2.5 text-xs bg-white border-neutral-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block mb-1">
                        CVV:
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-black transition-colors"
                        placeholder="156"
                      />
                    </div>
                  </div>

                  {/* Primary Blue Checkout CTA */}
                  <div className="pt-2">
                    <button
                      id="checkout-submit-btn"
                      type="submit"
                      disabled={isProcessing || cart.length === 0}
                      className="w-full py-3.5 px-6 rounded-sm bg-[#2f54eb] hover:bg-[#2040c5] text-white font-medium text-xs uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {isProcessing ? 'Authorizing...' : `Check Out (${formatPrice(cartFinalTotalUSD)})`}
                    </button>
                  </div>

                  <p className="text-[10px] text-neutral-400 text-center font-light pt-1">
                    256-bit encrypted studio transaction. Guaranteed white-glove transport.
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Complete Modal */}
      <AnimatePresence>
        {completedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-7 text-center border border-neutral-200 overflow-hidden relative"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono mb-1">
                Payment Authorized & Settled
              </div>
              <h2 className="text-xl font-serif font-normal text-neutral-900 mb-1">
                Thank You, {completedOrder.customerName}
              </h2>
              <p className="text-xs text-neutral-500 font-light mb-4">
                Your commission has been registered under reference <span className="font-mono font-semibold text-neutral-800">{completedOrder.id}</span>.
              </p>

              <div className="bg-neutral-50 rounded-xl p-4 text-left text-xs mb-5 space-y-2 border border-neutral-200">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total Settled:</span>
                  <span className="font-mono font-bold text-neutral-900">{formatPrice(completedOrder.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Receipt Pass ID:</span>
                  <span className="font-mono text-neutral-800">{completedOrder.receiptId || `RCP-${completedOrder.id}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Logistics Transit:</span>
                  <span className="text-emerald-700 font-medium">White-Glove Inspected Direct Flight</span>
                </div>
              </div>

              {/* Action Buttons: View Receipt & Unique Link */}
              <div className="space-y-2.5 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    const oId = completedOrder.id;
                    setCompletedOrder(null);
                    navigateToReceipt(oId);
                  }}
                  className="w-full py-3 px-5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.16em] font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Receipt className="w-4 h-4 text-amber-300" />
                  <span>View Official Receipt & Pass</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const link = `${window.location.origin}${window.location.pathname}#/receipt/${completedOrder.id}`;
                    navigator.clipboard?.writeText(link);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2200);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer border border-neutral-200"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Receipt Link Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Copy Client Unique Receipt Link</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCompletedOrder(null);
                  navigateToStore();
                }}
                className="text-xs text-neutral-400 hover:text-neutral-700 font-medium transition-colors cursor-pointer pt-1"
              >
                Return to Storefront Catalog
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
