import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Currency,
  Order,
  AuditLog,
  StorefrontFilter,
  PromoPopupConfig,
  PolicySection,
  TeamMember,
  UserProfile
} from '../types';
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

  // Storefront Filters
  storefrontFilters: StorefrontFilter[];
  showStorefrontFilters: boolean;
  setShowStorefrontFilters: (show: boolean) => void;
  toggleStorefrontFilters: () => void;
  activeFilter: string;
  setActiveFilter: (slug: string) => void;
  addStorefrontFilter: (label: string, slug?: string) => void;
  deleteStorefrontFilter: (id: string) => void;

  // Custom Rug Pop-up (Instagram DM)
  showCustomRugPopup: boolean;
  setShowCustomRugPopup: (show: boolean) => void;

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
  appliedPromo: { code: string; discountPercent: number; description: string } | null;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  cartPromoDiscountUSD: number;
  cartFinalTotalUSD: number;

  // Promo Popup
  promoPopupConfig: PromoPopupConfig;
  updatePromoPopupConfig: (config: Partial<PromoPopupConfig>) => void;
  showPromoPopup: boolean;
  setShowPromoPopup: (show: boolean) => void;
  triggerPromoPreview: () => void;

  // Policies
  policies: PolicySection[];
  updatePolicySection: (id: string, newTitle: string, newContent: string) => void;

  // Team
  teamMembers: TeamMember[];
  toggleTeamMemberActive: (id: string) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  addTeamMember: (member: Omit<TeamMember, 'id' | 'lastActive'>) => void;

  // Profile
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

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

export const getOneWordName = (name: string): string => {
  if (!name) return 'PRODUCT';
  const firstPart = name.split('—')[0].split('-')[0].trim();
  const word = firstPart.split(/\s+/)[0].trim().toUpperCase();
  return word || 'PRODUCT';
};

const STORAGE_KEYS = {
  LIVE_PRODUCTS: 'mosiac_live_products_v4',
  STAGED_PRODUCTS: 'mosiac_staged_products_v4',
  CART: 'forma_cart_v2',
  CURRENCY: 'forma_currency_v2',
  COOKIES: 'forma_cookie_consent_v1',
  ADMIN_AUTH: 'forma_admin_auth_v1',
  FILTERS: 'mosiac_filters_v2',
  SHOW_FILTERS: 'mosiac_show_filters_v1',
  PROMO_CONFIG: 'mosiac_promo_config_v1',
  POLICIES: 'mosiac_policies_v1',
  TEAM: 'mosiac_team_v1',
  PROFILE: 'mosiac_profile_v1',
};

const INITIAL_FILTERS: StorefrontFilter[] = [
  { id: 'f-all', label: 'All', slug: 'all' },
  { id: 'f-sale', label: 'On Sale', slug: 'on-sale' },
  { id: 'f-feat', label: 'Featured', slug: 'featured' },
  { id: 'f-new', label: 'New', slug: 'new' },
];

const INITIAL_POLICIES: PolicySection[] = [
  {
    id: 'legal',
    title: 'Terms & Conditions of Sale',
    content: 'Welcome to Mosiac. By accessing our platform, viewing our catalogue, or acquiring works from our atelier, you agree to comply with and be bound by studio terms and conditions. Every textile presented by Mosiac is individually crafted by master artisans using organic New Zealand virgin wool, botanical luster fibers, and museum-grade dyes. Slight organic variations in pile height, contour beveling, and subtle tone gradients are intrinsic hallmarks of authentic artisanal creation.',
    lastUpdated: 'September 2026'
  },
  {
    id: 'orders',
    title: 'Order Status & Live Tracking',
    content: 'Track the fabrication, finishing, and white-glove logistics of your studio acquisition in real-time. Each commissioned piece is registered under a permanent studio invoice reference. Live transit alerts and temperature-controlled freight manifests are dispatched to the client email on file upon atelier inspection completion.',
    lastUpdated: 'September 2026'
  },
  {
    id: 'shipping',
    title: 'Shipping & White-Glove Delivery',
    content: 'Mosiac partners exclusively with premier international art-handling logistics carriers. Every rug is rolled on high-rigidity structural tubes and encased in sealed archival moisture-barrier timber crates. Complimentary white-glove uncrating and placement is provided for all salon and grand dimension commissions.',
    lastUpdated: 'September 2026'
  },
  {
    id: 'returns',
    title: 'Returns & 30-Day Studio Guarantee',
    content: 'We want you to experience our textiles under your natural interior light. We offer a 30-day inspection window from the date of physical delivery for standard catalogue editions. The textile must remain in original pristine condition, unwashed, with all studio labels intact.',
    lastUpdated: 'September 2026'
  },
  {
    id: 'privacy',
    title: 'Privacy & Data Governance',
    content: 'Mosiac maintains strict confidentiality regarding our clients, collectors, and architectural partners. We comply with GDPR, CCPA, and global privacy standards. We collect only information essential to servicing your order and never sell or monetize client data.',
    lastUpdated: 'September 2026'
  },
  {
    id: 'cookies',
    title: 'Cookie Policy & Preferences',
    content: 'Mosiac uses strictly necessary local storage cookies to retain your shopping bag contents, selected studio currency, and catalogue grid density preferences across sessions without third-party surveillance tracking.',
    lastUpdated: 'September 2026'
  },
  {
    id: 'about',
    title: 'About Mosiac Studio',
    content: 'Founded at the intersection of sculptural minimalism and architectural fiber art, Mosiac crafts textiles that ground contemporary living spaces with intentional tactile presence. Our master weavers hand-tuft and hand-carve each rug using 100% un-dyed New Zealand virgin highland wool, paired with botanically luster-treated silk inlays.',
    lastUpdated: 'September 2026'
  },
  {
    id: 'contact',
    title: 'Contact & Atelier Concierge',
    content: 'Reach our design concierge for bespoke scale inquiries, private architectural trade pricing, or showroom viewings in Paris and New York. Concierge: concierge@rugmosiac.com · +33 1 42 68 00 90',
    lastUpdated: 'September 2026'
  }
];

const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Laurent Moreau',
    username: 'l.moreau',
    email: 'laurent@rugmosiac.com',
    role: 'Studio Director',
    active: true,
    pin: '4821',
    password: '••••••••',
    lastActive: 'Just now'
  },
  {
    id: 'tm-2',
    name: 'Elena Rostova',
    username: 'e.rostova',
    email: 'elena@rugmosiac.com',
    role: 'Senior Curator',
    active: true,
    pin: '9012',
    password: '••••••••',
    lastActive: '2 hours ago'
  },
  {
    id: 'tm-3',
    name: 'Sora Takahashi',
    username: 's.takahashi',
    email: 'sora@rugmosiac.com',
    role: 'Atelier Manager',
    active: true,
    pin: '3341',
    password: '••••••••',
    lastActive: 'Yesterday'
  },
  {
    id: 'tm-4',
    name: 'Mathieu Blanc',
    username: 'm.blanc',
    email: 'mathieu@rugmosiac.com',
    role: 'Logistics Lead',
    active: false,
    pin: '7729',
    password: '••••••••',
    lastActive: '5 days ago'
  }
];

const INITIAL_PROFILE: UserProfile = {
  name: 'Studio Director',
  username: 'director.mosiac',
  email: 'ddteam@rugmosiac.com',
  role: 'Master Administrator',
  pin: '1234',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  bio: 'Overseeing global textile commissions, custom loom weaving, and architectural client relations for Mosiac Atelier.',
  notificationsEnabled: true
};

const INITIAL_PROMO_CONFIG: PromoPopupConfig = {
  enabled: true,
  delaySeconds: 30,
  badgeText: 'sample sale',
  eyebrow: 'ONLINE SAMPLE SALE NOW LIVE!',
  headline: 'Shop up to 70% off select sample sale items!',
  subtext: 'Ends September 7th.',
  buttonText: 'SHOP NOW!',
  discountCode: 'SAMPLE70',
  imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
  filterTag: 'on-sale'
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

  // Storefront Filters (managed in Studio Dash)
  const [showStorefrontFilters, setShowStorefrontFiltersState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHOW_FILTERS);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const setShowStorefrontFilters = (val: boolean) => {
    setShowStorefrontFiltersState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.SHOW_FILTERS, JSON.stringify(val));
    } catch {}
    showToast(val ? 'Storefront filters are now visible' : 'Storefront filters are now hidden');
  };

  const toggleStorefrontFilters = () => {
    setShowStorefrontFilters(!showStorefrontFilters);
  };

  const [storefrontFilters, setStorefrontFilters] = useState<StorefrontFilter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FILTERS);
      return saved ? JSON.parse(saved) : INITIAL_FILTERS;
    } catch {
      return INITIAL_FILTERS;
    }
  });
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const addStorefrontFilter = (label: string, slug?: string) => {
    const newSlug = slug || label.toLowerCase().replace(/\s+/g, '-');
    const newFilter: StorefrontFilter = {
      id: 'filter-' + Date.now().toString().slice(-4),
      label,
      slug: newSlug,
    };
    const updated = [...storefrontFilters, newFilter];
    setStorefrontFilters(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(updated));
    } catch {}
    showToast(`Filter "${label}" created`);
  };

  const deleteStorefrontFilter = (id: string) => {
    if (id === 'f-all') return; // Cannot delete All
    const updated = storefrontFilters.filter(f => f.id !== id);
    setStorefrontFilters(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(updated));
    } catch {}
    if (activeFilter !== 'all') setActiveFilter('all');
    showToast('Filter removed');
  };

  // Custom Rug Pop-up state (45-sec trigger to Instagram DM)
  const [showCustomRugPopup, setShowCustomRugPopup] = useState(false);

  // Promo Pop-up Configuration
  const [promoPopupConfig, setPromoPopupConfig] = useState<PromoPopupConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROMO_CONFIG);
      return saved ? JSON.parse(saved) : INITIAL_PROMO_CONFIG;
    } catch {
      return INITIAL_PROMO_CONFIG;
    }
  });
  const [showPromoPopup, setShowPromoPopup] = useState(false);

  const updatePromoPopupConfig = (updates: Partial<PromoPopupConfig>) => {
    setPromoPopupConfig(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEYS.PROMO_CONFIG, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Promo popup settings updated');
  };

  const triggerPromoPreview = () => {
    setShowPromoPopup(true);
  };

  // Auto-trigger promo pop-up after 30 seconds (or delaySeconds)
  useEffect(() => {
    if (!promoPopupConfig.enabled) return;
    const timer = setTimeout(() => {
      setShowPromoPopup(true);
    }, (promoPopupConfig.delaySeconds || 30) * 1000);
    return () => clearTimeout(timer);
  }, [promoPopupConfig.enabled, promoPopupConfig.delaySeconds]);

  // Studio Policies (editable in Studio Dash)
  const [policies, setPolicies] = useState<PolicySection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POLICIES);
      return saved ? JSON.parse(saved) : INITIAL_POLICIES;
    } catch {
      return INITIAL_POLICIES;
    }
  });

  const updatePolicySection = (id: string, newTitle: string, newContent: string) => {
    setPolicies(prev => {
      const next = prev.map(p =>
        p.id === id ? { ...p, title: newTitle, content: newContent, lastUpdated: 'Updated just now' } : p
      );
      try {
        localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Studio policy updated');
  };

  // Studio Team Members (with accordion credentials in Dash)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAM);
      return saved ? JSON.parse(saved) : INITIAL_TEAM;
    } catch {
      return INITIAL_TEAM;
    }
  });

  const toggleTeamMemberActive = (id: string) => {
    setTeamMembers(prev => {
      const next = prev.map(m => (m.id === id ? { ...m, active: !m.active } : m));
      try {
        localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Team member status updated');
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    setTeamMembers(prev => {
      const next = prev.map(m => (m.id === id ? { ...m, ...updates } : m));
      try {
        localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Team member credentials updated');
  };

  const addTeamMember = (member: Omit<TeamMember, 'id' | 'lastActive'>) => {
    const newMember: TeamMember = {
      ...member,
      id: 'tm-' + Date.now().toString().slice(-4),
      lastActive: 'Never'
    };
    const next = [...teamMembers, newMember];
    setTeamMembers(next);
    try {
      localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(next));
    } catch {}
    showToast(`Added ${member.name} to team`);
  };

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Profile updated');
  };

  // Promo Code in Cart Checkout
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number; description: string } | null>(null);

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'SAMPLE70' || clean === 'MOSIAC70') {
      setAppliedPromo({ code: clean, discountPercent: 70, description: 'Sample Sale (70% Off)' });
      showToast('Promo code applied: 70% Off!');
      return { success: true, message: '70% discount applied!' };
    } else if (clean === 'MOSIAC10' || clean === 'WELCOME10') {
      setAppliedPromo({ code: clean, discountPercent: 10, description: 'Collector Welcome (10% Off)' });
      showToast('Promo code applied: 10% Off!');
      return { success: true, message: '10% discount applied!' };
    } else if (clean === promoPopupConfig.discountCode.toUpperCase()) {
      setAppliedPromo({ code: clean, discountPercent: 30, description: 'Promotional Offer (30% Off)' });
      showToast('Promo code applied: 30% Off!');
      return { success: true, message: 'Promotional discount applied!' };
    }
    return { success: false, message: 'Invalid or expired promotional code' };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    showToast('Promo code removed');
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
    const promoDiscountUSD = appliedPromo ? (cartSubtotalUSD * appliedPromo.discountPercent) / 100 : 0;
    const finalTotal = Math.max(0, cartSubtotalUSD - promoDiscountUSD);

    const newOrder: Order = {
      id: newOrderId,
      customerName: details.customerName || 'Studio Client',
      customerEmail: details.customerEmail || 'client@studio.com',
      total: finalTotal,
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
        target: `${details.paymentMethod} · ${currency.symbol}${finalTotal.toLocaleString()}${appliedPromo ? ` (${appliedPromo.code} -${appliedPromo.discountPercent}%)` : ''}`,
        user: details.customerName || 'Customer',
        timestamp: 'Just now'
      },
      ...prev
    ]);
    clearCart();
    setAppliedPromo(null);
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

  const promoDiscountUSD = appliedPromo ? (cartSubtotalUSD * appliedPromo.discountPercent) / 100 : 0;
  const cartFinalTotalUSD = Math.max(0, cartSubtotalUSD - promoDiscountUSD);

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

        // Storefront Filters
        storefrontFilters,
        showStorefrontFilters,
        setShowStorefrontFilters,
        toggleStorefrontFilters,
        activeFilter,
        setActiveFilter,
        addStorefrontFilter,
        deleteStorefrontFilter,

        // Custom Rug Popup
        showCustomRugPopup,
        setShowCustomRugPopup,

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
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        cartPromoDiscountUSD: promoDiscountUSD,
        cartFinalTotalUSD,

        // Promo Popup
        promoPopupConfig,
        updatePromoPopupConfig,
        showPromoPopup,
        setShowPromoPopup,
        triggerPromoPreview,

        // Policies
        policies,
        updatePolicySection,

        // Team
        teamMembers,
        toggleTeamMemberActive,
        updateTeamMember,
        addTeamMember,

        // Profile
        userProfile,
        updateUserProfile,

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
