import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowLeft, ChevronDown, Plus, Minus, X, CreditCard, CheckCircle2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../../types';

export const CartPage: React.FC = () => {
  const {
    cart,
    products,
    updateCartQuantity,
    updateCartItemSize,
    removeFromCart,
    cartSubtotalUSD,
    formatPrice,
    navigateToStore,
    submitCheckoutOrder,
    currency
  } = useStore();

  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'paypal'>('credit');
  const [nameOnCard, setNameOnCard] = useState('John Carter');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 2153');
  const [expMonth, setExpMonth] = useState('05');
  const [expYear, setExpYear] = useState('2026');
  const [cvv, setCvv] = useState('156');
  const [customerEmail, setCustomerEmail] = useState('client@atelier-design.com');

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      const order = submitCheckoutOrder({
        customerName: nameOnCard || 'Private Client',
        customerEmail: customerEmail || 'client@studio.com',
        paymentMethod: paymentMethod === 'credit' ? 'Credit Card' : 'PayPal',
        cardLast4: cardNumber.slice(-4)
      });
      setIsProcessing(false);
      setCompletedOrder(order);
    }, 1000);
  };

  return (
    <div className="w-full bg-white text-neutral-900 min-h-[calc(100vh-60px)] pb-24">
      {/* Top Left Navigation */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-5">
        <button
          type="button"
          onClick={navigateToStore}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-black transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-8 sm:mb-12">
          Shopping Cart.
        </h1>

        {cart.length === 0 && !completedOrder ? (
          <div className="py-16 text-center max-w-md mx-auto">
            <ShoppingBag className="w-12 h-12 stroke-[1.2] mx-auto text-neutral-300 mb-4" />
            <h2 className="text-lg font-medium text-neutral-800 uppercase tracking-wider mb-2">Your Bag is Empty</h2>
            <p className="text-xs text-neutral-400 font-light mb-6">Explore the studio collection to add bespoke rugs to your cart.</p>
            <button
              type="button"
              onClick={navigateToStore}
              className="px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium bg-black text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Explore Catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Cart Table (approx 65% width) */}
            <div className="lg:col-span-7 xl:col-span-8">
              {/* Table Column Headers */}
              <div className="grid grid-cols-12 pb-3 border-b border-neutral-200 text-[11px] uppercase tracking-[0.16em] text-neutral-400 font-medium">
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
                    <div key={`${item.productId}-${item.sizeId}-${item.colorName}-${idx}`} className="py-5 grid grid-cols-12 items-center gap-2">
                      {/* Product Thumbnail & Title */}
                      <div className="col-span-5 sm:col-span-5 flex items-center gap-3 sm:gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-neutral-100 overflow-hidden flex items-center justify-center shrink-0 p-1.5">
                          <img
                            src={product.cardImage}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 pr-1">
                          <div className="text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                            {product.name}
                          </div>
                          <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                            {item.colorName}
                          </div>
                        </div>
                      </div>

                      {/* Size Selector Dropdown */}
                      <div className="col-span-3 sm:col-span-3 flex justify-center sm:justify-start">
                        <div className="relative inline-block">
                          <select
                            value={item.sizeId}
                            onChange={(e) => updateCartItemSize(idx, e.target.value)}
                            className="appearance-none bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-[11px] text-neutral-800 rounded-lg pl-2.5 pr-6 py-1.5 font-medium cursor-pointer focus:outline-none"
                          >
                            {product.sizes.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="col-span-2 sm:col-span-2 flex items-center justify-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(idx, -1)}
                          className="w-6 h-6 rounded-md hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-black cursor-pointer transition-colors"
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
                          className="w-6 h-6 rounded-md hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-black cursor-pointer transition-colors"
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

              {/* Subtotal & Summary Details below table */}
              <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col items-end space-y-2 text-xs">
                <div className="flex justify-between w-48 text-neutral-500">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium text-neutral-900">{formatPrice(cartSubtotalUSD)}</span>
                </div>
                <div className="flex justify-between w-48 text-neutral-500">
                  <span>Shipping:</span>
                  <span className="font-mono font-medium text-emerald-600 uppercase tracking-wider text-[11px]">Free</span>
                </div>
                <div className="flex justify-between w-48 text-neutral-900 pt-2 border-t border-neutral-100 text-sm font-bold">
                  <span>Total:</span>
                  <span className="font-mono">{formatPrice(cartSubtotalUSD)}</span>
                </div>
              </div>

              {/* Bottom Left Back Button */}
              <div className="mt-8">
                <button
                  type="button"
                  onClick={navigateToStore}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-black transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Continue Shopping</span>
                </button>
              </div>
            </div>

            {/* Right Column: Payment Info. card (approx 35% width, strictly styled per reference) */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-[#f8f8f9] rounded-2xl p-6 sm:p-8 border border-neutral-100">
                <h2 className="text-lg font-bold text-neutral-900 mb-6">
                  Payment Info.
                </h2>

                <form onSubmit={handleCheckout} className="space-y-5">
                  {/* Payment Method Selector */}
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium block mb-2.5">
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
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium block mb-1.5">
                      Name On Card:
                    </label>
                    <input
                      type="text"
                      required
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors"
                      placeholder="e.g. John Carter"
                    />
                  </div>

                  {/* Card Number */}
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium block mb-1.5">
                      Card Number:
                    </label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors"
                      placeholder="•••• •••• •••• 2153"
                    />
                  </div>

                  {/* Expiration Date & CVV */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium block mb-1.5">
                        Expiration Date:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <select
                            value={expMonth}
                            onChange={(e) => setExpMonth(e.target.value)}
                            className="w-full appearance-none bg-white border border-neutral-200 rounded-xl px-2.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 cursor-pointer"
                          >
                            {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <div className="relative">
                          <select
                            value={expYear}
                            onChange={(e) => setExpYear(e.target.value)}
                            className="w-full appearance-none bg-white border border-neutral-200 rounded-xl px-2.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 cursor-pointer"
                          >
                            {['2026', '2027', '2028', '2029', '2030'].map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium block mb-1.5">
                        CVV:
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors"
                        placeholder="156"
                      />
                    </div>
                  </div>

                  {/* Primary Blue / Luxury Checkout CTA */}
                  <div className="pt-2">
                    <button
                      id="checkout-submit-btn"
                      type="submit"
                      disabled={isProcessing || cart.length === 0}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#2f54eb] hover:bg-[#2040c5] text-white font-medium text-xs uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {isProcessing ? 'Authorizing...' : 'Check Out'}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-mono mb-1">
                Order Confirmed
              </div>
              <h2 className="text-2xl font-serif font-normal uppercase tracking-wider text-neutral-900 mb-2">
                Thank You, {completedOrder.customerName}
              </h2>
              <p className="text-xs text-neutral-500 font-light mb-6">
                Your bespoke studio acquisition has been registered under invoice <span className="font-mono font-semibold text-neutral-800">{completedOrder.id}</span>.
              </p>

              <div className="bg-neutral-50 rounded-xl p-4 text-left text-xs mb-6 space-y-2 border border-neutral-100">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Charged:</span>
                  <span className="font-mono font-semibold text-neutral-900">{formatPrice(completedOrder.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Order Reference:</span>
                  <span className="font-mono text-neutral-800">{completedOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Estimated Dispatch:</span>
                  <span className="text-neutral-800">3–5 business days</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCompletedOrder(null);
                  navigateToStore();
                }}
                className="w-full py-3 px-6 rounded-full bg-black text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Return to Collection
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
