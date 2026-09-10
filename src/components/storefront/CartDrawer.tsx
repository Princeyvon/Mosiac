import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cartOpen,
    setCartOpen,
    cart,
    products,
    updateCartQuantity,
    removeFromCart,
    cartSubtotalUSD,
    formatPrice,
    setActiveModal,
    navigateToPDP
  } = useStore();

  if (!cartOpen) return null;

  const handleCheckout = () => {
    setCartOpen(false);
    setActiveModal('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={() => setCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between text-black animate-in slide-in-from-right duration-200">
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="text-[12px] uppercase tracking-[0.2em] font-medium">Cart</span>
            <span className="text-[11px] text-neutral-400 font-mono">
              ({cart.reduce((acc, i) => acc + i.quantity, 0)})
            </span>
          </div>
          <button
            id="close-cart-btn"
            type="button"
            onClick={() => setCartOpen(false)}
            className="p-1 text-neutral-400 hover:text-black transition-colors focus:outline-none"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 text-neutral-400">
              <ShoppingBag className="w-10 h-10 stroke-[1.2] mb-3 text-neutral-300" />
              <p className="text-[12px] uppercase tracking-widest text-neutral-600 mb-1">Your cart is empty</p>
              <p className="text-[11px] text-neutral-400 max-w-[200px]">
                Explore our catalogue of handcrafted studio pieces.
              </p>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="mt-6 text-[10px] uppercase tracking-[0.2em] font-medium px-5 py-2.5 bg-black text-white hover:bg-neutral-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item, index) => {
              const product = products.find(p => p.id === item.productId);
              if (!product) return null;
              const size = product.sizes.find(s => s.id === item.sizeId) || product.sizes[0];
              const itemUnitPrice = size ? size.price : product.fromPrice;

              return (
                <div key={`${item.productId}-${item.sizeId}-${item.colorName}-${index}`} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <div
                    onClick={() => {
                      navigateToPDP(product.slug);
                      setCartOpen(false);
                    }}
                    className="w-20 h-20 bg-neutral-100 shrink-0 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={product.cardImage}
                      alt={product.name}
                      className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigateToPDP(product.slug);
                            setCartOpen(false);
                          }}
                          className="text-left text-[11px] uppercase tracking-wider font-medium text-black hover:opacity-70 transition-opacity line-clamp-1"
                        >
                          {product.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(index)}
                          className="text-neutral-400 hover:text-black transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[10px] text-neutral-500 mt-1 flex items-center gap-2">
                        <span>{size ? size.label : ''}</span>
                        <span>·</span>
                        <span>{item.colorName}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-3">
                      {/* Quantity adjuster */}
                      <div className="flex items-center border border-neutral-200">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(index, -1)}
                          className="px-2 py-1 text-neutral-500 hover:text-black transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="px-2 text-[10px] font-mono">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(index, 1)}
                          className="px-2 py-1 text-neutral-500 hover:text-black transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-[12px] font-mono tracking-tight text-right">
                        {formatPrice(itemUnitPrice * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer footer */}
        {cart.length > 0 && (
          <div className="border-t border-neutral-100 p-6 bg-white space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] uppercase tracking-widest text-neutral-500">Subtotal</span>
                <span className="text-[14px] font-mono tracking-tight font-medium">
                  {formatPrice(cartSubtotalUSD)}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">
                Shipping and local taxes calculated at checkout.
              </p>
            </div>

            <button
              id="cart-checkout-btn"
              type="button"
              onClick={handleCheckout}
              className="w-full bg-black text-white hover:bg-neutral-800 transition-colors py-3.5 px-4 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] font-medium"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
