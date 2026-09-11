import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Currency, Order, AuditLog } from '../types';
import { INITIAL_PRODUCTS, CURRENCIES } from '../data/initialProducts';

interface StoreContextType {
  // Products (Live vs Staged)
  products: Product[];
  stagedProducts: Product[];
  hasUnpublishedChanges: boolean;
  publishStagedChanges: () => void;
  toggleProductStatus: (id: string, field: 'visible' | 'soldOut' | 'featured' | 'newArrival' | 'starred') => void;
  saveProductDraft: (product: Product) => void;
  deleteProduct: (id: string) => void;
  createNewProduct: () => string; // returns new product id

  // Routing / View state
  currentView: 'store' | 'pdp' | 'variants' | 'cart' | 'policies' | 'dash';
  currentProductSlug: string | null;
  selectedColorVariant: string | null;
  setSelectedColorVariant: (color: string | null) => void;
  gridDensity: 'dense' | 'normal';
  toggleGridDensity: () => void;
  navigateToStore: () => void;
  navigateToPDP: (slug: string, colorVariant?: string) => void;
  navigateToVariants: (slug: string) => void;
  navigateToCart: () => void;
  navigateToPolicies: () => void;
  navigateToDash: (tab?: string) => void;
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;
  editingProductId: string | null;
  setEditingProductId: (id: string | null) => void;

  // Currency
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (usdAmount: number) => string;

  // Cart
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (productId: string, sizeId: string, colorName: string, quantity?: number) => void;
  updateCartQuantity: (index: number, delta: number) => void;
  updateCartItemSize: (index: number, newSizeId: string) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  submitCheckoutOrder: (details: { customerName: string; customerEmail: string; paymentMethod: string; cardLast4?: string }) => Order;
  cartCount: number;
  cartSubtotalUSD: number;

  // Admin Auth
  isAdminAuth: boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;

  // Cookie banner
  cookieConsent: 'accepted' | 'rejected' | null;
  setCookieConsent: (consent: 'accepted' | 'rejected') => void;

  // Global Modals
  activeModal: 'contact' | 'policies' | 'journal' | 'faq' | 'checkout' | null;
  setActiveModal: (modal: 'contact' | 'policies' | 'journal' | 'faq' | 'checkout' | null) => void;

  // Admin notifications & audit history
  notifications: string[];
  orders: Order[];
  auditLogs: AuditLog[];
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LIVE_PRODUCTS: 'forma_live_products_v2',
  STAGED_PRODUCTS: 'forma_staged_products_v2',
  CART: 'forma_cart_v2',
  CURRENCY: 'forma_currency_v2',
  COOKIES: 'forma_cookie_consent_v1',
  ADMIN_AUTH: 'forma_admin_auth_v1',
};

const INITIAL_ORDERS: Order[] = [
  { id: 'ORD-9021', customerName: 'Camille Moreau', customerEmail: 'camille@atelier-arch.fr', total: 5400, currency: 'USD', status: 'Processing', date: '2026-09-09', itemsCount: 1 },
  { id: 'ORD-9020', customerName: 'Henrik Lindqvist', customerEmail: 'henrik@nordicform.se', total: 4270, currency: 'USD', status: 'Fulfilled', date: '2026-09-07', itemsCount: 2 },
  { id: 'ORD-9019', customerName: 'Sora Takahashi', customerEmail: 'sora@tokyo-space.jp', total: 950, currency: 'USD', status: 'Fulfilled', date: '2026-09-05', itemsCount: 1 },
  { id: 'ORD-9018', customerName: 'Elena Rostova', customerEmail: 'elena@rostova.com', total: 3800, currency: 'USD', status: 'Pending', date: '2026-09-04', itemsCount: 1 }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', action: 'Published live changes', target: 'Catalogue', user: 'Admin (Studio)', timestamp: 'Today at 10:14 AM' },
  { id: 'log-2', action: 'Marked as Sold Out', target: 'Obelisk Terracotta Urn', user: 'Admin (Studio)', timestamp: 'Yesterday at 4:30 PM' },
  { id: 'log-3', action: 'Created new product', target: 'Vertex Textured Wool Rug', user: 'Admin (Studio)', timestamp: '3 days ago' },
  { id: 'log-4', action: 'Updated pricing table', target: 'Monolith Travertine Console', user: 'Admin (Studio)', timestamp: '4 days ago' }
];

const sanitizeProduct = (p: any): Product => {
  return {
    ...p,
    id: p.id || 'prod-' + Math.random().toString(36).substring(2, 9),
    name: p.name || 'Untitled Work',
    slug: p.slug || 'untitled-work',
    collection: p.collection || 'Studio Works',
    shape: p.shape || 'Rectangular',
    availability: p.availability || 'In stock',
    leadTime: p.leadTime || 'Ships within 3 to 5 business days',
    material: p.material || 'Studio Material Blend',
    cardSummary: p.cardSummary || '',
    fullDescription: p.fullDescription || '',
    careInstructions: p.careInstructions || '',
    tags: Array.isArray(p.tags) ? p.tags : [],
    colours: Array.isArray(p.colours) ? p.colours : [{ id: 'c-default', name: 'Studio Finish', hex: '#222222' }],
    cardImage: p.cardImage || '/images/uzu-slate-bronze.jpg',
    hoverImage: p.hoverImage || undefined,
    galleryImages: Array.isArray(p.galleryImages) && p.galleryImages.length > 0 ? p.galleryImages : [p.cardImage || '/images/uzu-slate-bronze.jpg'],
    sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : [{ id: 's1', label: 'Standard', width: 200, depth: 150, price: p.fromPrice || 1200, weight: 15 }],
    fromPrice: typeof p.fromPrice === 'number' ? p.fromPrice : 1200,
    sku: p.sku || 'FORMA-001',
    stockOnHand: typeof p.stockOnHand === 'number' ? p.stockOnHand : 4,
    lowStockAlertAt: typeof p.lowStockAlertAt === 'number' ? p.lowStockAlertAt : 2,
    visible: p.visible !== false,
  };
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Live products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LIVE_PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeProduct);
        }
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Staged products (for the admin dashboard draft mode)
  const [stagedProducts, setStagedProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAGED_PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeProduct);
        }
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Navigation / views
  const [currentView, setCurrentView] = useState<'store' | 'pdp' | 'variants' | 'cart' | 'policies' | 'dash'>('store');
  const [currentProductSlug, setCurrentProductSlug] = useState<string | null>(null);
  const [selectedColorVariant, setSelectedColorVariant] = useState<string | null>(null);
  const [gridDensity, setGridDensity] = useState<'dense' | 'normal'>('dense');
  const [activeAdminTab, setActiveAdminTab] = useState<string>('catalogue');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const toggleGridDensity = () => {
    setGridDensity(prev => (prev === 'dense' ? 'normal' : 'dense'));
  };

  // Currency
  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (saved) {
        const found = CURRENCIES.find(c => c.code === saved);
        if (found) return found;
      }
    } catch {}
    return CURRENCIES[0];
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, c.code);
    } catch {}
  };

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);

  // Admin auth
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  // Cookie consent
  const [cookieConsent, setCookieConsentState] = useState<'accepted' | 'rejected' | null>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEYS.COOKIES) as 'accepted' | 'rejected' | null) || null;
    } catch {
      return null;
    }
  });

  const setCookieConsent = (val: 'accepted' | 'rejected') => {
    setCookieConsentState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.COOKIES, val);
    } catch {}
  };

  // Modals & Toast
  const [activeModal, setActiveModal] = useState<'contact' | 'policies' | 'journal' | 'faq' | 'checkout' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Staged vs Live difference detection
  const hasUnpublishedChanges = JSON.stringify(products) !== JSON.stringify(stagedProducts);

  // Orders and Audit Logs
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications] = useState<string[]>([
    'High traffic alert: PDP views up 42% on Monolith Console',
    'Inventory reminder: Strata Bronze Chair has 2 units remaining',
    'New trade inquiry received from Architectural Digest Studio'
  ]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LIVE_PRODUCTS, JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STAGED_PRODUCTS, JSON.stringify(stagedProducts));
    } catch {}
  }, [stagedProducts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Price formatter
  const formatPrice = (usdAmount: number): string => {
    const converted = usdAmount * currency.rate;
    if (currency.code === 'JPY' || currency.code === 'RWF') {
      return `${currency.symbol} ${Math.round(converted).toLocaleString()}`;
    }
    return `${currency.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  // Navigation helpers
  const navigateToStore = () => {
    setCurrentView('store');
    setCurrentProductSlug(null);
    setEditingProductId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPDP = (slug: string, colorVariant?: string) => {
    setCurrentProductSlug(slug);
    if (colorVariant) {
      setSelectedColorVariant(colorVariant);
    }
    setCurrentView('pdp');
    setEditingProductId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToVariants = (slug: string) => {
    setCurrentProductSlug(slug);
    setCurrentView('variants');
    setEditingProductId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCart = () => {
    setCurrentView('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPolicies = () => {
    setCurrentView('policies');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDash = (tab?: string) => {
    setCurrentView('dash');
    if (tab) setActiveAdminTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart operations
  const addToCart = (productId: string, sizeId: string, colorName: string, quantity: number = 1) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(
        item => item.productId === productId && item.sizeId === sizeId && item.colorName === colorName
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      }
      return [...prev, { productId, sizeId, colorName, quantity }];
    });
    showToast('Added to bag');
  };

  const updateCartQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const next = [...prev];
      if (!next[index]) return prev;
      const newQty = next[index].quantity + delta;
      if (newQty <= 0) {
        next.splice(index, 1);
      } else {
        next[index].quantity = newQty;
      }
      return next;
    });
  };

  const updateCartItemSize = (index: number, newSizeId: string) => {
    setCart(prev => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = { ...next[index], sizeId: newSizeId };
      return next;
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  const submitCheckoutOrder = (details: {
    customerName: string;
    customerEmail: string;
    paymentMethod: string;
    cardLast4?: string;
  }): Order => {
    const newOrderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: newOrderId,
      customerName: details.customerName || 'Studio Client',
      customerEmail: details.customerEmail || 'client@studio.com',
      total: cartSubtotalUSD,
      currency: currency.code,
      status: 'Processing',
      date: new Date().toISOString().split('T')[0],
      itemsCount: cartCount
    };

    setOrders(prev => [newOrder, ...prev]);
    setAuditLogs(prev => [
      {
        id: 'log-' + Date.now(),
        action: `Order placed (${newOrderId})`,
        target: `${details.paymentMethod} · ${currency.symbol}${cartSubtotalUSD.toLocaleString()}`,
        user: details.customerName || 'Customer',
        timestamp: 'Just now'
      },
      ...prev
    ]);
    clearCart();
    return newOrder;
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const cartSubtotalUSD = cart.reduce((total, item) => {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) return total;
    const size = prod.sizes.find(s => s.id === item.sizeId);
    const price = size ? size.price : prod.fromPrice;
    return total + price * item.quantity;
  }, 0);

  // Admin Actions
  const loginAdmin = () => {
    setIsAdminAuth(true);
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
    } catch {}
    showToast('Logged in to Studio Dashboard');
  };

  const logoutAdmin = () => {
    setIsAdminAuth(false);
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'false');
    } catch {}
    showToast('Logged out');
  };

  // Quick toggle status in the Catalogue Table
  const toggleProductStatus = (
    id: string,
    field: 'visible' | 'soldOut' | 'featured' | 'newArrival' | 'starred'
  ) => {
    setStagedProducts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        if (field === 'visible') {
          return { ...p, visible: !p.visible };
        }
        if (field === 'soldOut') {
          const isSoldOut = p.availability === 'Sold out';
          const nextAvail = isSoldOut ? 'In stock' : 'Sold out';
          return { ...p, availability: nextAvail, fulfilment: nextAvail };
        }
        if (field === 'featured') {
          return { ...p, featured: !p.featured };
        }
        if (field === 'newArrival') {
          return { ...p, newArrival: !p.newArrival };
        }
        if (field === 'starred') {
          return { ...p, starred: !p.starred };
        }
        return p;
      })
    );

    // Also record an audit log
    const targetProd = stagedProducts.find(p => p.id === id);
    if (targetProd) {
      setAuditLogs(prev => [
        {
          id: 'log-' + Date.now(),
          action: `Toggled ${field}`,
          target: targetProd.name,
          user: 'Admin (Studio)',
          timestamp: 'Just now'
        },
        ...prev
      ]);
    }
  };

  // Save product draft from the edit view
  const saveProductDraft = (updatedProduct: Product) => {
    setStagedProducts(prev => {
      const exists = prev.some(p => p.id === updatedProduct.id);
      if (exists) {
        return prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p));
      }
      return [updatedProduct, ...prev];
    });

    setAuditLogs(prev => [
      {
        id: 'log-' + Date.now(),
        action: 'Updated product specifications',
        target: updatedProduct.name,
        user: 'Admin (Studio)',
        timestamp: 'Just now'
      },
      ...prev
    ]);

    setEditingProductId(null);
    showToast(`Saved changes for ${updatedProduct.name}`);
  };

  // Delete product
  const deleteProduct = (id: string) => {
    const prod = stagedProducts.find(p => p.id === id);
    setStagedProducts(prev => prev.filter(p => p.id !== id));
    if (prod) {
      setAuditLogs(prev => [
        {
          id: 'log-' + Date.now(),
          action: 'Deleted product',
          target: prod.name,
          user: 'Admin (Studio)',
          timestamp: 'Just now'
        },
        ...prev
      ]);
      showToast(`Deleted ${prod.name}`);
    }
  };

  // Create new product
  const createNewProduct = (): string => {
    const newId = 'prod-' + Date.now().toString().slice(-4);
    const newProduct: Product = {
      id: newId,
      name: 'UNTITLED SCULPTURE',
      slug: 'untitled-sculpture-' + newId,
      collection: 'Sculptural Objects',
      shape: 'Geometric',
      availability: 'Made to order',
      leadTime: 'Ready in 3 to 4 weeks',
      material: 'Raw Chamotte, Solid Bronze',
      cardSummary: 'New studio creation currently under final curation.',
      fullDescription: 'Sculptural studio piece exploring volumetric tension and planar balance.',
      careInstructions: 'Dust with soft dry cloth.',
      tags: ['Handcrafted', 'New Drop'],
      colours: [{ id: 'c1', name: 'Raw Limestone', hex: '#EAE6DF' }],
      cardImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85',
      hoverImage: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=85',
      galleryImages: [
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=1200&q=85',
      ],
      sizes: [{ id: 's1', label: 'Standard', width: 40, depth: 40, price: 1200, weight: 14 }],
      fromPrice: 1200,
      costPrice: 400,
      featuredOrder: stagedProducts.length + 1,
      sku: `FRM-NEW-${newId}`,
      stockOnHand: 5,
      lowStockAlertAt: 2,
      fulfilment: 'Made to order',
      featured: false,
      newArrival: true,
      visible: true,
      starred: false,
      seoTitle: 'Untitled Sculpture — FORMA Studio',
      seoDescription: 'Handcrafted architectural sculpture from FORMA Studio.'
    };

    setStagedProducts(prev => [newProduct, ...prev]);
    setEditingProductId(newId);
    showToast('New draft product created');
    return newId;
  };

  // Publish staged changes live to the storefront
  const publishStagedChanges = () => {
    setProducts([...stagedProducts]);
    setAuditLogs(prev => [
      {
        id: 'log-' + Date.now(),
        action: 'Published catalogue live to storefront',
        target: `Published ${stagedProducts.length} items`,
        user: 'Admin (Studio)',
        timestamp: 'Just now'
      },
      ...prev
    ]);
    showToast('All staged catalogue changes published live!');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        stagedProducts,
        hasUnpublishedChanges,
        publishStagedChanges,
        toggleProductStatus,
        saveProductDraft,
        deleteProduct,
        createNewProduct,

        currentView,
        currentProductSlug,
        selectedColorVariant,
        setSelectedColorVariant,
        gridDensity,
        toggleGridDensity,
        navigateToStore,
        navigateToPDP,
        navigateToVariants,
        navigateToCart,
        navigateToPolicies,
        navigateToDash,
        activeAdminTab,
        setActiveAdminTab,
        editingProductId,
        setEditingProductId,

        currency,
        setCurrency,
        formatPrice,

        cart,
        cartOpen,
        setCartOpen,
        addToCart,
        updateCartQuantity,
        updateCartItemSize,
        removeFromCart,
        clearCart,
        submitCheckoutOrder,
        cartCount,
        cartSubtotalUSD,

        isAdminAuth,
        loginAdmin,
        logoutAdmin,

        cookieConsent,
        setCookieConsent,

        activeModal,
        setActiveModal,

        notifications,
        orders,
        auditLogs,
        toastMessage,
        showToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
