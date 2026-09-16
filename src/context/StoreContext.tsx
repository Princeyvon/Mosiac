import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Product,
  CartItem,
  Currency,
  Order,
  OrderItemSummary,
  AuditLog,
  StorefrontFilter,
  PromoPopupConfig,
  AppliedPromo,
  PromoLead,
  PolicySection,
  TeamMember,
  TeamPermissions,
  UserProfile,
  CollectionItem,
  ShapeItem,
  StyleItem,
  WeightFormulaConfig,
  SizingGuideConfig
} from '../types';
import { INITIAL_PRODUCTS, CURRENCIES } from '../data/initialProducts';
import { getPersistentItem, getPersistentItemSync, setPersistentItem } from '../utils/persistentStorage';

interface StoreContextType {
  // Products (Live vs Staged)
  products: Product[];
  stagedProducts: Product[];
  hasUnpublishedChanges: boolean;
  publishStagedChanges: () => void;
  toggleProductStatus: (id: string, field: 'visible' | 'soldOut' | 'featured' | 'newArrival' | 'starred') => void;
  saveProductDraft: (product: Product, publishLive?: boolean) => void;
  deleteProduct: (id: string) => void;
  createNewProduct: () => string; // returns new product id

  // Routing / View state
  currentView: 'store' | 'pdp' | 'variants' | 'cart' | 'policies' | 'dash' | 'receipt';
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
  currentReceiptOrderId: string | null;
  navigateToReceipt: (orderId: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
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
  appliedPromo: AppliedPromo | null;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  cartPromoDiscountUSD: number;
  cartFinalTotalUSD: number;

  // Promo Popup & Leads
  promoPopupConfig: PromoPopupConfig;
  updatePromoPopupConfig: (config: Partial<PromoPopupConfig>) => void;
  showPromoPopup: boolean;
  setShowPromoPopup: (show: boolean) => void;
  triggerPromoPreview: () => void;
  promoLeads: PromoLead[];
  claimPromoDiscount: (contact: { name: string; email: string; phone: string; code?: string }) => {
    success: boolean;
    message: string;
    leadId: string;
  };
  updateLeadStatus: (leadId: string, status: 'Claimed' | 'Redeemed' | 'Contacted') => void;
  deletePromoLead: (leadId: string) => void;

  // Policies
  policies: PolicySection[];
  updatePolicySection: (id: string, newTitle: string, newContent: string) => void;

  // Store Settings: Collections
  collections: CollectionItem[];
  addCollection: (name: string, description: string, slug?: string) => void;
  updateCollection: (id: string, updates: Partial<CollectionItem>) => void;
  deleteCollection: (id: string) => void;

  // Store Settings: Shapes & Styles
  shapes: ShapeItem[];
  addShape: (name: string, description: string, aspectHint?: string, placementGuidance?: string) => void;
  updateShape: (id: string, updates: Partial<ShapeItem>) => void;
  deleteShape: (id: string) => void;
  styles: StyleItem[];
  addStyle: (name: string, densityMultiplier: number, techniqueDescription: string, pileHeightMm?: number) => void;
  updateStyle: (id: string, updates: Partial<StyleItem>) => void;
  deleteStyle: (id: string) => void;

  // Store Settings: Weight Formula
  weightFormula: WeightFormulaConfig;
  updateWeightFormula: (updates: Partial<WeightFormulaConfig>) => void;
  recalculateAllProductWeights: () => void;
  calculateWeight: (widthCm: number, depthCm: number, styleName?: string, materialName?: string) => number;

  // Store Settings: Sizing Guide Configuration
  sizingGuideConfig: SizingGuideConfig;
  updateSizingGuideConfig: (updates: Partial<SizingGuideConfig>) => void;

  // Team & Granular Permissions
  teamMembers: TeamMember[];
  toggleTeamMemberActive: (id: string) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  addTeamMember: (member: Omit<TeamMember, 'id' | 'lastActive'>) => void;
  deleteTeamMember: (id: string) => void;
  activeTeamMember: TeamMember;
  setActiveTeamMemberId: (id: string) => void;
  currentPermissions: TeamPermissions;

  // Profile
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  // Admin Auth
  isAdminAuth: boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;

  // Cookie banner
  cookieConsent: 'accepted' | 'rejected' | null;
  setCookieConsent: (consent: 'accepted' | 'rejected' | null) => void;

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
  TEAM: 'mosiac_team_v2',
  PROFILE: 'mosiac_profile_v1',
  COLLECTIONS: 'mosiac_collections_v1',
  SHAPES: 'mosiac_shapes_v1',
  STYLES: 'mosiac_styles_v1',
  WEIGHT_FORMULA: 'mosiac_weight_formula_v1',
  SIZING_GUIDE: 'mosiac_sizing_guide_v1',
  ACTIVE_TM_ID: 'mosiac_active_tm_id_v1',
  ORDERS: 'mosiac_orders_v2',
  RECEIPT_ID: 'mosiac_receipt_id_v1',
  PROMO_LEADS: 'mosiac_promo_leads_v1',
};

export const DEFAULT_ROLE_PERMISSIONS: Record<string, TeamPermissions> = {
  'Studio Director': {
    canViewDashboard: true,
    canEditProducts: true,
    canCreateProducts: true,
    canPublishLive: true,
    canDeleteProducts: true,
    canManageOrders: true,
    canManageClientele: true,
    canManageDiscounts: true,
    canManageStoreSettings: true,
    canManagePolicies: true,
    canManageTeam: true,
    canViewFinancials: true,
  },
  'Senior Curator': {
    canViewDashboard: true,
    canEditProducts: true,
    canCreateProducts: true,
    canPublishLive: true,
    canDeleteProducts: false,
    canManageOrders: true,
    canManageClientele: true,
    canManageDiscounts: true,
    canManageStoreSettings: false,
    canManagePolicies: false,
    canManageTeam: false,
    canViewFinancials: true,
  },
  'Atelier Manager': {
    canViewDashboard: true,
    canEditProducts: true,
    canCreateProducts: false,
    canPublishLive: false,
    canDeleteProducts: false,
    canManageOrders: true,
    canManageClientele: true,
    canManageDiscounts: false,
    canManageStoreSettings: false,
    canManagePolicies: false,
    canManageTeam: false,
    canViewFinancials: false,
  },
  'Logistics Lead': {
    canViewDashboard: true,
    canEditProducts: false,
    canCreateProducts: false,
    canPublishLive: false,
    canDeleteProducts: false,
    canManageOrders: true,
    canManageClientele: true,
    canManageDiscounts: false,
    canManageStoreSettings: false,
    canManagePolicies: false,
    canManageTeam: false,
    canViewFinancials: false,
  },
  'Custom Role': {
    canViewDashboard: true,
    canEditProducts: false,
    canCreateProducts: false,
    canPublishLive: false,
    canDeleteProducts: false,
    canManageOrders: false,
    canManageClientele: false,
    canManageDiscounts: false,
    canManageStoreSettings: false,
    canManagePolicies: false,
    canManageTeam: false,
    canViewFinancials: false,
  }
};

export const INITIAL_COLLECTIONS: CollectionItem[] = [
  {
    id: 'col-1',
    name: 'Bespoke Rugs',
    slug: 'bespoke-rugs',
    description: 'Flagship hand-tufted New Zealand wool and bamboo silk statement pieces.',
    featured: true,
  },
  {
    id: 'col-2',
    name: 'Monolith Architectural',
    slug: 'monolith-architectural',
    description: 'Sculptural carved pile works inspired by brutalist and modernist forms.',
    featured: true,
  },
  {
    id: 'col-3',
    name: 'Silk & Wool Archival',
    slug: 'silk-wool-archival',
    description: 'Fine high-density luster-spun yarns with subtle light refraction.',
    featured: false,
  },
  {
    id: 'col-4',
    name: 'Atelier Sculptural',
    slug: 'atelier-sculptural',
    description: 'Contoured bas-relief and asymmetric silhouettes for gallery spaces.',
    featured: true,
  },
  {
    id: 'col-5',
    name: 'Linear Runners',
    slug: 'linear-runners',
    description: 'Directional hall and bedside runners tailored to architectural corridors.',
    featured: false,
  }
];

export const INITIAL_SHAPES: ShapeItem[] = [
  {
    id: 'shp-1',
    name: 'Circular',
    slug: 'circular',
    description: 'Perfect radial boundary evoking Japanese Enso geometry and organic balance.',
    aspectHint: '1:1 Uniform Diameter',
    placementGuidance: 'Ideal for round dining tables, intimate conversational groupings, and anchoring reading chairs.'
  },
  {
    id: 'shp-2',
    name: 'Organic Irregular',
    slug: 'organic-irregular',
    description: 'Freeform curvilinear silhouette that softens rigid architectural angles.',
    aspectHint: 'Fluid Asymmetric Ratio',
    placementGuidance: 'Best placed angled beneath modern low-slung seating or as an unobstructed floor artwork.'
  },
  {
    id: 'shp-3',
    name: 'Curvilinear Wave',
    slug: 'curvilinear-wave',
    description: 'Rhythmic stepped contours with dynamic directional movement.',
    aspectHint: 'Elongated Flowing Form',
    placementGuidance: 'Complements curved sofas, rounded credenzas, and open salon transitions.'
  },
  {
    id: 'shp-4',
    name: 'Architectural Oval',
    slug: 'architectural-oval',
    description: 'Stretched radial form combining linear sofa length with gentle curved corners.',
    aspectHint: '1:1.5 Elliptical Geometry',
    placementGuidance: 'Perfect under oval dining tables or elongated living room sofa arrangements.'
  },
  {
    id: 'shp-5',
    name: 'Rectangular Linear',
    slug: 'rectangular-linear',
    description: 'Classic rectilinear proportions with crisp hand-bound edges.',
    aspectHint: 'Standard Architectural Grid',
    placementGuidance: 'Anchors standard sofa sets with front legs on rug; pairs with king and queen bed frames.'
  },
  {
    id: 'shp-6',
    name: 'Asymmetric Runner',
    slug: 'asymmetric-runner',
    description: 'Directional runner with bespoke edge contouring for passageways and bedsides.',
    aspectHint: '1:3 to 1:4 Corridor Scale',
    placementGuidance: 'Designed for gallery hallways, entry vestibules, and bedside comfort.'
  }
];

export const INITIAL_STYLES: StyleItem[] = [
  {
    id: 'sty-1',
    name: 'High-Relief Hand Carved',
    slug: 'high-relief-hand-carved',
    pileHeightMm: 16,
    densityMultiplier: 1.25,
    techniqueDescription: 'Deep sculptural shearing creating dimensional shadows and tactile terrain.'
  },
  {
    id: 'sty-2',
    name: 'Minimalist Cut-Pile',
    slug: 'minimalist-cut-pile',
    pileHeightMm: 12,
    densityMultiplier: 1.0,
    techniqueDescription: 'Even, velvet-dense surface providing serene sound dampening and underfoot softness.'
  },
  {
    id: 'sty-3',
    name: 'Architectural Loop & Cut',
    slug: 'architectural-loop-and-cut',
    pileHeightMm: 10,
    densityMultiplier: 0.9,
    techniqueDescription: 'Dual-texture alternating between tight loop rows and plush cut tufts for durability.'
  },
  {
    id: 'sty-4',
    name: 'Luster Silk Gradient',
    slug: 'luster-silk-gradient',
    pileHeightMm: 14,
    densityMultiplier: 1.15,
    techniqueDescription: 'Subtle blend of bamboo silk and wool creating an ombre luminescence when light shifts.'
  }
];

export const INITIAL_WEIGHT_FORMULA: WeightFormulaConfig = {
  unit: 'kg',
  densityKgPerM2: 3.45,
  basePackagingKg: 0.8,
  materialMultipliers: {
    '100% Hand-Tufted New Zealand Wool': 1.0,
    'New Zealand Wool & Bamboo Silk': 1.12,
    'Pure Luster Bamboo Silk': 1.2,
    'Studio Wool Blend': 0.95
  },
  styleMultipliers: {
    'High-Relief Hand Carved': 1.25,
    'Minimalist Cut-Pile': 1.0,
    'Architectural Loop & Cut': 0.9,
    'Luster Silk Gradient': 1.15
  }
};

export const INITIAL_SIZING_GUIDE: SizingGuideConfig = {
  eyebrow: 'Studio Sizing & Placement Guide',
  headline: 'Scale & Dimensions Reference',
  description: 'Every Mosiac piece is hand-tufted from pure New Zealand virgin wool and luster-spun botanical bamboo silk. Use this architectural guide to select the ideal scale for your interior.',
  livingRoomTip: 'For standard seating groups, choose L (250cm) so front sofa legs rest naturally over the rug, anchoring the coffee table. For compact apartments or statement focal points, choose M (200cm).',
  bedroomTip: 'For a king bed, select XL (300cm) to provide generous 60–80cm margins on either side and the foot of the bed. For queen beds, L (250cm) offers ideal proportion.',
  diningRoomTip: 'Ensure the rug extends at least 60cm beyond all edges of your dining table so chairs remain on the rug even when pushed back.',
  shapeSpecificTips: {
    'Circular': 'Circular rugs soften rigid box rooms and frame round coffee tables with an even 25–40cm perimeter margin.',
    'Organic Irregular': 'Stated dimensions describe the overall bounding envelope. Silhouette narrows gracefully at the center, creating organic negative space.',
    'Curvilinear Wave': 'Orient the flowing wave towards the room entrance or focal view to guide visual momentum naturally.',
    'Architectural Oval': 'Allows elongated sofa groupings without sharp corner traffic bottlenecks. Superb for open-plan passages.',
    'Rectangular Linear': 'Align with the primary architectural axis of your room; ensure rug edges parallel major walls.',
    'Asymmetric Runner': 'Maintain at least 10–15cm of bare floor between the runner edge and walls or baseboards.'
  },
  sizeRows: [
    {
      id: 'sz-s',
      size: 'S',
      name: 'Small / Accent',
      widthCm: 150,
      depthCm: 150,
      idealFor: 'Entryways, intimate reading nooks, bedside accent, executive desk vignettes'
    },
    {
      id: 'sz-m',
      size: 'M',
      name: 'Medium / Studio',
      widthCm: 200,
      depthCm: 200,
      idealFor: 'Two-to-three seater sofas, apartment living rooms, queen bed footings, home offices'
    },
    {
      id: 'sz-l',
      size: 'L',
      name: 'Large / Living',
      widthCm: 250,
      depthCm: 250,
      idealFor: 'Full living room conversational groupings (front sofa legs anchored), 6-seat dining areas'
    },
    {
      id: 'sz-xl',
      size: 'XL',
      name: 'Extra Large / Grand',
      widthCm: 300,
      depthCm: 300,
      idealFor: 'Grand open-plan living salons, master suites anchoring king beds with nightstands, 8–10 seat dining tables'
    }
  ],
  customInquiryText: 'Need custom dimensions or tailored architectural shapes? Our studio crafts custom tufted pieces to exact millimeter specifications.',
  customInquiryUrl: 'https://ig.me/m/rugmosiac'
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
    lastActive: 'Just now',
    permissions: DEFAULT_ROLE_PERMISSIONS['Studio Director']
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
    lastActive: '2 hours ago',
    permissions: DEFAULT_ROLE_PERMISSIONS['Senior Curator']
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
    lastActive: 'Yesterday',
    permissions: DEFAULT_ROLE_PERMISSIONS['Atelier Manager']
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
    lastActive: '5 days ago',
    permissions: DEFAULT_ROLE_PERMISSIONS['Logistics Lead']
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
  badgeText: 'Welcome Gift',
  eyebrow: 'EXCLUSIVE FIRST PURCHASE OFFER',
  headline: 'Enjoy 25,000 Rwf Free Credit on Your First Order',
  subtext: 'Receive a complimentary 25,000 Rwf studio credit applied directly at checkout on your first bespoke rug or studio piece.',
  buttonText: 'Claim 25,000 Rwf Credit',
  discountCode: 'RWF25K',
  imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
  discountAmountRWF: 25000,
  creditType: 'fixed_rwf',
  filterTag: undefined
};

const INITIAL_PROMO_LEADS: PromoLead[] = [
  {
    id: 'lead-101',
    name: 'Amina Uwase',
    email: 'amina.uwase@kigalidesign.rw',
    phone: '+250 788 123 456',
    code: 'RWF25K',
    creditClaimed: '25,000 Rwf',
    claimedAt: 'Sep 14, 2026, 11:20 AM',
    status: 'Claimed'
  },
  {
    id: 'lead-102',
    name: 'Jean-Paul Habimana',
    email: 'jp.habimana@arch-kigali.com',
    phone: '+250 782 987 654',
    code: 'RWF25K',
    creditClaimed: '25,000 Rwf',
    claimedAt: 'Sep 15, 2026, 04:45 PM',
    status: 'Claimed'
  },
  {
    id: 'lead-103',
    name: 'Sonia Mukamana',
    email: 'sonia@atelier-east.rw',
    phone: '+250 789 555 321',
    code: 'RWF25K',
    creditClaimed: '25,000 Rwf',
    claimedAt: 'Sep 16, 2026, 09:15 AM',
    status: 'Claimed'
  }
];

const INITIAL_ORDERS: Order[] = [
  {
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
    notes: 'Master loom tufting and velvet carving in progress at Nordic atelier.',
    items: [
      {
        productId: 'prod-monolith-1',
        productName: 'Travertine Monolith Sculpture Rug',
        productSlug: 'monolith-travertine-sculpture-rug',
        productImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',
        sizeLabel: 'L',
        dimensions: '250 × 250 cm',
        colorName: 'Raw Travertine Cream',
        unitPrice: 5400,
        quantity: 1,
        total: 5400
      }
    ]
  },
  {
    id: 'ORD-9020',
    receiptId: 'RCP-ORD-9020-L4B',
    customerName: 'Henrik Lindqvist',
    customerEmail: 'henrik@nordicform.se',
    total: 4270,
    subtotal: 4270,
    discount: 0,
    currency: 'USD',
    status: 'Fulfilled',
    date: '2026-09-07',
    itemsCount: 2,
    paymentMethod: 'Credit Card',
    cardLast4: '8831',
    shippingMethod: 'White-Glove Inspected Freight',
    shippingFee: 0,
    carrier: 'PostNord Signature Air',
    trackingNumber: 'MOS-SE-772810',
    estimatedDelivery: 'Delivered Sep 11, 2026',
    destinationCity: 'Stockholm, Sweden',
    items: [
      {
        productId: 'prod-curv-1',
        productName: 'Curvilinear Dune Horizon Rug',
        productSlug: 'curvilinear-dune-horizon-rug',
        productImage: 'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=900&q=85',
        sizeLabel: 'M',
        dimensions: '200 × 200 cm',
        colorName: 'Sand Ochre',
        unitPrice: 2680,
        quantity: 1,
        total: 2680
      },
      {
        productId: 'prod-vertex-1',
        productName: 'Vertex Relief Wool Tapestry Rug',
        productSlug: 'vertex-relief-wool-tapestry-rug',
        productImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85',
        sizeLabel: 'S',
        dimensions: '150 × 150 cm',
        colorName: 'Bone Chalk',
        unitPrice: 1590,
        quantity: 1,
        total: 1590
      }
    ]
  },
  {
    id: 'ORD-9019',
    receiptId: 'RCP-ORD-9019-J7T',
    customerName: 'Sora Takahashi',
    customerEmail: 'sora@tokyo-space.jp',
    total: 950,
    subtotal: 950,
    discount: 0,
    currency: 'USD',
    status: 'Fulfilled',
    date: '2026-09-05',
    itemsCount: 1,
    paymentMethod: 'PayPal',
    shippingMethod: 'White-Glove Inspected Freight',
    shippingFee: 0,
    carrier: 'Yamato Atelier Logistics',
    trackingNumber: 'MOS-JP-330198',
    estimatedDelivery: 'Delivered Sep 09, 2026',
    destinationCity: 'Tokyo, Japan',
    items: [
      {
        productId: 'prod-obelisk-1',
        productName: 'Radial Solstice High-Pile Rug',
        productSlug: 'radial-solstice-high-pile-rug',
        productImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85',
        sizeLabel: 'S',
        dimensions: '150 × 150 cm',
        colorName: 'Natural Ivory',
        unitPrice: 950,
        quantity: 1,
        total: 950
      }
    ]
  },
  {
    id: 'ORD-9018',
    receiptId: 'RCP-ORD-9018-R2W',
    customerName: 'Elena Rostova',
    customerEmail: 'elena@rostova.com',
    total: 3800,
    subtotal: 3800,
    discount: 0,
    currency: 'USD',
    status: 'Pending',
    date: '2026-09-04',
    itemsCount: 1,
    paymentMethod: 'Credit Card',
    cardLast4: '1029',
    shippingMethod: 'White-Glove Inspected Freight',
    shippingFee: 0,
    carrier: 'FedEx Custom Critical',
    trackingNumber: 'MOS-US-449102',
    estimatedDelivery: 'Sep 19 – Sep 22, 2026',
    destinationCity: 'New York, USA',
    items: [
      {
        productId: 'prod-strata-1',
        productName: 'Strata Kinetic Contour Runner',
        productSlug: 'strata-kinetic-contour-runner',
        productImage: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=900&q=85',
        sizeLabel: 'L',
        dimensions: '250 × 250 cm',
        colorName: 'Graphite Umber',
        unitPrice: 3800,
        quantity: 1,
        total: 3800
      }
    ]
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', action: 'Published live changes', target: 'Catalogue', user: 'Admin (Studio)', timestamp: 'Today at 10:14 AM' },
  { id: 'log-2', action: 'Marked as Sold Out', target: 'Obelisk Terracotta Urn', user: 'Admin (Studio)', timestamp: 'Yesterday at 4:30 PM' },
  { id: 'log-3', action: 'Created new product', target: 'Vertex Textured Wool Rug', user: 'Admin (Studio)', timestamp: '3 days ago' },
  { id: 'log-4', action: 'Updated pricing table', target: 'Monolith Travertine Console', user: 'Admin (Studio)', timestamp: '4 days ago' }
];

const normalizeSizeLabel = (label: string, index: number, total: number): string => {
  const upper = (label || '').trim().toUpperCase();
  if (['S', 'M', 'L', 'XL'].includes(upper)) return upper;
  if (upper.includes('COMPACT') || upper.includes('SMALL') || upper.includes('STUDIO')) return 'S';
  if (upper.includes('LIVING') || upper.includes('MEDIUM') || upper.includes('GALLERY') || upper.includes('STANDARD')) return 'M';
  if (upper.includes('SALON') || upper.includes('LOUNGE') || upper.includes('LARGE') || upper.includes('GRAND')) return 'L';
  if (upper.includes('ATRIUM') || upper.includes('MONUMENTAL') || upper.includes('EXTRA') || upper.includes('XL')) return 'XL';
  const sequence = ['S', 'M', 'L', 'XL'];
  return sequence[index] || 'M';
};

const sanitizeProduct = (p: any): Product => {
  const rawSizes = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : null;
  const basePrice = typeof p.fromPrice === 'number' ? p.fromPrice : 1850;

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
    colours: Array.isArray(p.colours) && p.colours.length > 0
      ? p.colours.map((c: any, idx: number) => {
          return {
            id: c.id || `c-${idx + 1}`,
            name: c.name || `Variant ${idx + 1}`,
            hex: c.hex || '#111111',
            image: c.image !== undefined ? c.image : (idx === 0 ? p.cardImage : undefined),
            galleryImages: Array.isArray(c.galleryImages) ? c.galleryImages : undefined,
          };
        })
      : [{ id: 'c-default', name: 'Studio Finish', hex: '#222222', image: p.cardImage || '/images/uzu-slate-bronze.jpg' }],
    cardImage: p.cardImage || '/images/uzu-slate-bronze.jpg',
    hoverImage: p.hoverImage || undefined,
    galleryImages: Array.isArray(p.galleryImages) && p.galleryImages.length > 0 ? p.galleryImages : [p.cardImage || '/images/uzu-slate-bronze.jpg'],
    sizes: rawSizes
      ? rawSizes.map((s: any, idx: number, arr: any[]) => ({
          ...s,
          label: (typeof s.label === 'string' && s.label.trim()) ? s.label.trim() : normalizeSizeLabel(s.label, idx, arr.length),
          price: typeof s.price === 'number' ? s.price : basePrice
        }))
      : [
          { id: 's1', label: 'S', width: 150, depth: 150, price: basePrice, weight: 19 },
          { id: 's2', label: 'M', width: 200, depth: 200, price: Math.round(basePrice * 1.45), weight: 34 },
          { id: 's3', label: 'L', width: 250, depth: 250, price: Math.round(basePrice * 2.05), weight: 53 },
          { id: 's4', label: 'XL', width: 300, depth: 300, price: Math.round(basePrice * 2.75), weight: 77 }
        ],
    fromPrice: basePrice,
    costPrice: typeof p.costPrice === 'number' ? p.costPrice : Math.round(basePrice * 0.35),
    sku: p.sku || 'FORMA-001',
    stockOnHand: typeof p.stockOnHand === 'number' ? p.stockOnHand : 4,
    lowStockAlertAt: typeof p.lowStockAlertAt === 'number' ? p.lowStockAlertAt : 2,
    fulfilment: p.fulfilment || p.availability || 'In stock',
    visible: p.visible !== false,
    featured: Boolean(p.featured),
    newArrival: Boolean(p.newArrival),
    starred: Boolean(p.starred),
    featuredOrder: typeof p.featuredOrder === 'number' ? p.featuredOrder : undefined,
    seoTitle: p.seoTitle || '',
    seoDescription: p.seoDescription || '',
    updatedAt: typeof p.updatedAt === 'number' ? p.updatedAt : undefined,
  };
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Flag to avoid overwriting IndexedDB with fallback/initial state during initial render
  const isHydratedRef = useRef(false);

  // Live products - synchronous init from persistent storage
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = getPersistentItemSync<Product[]>(STORAGE_KEYS.LIVE_PRODUCTS, []);
      if (Array.isArray(saved) && saved.length > 0) {
        return saved.map(sanitizeProduct);
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Staged products (for the admin dashboard draft mode)
  const [stagedProducts, setStagedProducts] = useState<Product[]>(() => {
    try {
      const saved = getPersistentItemSync<Product[]>(STORAGE_KEYS.STAGED_PRODUCTS, []);
      if (Array.isArray(saved) && saved.length > 0) {
        return saved.map(sanitizeProduct);
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Hydrate from IndexedDB in case localStorage was full, purged, or restricted
  // Only overwrites if IndexedDB has newer timestamps than memory/localStorage
  useEffect(() => {
    let active = true;
    async function hydrate() {
      try {
        const [idbLive, idbStaged] = await Promise.all([
          getPersistentItem<Product[] | null>(STORAGE_KEYS.LIVE_PRODUCTS, null),
          getPersistentItem<Product[] | null>(STORAGE_KEYS.STAGED_PRODUCTS, null)
        ]);
        if (!active) return;
        if (Array.isArray(idbLive) && idbLive.length > 0) {
          setProducts(prev => {
            const prevMax = Math.max(0, ...prev.map(p => p.updatedAt || 0));
            const idbMax = Math.max(0, ...idbLive.map(p => p.updatedAt || 0));
            if (idbMax > prevMax) {
              return idbLive.map(sanitizeProduct);
            }
            return prev;
          });
        }
        if (Array.isArray(idbStaged) && idbStaged.length > 0) {
          setStagedProducts(prev => {
            const prevMax = Math.max(0, ...prev.map(p => p.updatedAt || 0));
            const idbMax = Math.max(0, ...idbStaged.map(p => p.updatedAt || 0));
            if (idbMax > prevMax) {
              return idbStaged.map(sanitizeProduct);
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn('IndexedDB initial hydration skipped:', err);
      } finally {
        if (active) {
          isHydratedRef.current = true;
        }
      }
    }
    hydrate();
    return () => { active = false; };
  }, []);

  // Navigation / views - restored across page refreshes
  const [currentView, setCurrentView] = useState<'store' | 'pdp' | 'variants' | 'cart' | 'policies' | 'dash' | 'receipt'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#/dash') || window.location.pathname.endsWith('/dash')) return 'dash';
      if (hash.startsWith('#/receipt/')) return 'receipt';
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('receipt')) return 'receipt';
      if (hash.startsWith('#/pdp/')) return 'pdp';
      if (hash.startsWith('#/variants/')) return 'variants';
      if (hash.startsWith('#/cart')) return 'cart';
      if (hash.startsWith('#/policies')) return 'policies';
      const savedView = sessionStorage.getItem('mosiac_current_view');
      if (savedView && ['store', 'pdp', 'variants', 'cart', 'policies', 'dash', 'receipt'].includes(savedView)) {
        return savedView as any;
      }
    }
    return 'store';
  });

  const [currentReceiptOrderId, setCurrentReceiptOrderId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#/receipt/')) {
        return hash.replace('#/receipt/', '').trim();
      }
      const searchParams = new URLSearchParams(window.location.search);
      const qReceipt = searchParams.get('receipt');
      if (qReceipt) return qReceipt.trim();
      return sessionStorage.getItem('mosiac_current_receipt_order_id') || 'ORD-9021';
    }
    return 'ORD-9021';
  });

  const [currentProductSlug, setCurrentProductSlug] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#/pdp/')) return hash.replace('#/pdp/', '');
      if (hash.startsWith('#/variants/')) return hash.replace('#/variants/', '');
      return sessionStorage.getItem('mosiac_current_slug') || null;
    }
    return null;
  });

  const [selectedColorVariant, setSelectedColorVariant] = useState<string | null>(null);
  const [gridDensity, setGridDensity] = useState<'dense' | 'normal'>('dense');
  const [activeAdminTab, setActiveAdminTab] = useState<string>('catalogue');
  const [editingProductId, setEditingProductId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('mosiac_editing_product_id') || null;
    }
    return null;
  });

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

  // Promo Pop-up Configuration (Defaults to 25,000 Rwf credit and auto-migrates any legacy 70% cache)
  const [promoPopupConfig, setPromoPopupConfig] = useState<PromoPopupConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROMO_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If stale 70% offer or missing fixed 25,000 Rwf credit, upgrade automatically
        const isStale =
          !parsed.discountAmountRWF ||
          parsed.discountAmountRWF !== 25000 ||
          (typeof parsed.headline === 'string' &&
            (parsed.headline.includes('70%') || parsed.headline.includes('70 percent')));

        if (isStale) {
          const upgraded: PromoPopupConfig = {
            ...INITIAL_PROMO_CONFIG,
            ...parsed,
            headline: 'Enjoy 25,000 Rwf Free Credit on Your First Order',
            subtext: 'Enter your contact details to claim your complimentary 25,000 Rwf studio credit applied directly at checkout on your first bespoke rug or studio piece.',
            buttonText: 'Claim 25,000 Rwf Credit',
            discountCode: 'RWF25K',
            discountAmountRWF: 25000,
            creditType: 'fixed_rwf',
            badgeText: 'Welcome Gift',
            eyebrow: 'EXCLUSIVE FIRST PURCHASE OFFER'
          };
          try {
            localStorage.setItem(STORAGE_KEYS.PROMO_CONFIG, JSON.stringify(upgraded));
          } catch {}
          return upgraded;
        }
        return parsed;
      }
      return INITIAL_PROMO_CONFIG;
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

  // Promo Leads & Contact Capture (Name, Email & Phone)
  const [promoLeads, setPromoLeads] = useState<PromoLead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROMO_LEADS);
      return saved ? JSON.parse(saved) : INITIAL_PROMO_LEADS;
    } catch {
      return INITIAL_PROMO_LEADS;
    }
  });

  const claimPromoDiscount = (contact: { name: string; email: string; phone: string; code?: string }) => {
    const codeToUse = (contact.code || promoPopupConfig.discountCode || 'RWF25K').trim().toUpperCase();
    const newLead: PromoLead = {
      id: 'lead-' + Date.now(),
      name: contact.name.trim() || 'Valued Guest',
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      code: codeToUse,
      creditClaimed: '25,000 Rwf',
      claimedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'Claimed'
    };

    setPromoLeads(prev => {
      const next = [newLead, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.PROMO_LEADS, JSON.stringify(next));
      } catch {}
      setPersistentItem(STORAGE_KEYS.PROMO_LEADS, next);
      return next;
    });

    // Automatically apply promo code to active cart & checkout session
    applyPromoCode(codeToUse);

    // Record in Studio audit log
    setAuditLogs(prev => [
      {
        id: 'log-' + Date.now(),
        action: 'Claimed 25,000 Rwf Promo Credit',
        target: `${newLead.name} (${newLead.phone || newLead.email})`,
        user: 'Storefront Visitor',
        timestamp: 'Just now'
      },
      ...prev
    ]);

    showToast(`25,000 Rwf credit unlocked for ${newLead.name}!`);
    return { success: true, message: '25,000 Rwf credit claimed!', leadId: newLead.id };
  };

  const updateLeadStatus = (leadId: string, status: 'Claimed' | 'Redeemed' | 'Contacted') => {
    setPromoLeads(prev => {
      const next = prev.map(l => (l.id === leadId ? { ...l, status } : l));
      try {
        localStorage.setItem(STORAGE_KEYS.PROMO_LEADS, JSON.stringify(next));
      } catch {}
      setPersistentItem(STORAGE_KEYS.PROMO_LEADS, next);
      return next;
    });
    showToast(`Lead marked as ${status}`);
  };

  const deletePromoLead = (leadId: string) => {
    setPromoLeads(prev => {
      const next = prev.filter(l => l.id !== leadId);
      try {
        localStorage.setItem(STORAGE_KEYS.PROMO_LEADS, JSON.stringify(next));
      } catch {}
      setPersistentItem(STORAGE_KEYS.PROMO_LEADS, next);
      return next;
    });
    showToast('Promo lead removed');
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

  // Collections State
  const [collections, setCollections] = useState<CollectionItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      return saved ? JSON.parse(saved) : INITIAL_COLLECTIONS;
    } catch {
      return INITIAL_COLLECTIONS;
    }
  });

  const addCollection = (name: string, description: string, slug?: string) => {
    const s = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCol: CollectionItem = {
      id: 'col-' + Date.now().toString().slice(-4),
      name,
      slug: s,
      description,
      featured: false
    };
    setCollections(prev => {
      const next = [...prev, newCol];
      try {
        localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Added collection: ${name}`);
  };

  const updateCollection = (id: string, updates: Partial<CollectionItem>) => {
    setCollections(prev => {
      const next = prev.map(c => (c.id === id ? { ...c, ...updates } : c));
      try {
        localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Collection updated');
  };

  const deleteCollection = (id: string) => {
    setCollections(prev => {
      const next = prev.filter(c => c.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Collection removed');
  };

  // Shapes State
  const [shapes, setShapes] = useState<ShapeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHAPES);
      return saved ? JSON.parse(saved) : INITIAL_SHAPES;
    } catch {
      return INITIAL_SHAPES;
    }
  });

  const addShape = (name: string, description: string, aspectHint?: string, placementGuidance?: string) => {
    const s = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newShape: ShapeItem = {
      id: 'shp-' + Date.now().toString().slice(-4),
      name,
      slug: s,
      description,
      aspectHint,
      placementGuidance
    };
    setShapes(prev => {
      const next = [...prev, newShape];
      try {
        localStorage.setItem(STORAGE_KEYS.SHAPES, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Added shape: ${name}`);
  };

  const updateShape = (id: string, updates: Partial<ShapeItem>) => {
    setShapes(prev => {
      const next = prev.map(s => (s.id === id ? { ...s, ...updates } : s));
      try {
        localStorage.setItem(STORAGE_KEYS.SHAPES, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Shape updated');
  };

  const deleteShape = (id: string) => {
    setShapes(prev => {
      const next = prev.filter(s => s.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.SHAPES, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Shape removed');
  };

  // Styles State
  const [styles, setStyles] = useState<StyleItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STYLES);
      return saved ? JSON.parse(saved) : INITIAL_STYLES;
    } catch {
      return INITIAL_STYLES;
    }
  });

  const addStyle = (name: string, densityMultiplier: number, techniqueDescription: string, pileHeightMm?: number) => {
    const s = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newStyle: StyleItem = {
      id: 'sty-' + Date.now().toString().slice(-4),
      name,
      slug: s,
      densityMultiplier,
      techniqueDescription,
      pileHeightMm
    };
    setStyles(prev => {
      const next = [...prev, newStyle];
      try {
        localStorage.setItem(STORAGE_KEYS.STYLES, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Added style: ${name}`);
  };

  const updateStyle = (id: string, updates: Partial<StyleItem>) => {
    setStyles(prev => {
      const next = prev.map(st => (st.id === id ? { ...st, ...updates } : st));
      try {
        localStorage.setItem(STORAGE_KEYS.STYLES, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Style updated');
  };

  const deleteStyle = (id: string) => {
    setStyles(prev => {
      const next = prev.filter(st => st.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.STYLES, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Style removed');
  };

  // Weight Formula State
  const [weightFormula, setWeightFormula] = useState<WeightFormulaConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WEIGHT_FORMULA);
      return saved ? JSON.parse(saved) : INITIAL_WEIGHT_FORMULA;
    } catch {
      return INITIAL_WEIGHT_FORMULA;
    }
  });

  const updateWeightFormula = (updates: Partial<WeightFormulaConfig>) => {
    setWeightFormula(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEYS.WEIGHT_FORMULA, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Weight formula parameters updated');
  };

  const calculateWeight = (widthCm: number, depthCm: number, styleName?: string, materialName?: string): number => {
    const areaM2 = (widthCm / 100) * (depthCm / 100);
    const styleMult = (styleName && weightFormula.styleMultipliers[styleName]) || 1.0;
    const materialMult = (materialName && weightFormula.materialMultipliers[materialName]) || 1.0;
    const weightKg = (areaM2 * weightFormula.densityKgPerM2 * styleMult * materialMult) + weightFormula.basePackagingKg;
    if (weightFormula.unit === 'lbs') {
      return Math.round(weightKg * 2.20462 * 10) / 10;
    }
    return Math.round(weightKg * 10) / 10;
  };

  const recalculateAllProductWeights = () => {
    const updateSizes = (prods: Product[]) =>
      prods.map(p => ({
        ...p,
        sizes: (p.sizes || []).map(s => ({
          ...s,
          weight: calculateWeight(s.width, s.depth, p.shape, p.material)
        }))
      }));

    setProducts(prev => {
      const next = updateSizes(prev);
      setPersistentItem(STORAGE_KEYS.LIVE_PRODUCTS, next);
      return next;
    });

    setStagedProducts(prev => {
      const next = updateSizes(prev);
      setPersistentItem(STORAGE_KEYS.STAGED_PRODUCTS, next);
      return next;
    });

    showToast(`Recalculated weights across all catalogue sizes (${weightFormula.unit})`);
  };

  // Sizing Guide Configuration State
  const [sizingGuideConfig, setSizingGuideConfig] = useState<SizingGuideConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SIZING_GUIDE);
      return saved ? JSON.parse(saved) : INITIAL_SIZING_GUIDE;
    } catch {
      return INITIAL_SIZING_GUIDE;
    }
  });

  const updateSizingGuideConfig = (updates: Partial<SizingGuideConfig>) => {
    setSizingGuideConfig(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEYS.SIZING_GUIDE, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Sizing guide configuration saved');
  };

  // Studio Team Members (with accordion credentials in Dash)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAM);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((m: any) => ({
            ...m,
            permissions: m.permissions || DEFAULT_ROLE_PERMISSIONS[m.role] || DEFAULT_ROLE_PERMISSIONS['Custom Role']
          }));
        }
      }
      return INITIAL_TEAM;
    } catch {
      return INITIAL_TEAM;
    }
  });

  // Active persona/member selected for permission simulation & session
  const [activeTeamMemberId, setActiveTeamMemberId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TM_ID);
      return saved || 'tm-1';
    } catch {
      return 'tm-1';
    }
  });

  const handleSetActiveTeamMemberId = (id: string) => {
    setActiveTeamMemberId(id);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TM_ID, id);
    } catch {}
    const member = teamMembers.find(m => m.id === id);
    if (member) {
      showToast(`Switched active view to: ${member.name} (${member.role})`);
    }
  };

  const activeTeamMember = teamMembers.find(m => m.id === activeTeamMemberId) || teamMembers[0] || INITIAL_TEAM[0];
  const currentPermissions = activeTeamMember?.permissions || DEFAULT_ROLE_PERMISSIONS[activeTeamMember?.role || 'Studio Director'] || DEFAULT_ROLE_PERMISSIONS['Studio Director'];

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
    const rolePermissions = member.permissions || DEFAULT_ROLE_PERMISSIONS[member.role] || DEFAULT_ROLE_PERMISSIONS['Custom Role'];
    const newMember: TeamMember = {
      ...member,
      id: 'tm-' + Date.now().toString().slice(-4),
      lastActive: 'Never',
      permissions: rolePermissions
    };
    const next = [...teamMembers, newMember];
    setTeamMembers(next);
    try {
      localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(next));
    } catch {}
    showToast(`Added ${member.name} to team`);
  };

  const deleteTeamMember = (id: string) => {
    setTeamMembers(prev => {
      const next = prev.filter(m => m.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Team member removed');
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
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();

    // 25,000 Rwf Free Credit on first purchase (RWF25K, FIRST25K, MOSIAC25K, or legacy SAMPLE70)
    if (clean === 'RWF25K' || clean === 'FIRST25K' || clean === 'MOSIAC25K' || clean === 'RWANDA25K' || clean === 'SAMPLE70') {
      const fixedRWF = 25000;
      const fixedUSD = 25000 / 1320.0;
      setAppliedPromo({
        code: clean === 'SAMPLE70' ? 'RWF25K' : clean,
        discountFixedRWF: fixedRWF,
        discountFixedUSD: fixedUSD,
        description: '25,000 Rwf First Purchase Credit'
      });
      showToast('Promo code applied: 25,000 Rwf credit added!');
      return { success: true, message: '25,000 Rwf free credit applied to your order!' };
    } else if (clean === 'MOSIAC10' || clean === 'WELCOME10') {
      setAppliedPromo({ code: clean, discountPercent: 10, description: 'Collector Welcome (10% Off)' });
      showToast('Promo code applied: 10% Off!');
      return { success: true, message: '10% discount applied!' };
    } else if (clean === promoPopupConfig.discountCode.toUpperCase()) {
      if (promoPopupConfig.creditType === 'fixed_rwf' || promoPopupConfig.discountAmountRWF) {
        const amount = promoPopupConfig.discountAmountRWF || 25000;
        setAppliedPromo({
          code: clean,
          discountFixedRWF: amount,
          discountFixedUSD: amount / 1320.0,
          description: `${amount.toLocaleString()} Rwf Studio Credit`
        });
        showToast(`Promo code applied: ${amount.toLocaleString()} Rwf credit added!`);
        return { success: true, message: `${amount.toLocaleString()} Rwf credit applied!` };
      } else {
        setAppliedPromo({ code: clean, discountPercent: 30, description: 'Promotional Offer (30% Off)' });
        showToast('Promo code applied: 30% Off!');
        return { success: true, message: 'Promotional discount applied!' };
      }
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

  const setCookieConsent = (val: 'accepted' | 'rejected' | null) => {
    setCookieConsentState(val);
    try {
      if (val === null) {
        localStorage.removeItem(STORAGE_KEYS.COOKIES);
      } else {
        localStorage.setItem(STORAGE_KEYS.COOKIES, val);
      }
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

  // Orders and Audit Logs with persistent storage
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ORDERS;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications] = useState<string[]>([
    'High traffic alert: PDP views up 42% on Monolith Console',
    'Inventory reminder: Strata Bronze Chair has 2 units remaining',
    'New trade inquiry received from Architectural Digest Studio'
  ]);

  // Sync orders to persistent storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {}
  }, [orders]);

  // Listen for hash changes for #/receipt/:orderId
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/receipt/')) {
        const oId = hash.replace('#/receipt/', '').trim();
        if (oId) {
          setCurrentReceiptOrderId(oId);
          setCurrentView('receipt');
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync to persistent storage only AFTER initial hydration has completed
  useEffect(() => {
    if (!isHydratedRef.current) return;
    setPersistentItem(STORAGE_KEYS.LIVE_PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    setPersistentItem(STORAGE_KEYS.STAGED_PRODUCTS, stagedProducts);
  }, [stagedProducts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Sync navigation view, slug, and editing product to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('mosiac_current_view', currentView);
      if (currentProductSlug) {
        sessionStorage.setItem('mosiac_current_slug', currentProductSlug);
      }
      if (editingProductId) {
        sessionStorage.setItem('mosiac_editing_product_id', editingProductId);
      } else {
        sessionStorage.removeItem('mosiac_editing_product_id');
      }
    } catch {}
  }, [currentView, currentProductSlug, editingProductId]);

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
    try {
      sessionStorage.setItem('mosiac_current_view', 'store');
      sessionStorage.removeItem('mosiac_editing_product_id');
      if (window.location.hash) window.location.hash = '';
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPDP = (slug: string, colorVariant?: string) => {
    setCurrentProductSlug(slug);
    if (colorVariant) {
      setSelectedColorVariant(colorVariant);
    }
    setCurrentView('pdp');
    setEditingProductId(null);
    try {
      sessionStorage.setItem('mosiac_current_view', 'pdp');
      sessionStorage.setItem('mosiac_current_slug', slug);
      sessionStorage.removeItem('mosiac_editing_product_id');
      window.location.hash = `#/pdp/${slug}`;
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToVariants = (slug: string) => {
    setCurrentProductSlug(slug);
    setCurrentView('variants');
    setEditingProductId(null);
    try {
      sessionStorage.setItem('mosiac_current_view', 'variants');
      sessionStorage.setItem('mosiac_current_slug', slug);
      sessionStorage.removeItem('mosiac_editing_product_id');
      window.location.hash = `#/variants/${slug}`;
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCart = () => {
    setCurrentView('cart');
    try {
      sessionStorage.setItem('mosiac_current_view', 'cart');
      window.location.hash = '#/cart';
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPolicies = () => {
    setCurrentView('policies');
    try {
      sessionStorage.setItem('mosiac_current_view', 'policies');
      window.location.hash = '#/policies';
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDash = (tab?: string) => {
    setCurrentView('dash');
    if (tab) setActiveAdminTab(tab);
    try {
      sessionStorage.setItem('mosiac_current_view', 'dash');
      window.location.hash = '#/dash';
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToReceipt = (orderId: string) => {
    if (!orderId) return;
    const cleanId = orderId.trim();
    setCurrentReceiptOrderId(cleanId);
    setCurrentView('receipt');
    try {
      sessionStorage.setItem('mosiac_current_view', 'receipt');
      sessionStorage.setItem('mosiac_current_receipt_order_id', cleanId);
      window.location.hash = `#/receipt/${cleanId}`;
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getOrderById = (orderId: string): Order | undefined => {
    if (!orderId) return undefined;
    const clean = orderId.trim().toLowerCase();
    return orders.find(
      o =>
        o.id.toLowerCase() === clean ||
        o.receiptId?.toLowerCase() === clean ||
        o.id.toLowerCase().replace('ord-', '') === clean.replace('ord-', '')
    );
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
    destinationCity?: string;
  }): Order => {
    const newOrderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const receiptSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const receiptId = `RCP-${newOrderId}-${receiptSuffix}`;
    const promoDiscountUSD = appliedPromo
      ? (appliedPromo.discountFixedUSD !== undefined
          ? Math.min(cartSubtotalUSD, appliedPromo.discountFixedUSD)
          : appliedPromo.discountPercent !== undefined
            ? (cartSubtotalUSD * appliedPromo.discountPercent) / 100
            : 0)
      : 0;
    const finalTotal = Math.max(0, cartSubtotalUSD - promoDiscountUSD);

    // Map cart items into full OrderItemSummary with high-res pictures, dimensions, and styling
    const orderItems: OrderItemSummary[] = cart.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const size = prod?.sizes.find(s => s.id === item.sizeId);
      const color = prod?.colours.find(c => c.name === item.colorName);
      const unitPrice = size ? size.price : (prod?.fromPrice || 1850);
      const dimensions = size ? `${size.width} × ${size.depth} cm` : '200 × 200 cm';
      const productImage = color?.image || prod?.cardImage || prod?.galleryImages?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85';

      return {
        productId: item.productId,
        productName: prod ? prod.name : 'Mosiac Architectural Textile',
        productSlug: prod ? prod.slug : undefined,
        productImage,
        sizeLabel: size ? size.label : 'M',
        dimensions,
        colorName: item.colorName || 'Natural Ivory',
        colorHex: color?.hex,
        unitPrice,
        quantity: item.quantity,
        total: unitPrice * item.quantity
      };
    });

    const trackingNum = 'MOS-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newOrder: Order = {
      id: newOrderId,
      receiptId,
      customerName: details.customerName || 'Studio Client',
      customerEmail: details.customerEmail || 'client@studio.com',
      total: finalTotal,
      subtotal: cartSubtotalUSD,
      discount: promoDiscountUSD,
      promoCode: appliedPromo?.code,
      currency: currency.code,
      status: 'Processing',
      date: new Date().toISOString().split('T')[0],
      itemsCount: cartCount,
      items: orderItems,
      paymentMethod: details.paymentMethod || 'Credit Card',
      cardLast4: details.cardLast4 || '2153',
      shippingMethod: 'White-Glove Inspected Freight',
      shippingFee: 0,
      carrier: 'Mosiac White-Glove Logistics (Direct Flight)',
      trackingNumber: trackingNum,
      estimatedDelivery: '3–5 Business Days',
      destinationCity: details.destinationCity || 'Private Residence',
      notes: 'Commissioned from Nordic master atelier. High-relief wool hand-sheared and inspected.'
    };

    setOrders(prev => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setAuditLogs(prev => [
      {
        id: 'log-' + Date.now(),
        action: `Order placed (${newOrderId})`,
        target: `${details.paymentMethod} · ${currency.symbol}${finalTotal.toLocaleString()}${appliedPromo ? ` (${appliedPromo.code} -${appliedPromo.discountFixedRWF ? '25,000 Rwf credit' : `${appliedPromo.discountPercent}%`})` : ''}`,
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

  const promoDiscountUSD = appliedPromo
    ? (appliedPromo.discountFixedUSD !== undefined
        ? Math.min(cartSubtotalUSD, appliedPromo.discountFixedUSD)
        : appliedPromo.discountPercent !== undefined
          ? (cartSubtotalUSD * appliedPromo.discountPercent) / 100
          : 0)
    : 0;
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
    const now = Date.now();
    const updateFn = (prev: Product[]) =>
      prev.map(p => {
        if (p.id !== id) return p;
        if (field === 'visible') {
          return { ...p, visible: !p.visible, updatedAt: now };
        }
        if (field === 'soldOut') {
          const isSoldOut = p.availability === 'Sold out';
          const nextAvail: 'In stock' | 'Sold out' = isSoldOut ? 'In stock' : 'Sold out';
          return { ...p, availability: nextAvail, fulfilment: nextAvail, updatedAt: now };
        }
        if (field === 'featured') {
          return { ...p, featured: !p.featured, updatedAt: now };
        }
        if (field === 'newArrival') {
          return { ...p, newArrival: !p.newArrival, updatedAt: now };
        }
        if (field === 'starred') {
          return { ...p, starred: !p.starred, updatedAt: now };
        }
        return p;
      });

    setStagedProducts(prev => {
      const next = updateFn(prev);
      setPersistentItem(STORAGE_KEYS.STAGED_PRODUCTS, next);
      return next;
    });

    setProducts(prev => {
      const next = updateFn(prev);
      setPersistentItem(STORAGE_KEYS.LIVE_PRODUCTS, next);
      return next;
    });

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

  // Save product draft / publish directly from the edit view
  const saveProductDraft = (updatedProduct: Product, publishLive: boolean = true) => {
    const cleanProduct = sanitizeProduct({
      ...updatedProduct,
      updatedAt: Date.now()
    });

    setStagedProducts(prev => {
      const exists = prev.some(p => p.id === cleanProduct.id);
      const next = exists
        ? prev.map(p => (p.id === cleanProduct.id ? cleanProduct : p))
        : [cleanProduct, ...prev];
      setPersistentItem(STORAGE_KEYS.STAGED_PRODUCTS, next);
      return next;
    });

    if (publishLive) {
      setProducts(prev => {
        const exists = prev.some(p => p.id === cleanProduct.id);
        const next = exists
          ? prev.map(p => (p.id === cleanProduct.id ? cleanProduct : p))
          : [cleanProduct, ...prev];
        setPersistentItem(STORAGE_KEYS.LIVE_PRODUCTS, next);
        return next;
      });
    }

    try {
      sessionStorage.removeItem(`mosiac_edit_draft_${cleanProduct.id}`);
      sessionStorage.removeItem('mosiac_editing_product_id');
    } catch {}

    setAuditLogs(prev => [
      {
        id: 'log-' + Date.now(),
        action: publishLive ? 'Published product specifications' : 'Updated product specifications',
        target: cleanProduct.name,
        user: 'Admin (Studio)',
        timestamp: 'Just now'
      },
      ...prev
    ]);

    setEditingProductId(null);
    showToast(publishLive ? `Published changes for ${cleanProduct.name}` : `Saved changes for ${cleanProduct.name}`);
  };

  // Delete product
  const deleteProduct = (id: string) => {
    const prod = stagedProducts.find(p => p.id === id) || products.find(p => p.id === id);
    setStagedProducts(prev => {
      const next = prev.filter(p => p.id !== id);
      setPersistentItem(STORAGE_KEYS.STAGED_PRODUCTS, next);
      return next;
    });
    setProducts(prev => {
      const next = prev.filter(p => p.id !== id);
      setPersistentItem(STORAGE_KEYS.LIVE_PRODUCTS, next);
      return next;
    });

    try {
      sessionStorage.removeItem(`mosiac_edit_draft_${id}`);
    } catch {}

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
      seoDescription: 'Handcrafted architectural sculpture from FORMA Studio.',
      updatedAt: Date.now()
    };

    setStagedProducts(prev => {
      const next = [newProduct, ...prev];
      setPersistentItem(STORAGE_KEYS.STAGED_PRODUCTS, next);
      return next;
    });
    setProducts(prev => {
      const next = [newProduct, ...prev];
      setPersistentItem(STORAGE_KEYS.LIVE_PRODUCTS, next);
      return next;
    });
    setEditingProductId(newId);
    try {
      sessionStorage.setItem('mosiac_editing_product_id', newId);
    } catch {}
    showToast('New draft product created');
    return newId;
  };

  // Publish staged changes live to the storefront
  const publishStagedChanges = () => {
    const now = Date.now();
    const updated = stagedProducts.map(p => ({ ...p, updatedAt: now }));
    setProducts(updated);
    setStagedProducts(updated);
    setPersistentItem(STORAGE_KEYS.LIVE_PRODUCTS, updated);
    setPersistentItem(STORAGE_KEYS.STAGED_PRODUCTS, updated);
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
        currentReceiptOrderId,
        navigateToReceipt,
        getOrderById,
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

        // Promo Popup & Leads
        promoPopupConfig,
        updatePromoPopupConfig,
        showPromoPopup,
        setShowPromoPopup,
        triggerPromoPreview,
        promoLeads,
        claimPromoDiscount,
        updateLeadStatus,
        deletePromoLead,

        // Policies
        policies,
        updatePolicySection,

        // Store Settings: Collections
        collections,
        addCollection,
        updateCollection,
        deleteCollection,

        // Store Settings: Shapes & Styles
        shapes,
        addShape,
        updateShape,
        deleteShape,
        styles,
        addStyle,
        updateStyle,
        deleteStyle,

        // Store Settings: Weight Formula
        weightFormula,
        updateWeightFormula,
        recalculateAllProductWeights,
        calculateWeight,

        // Store Settings: Sizing Guide Configuration
        sizingGuideConfig,
        updateSizingGuideConfig,

        // Team & Granular Permissions
        teamMembers,
        toggleTeamMemberActive,
        updateTeamMember,
        addTeamMember,
        deleteTeamMember,
        activeTeamMember,
        setActiveTeamMemberId: handleSetActiveTeamMemberId,
        currentPermissions,

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
