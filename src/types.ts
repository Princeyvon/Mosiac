export interface ProductSize {
  id: string;
  label: string;
  width: number;
  depth: number;
  price: number;
  weight: number; // auto-calculated: e.g. width * depth * 0.0085 kg
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  image?: string; // Main image linked to this variant (used in variants page & PDP lead)
  galleryImages?: string[]; // Additional gallery shots specific to this color variant
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  collection: string;
  shape: string;
  availability: 'Made to order' | 'In stock' | 'Sold out';
  leadTime: string;
  material: string;
  cardSummary: string;
  fullDescription: string;
  careInstructions?: string;
  tags: string[];
  colours: ProductColor[];
  cardImage: string;
  hoverImage: string;
  galleryImages: string[];
  sizes: ProductSize[];
  fromPrice: number; // Base USD price
  costPrice: number;
  featuredOrder: number;
  sku: string;
  stockOnHand: number;
  lowStockAlertAt: number;
  fulfilment: 'Made to order' | 'In stock' | 'Sold out';
  featured: boolean;
  newArrival: boolean;
  visible: boolean;
  starred: boolean;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: number;
}

export interface CartItem {
  productId: string;
  sizeId: string;
  colorName: string;
  quantity: number;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // relative to USD (USD = 1.0)
  popular?: boolean;
}

export interface OrderItemSummary {
  productId: string;
  productName: string;
  productSlug?: string;
  productImage?: string;
  sizeLabel: string;
  dimensions?: string;
  colorName: string;
  colorHex?: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  status: 'Fulfilled' | 'Processing' | 'Pending' | 'Dispatched';
  date: string;
  itemsCount: number;
  receiptId?: string;
  items?: OrderItemSummary[];
  paymentMethod?: string;
  cardLast4?: string;
  subtotal?: number;
  discount?: number;
  promoCode?: string;
  shippingFee?: number;
  shippingMethod?: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  destinationCity?: string;
  destinationCountry?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  target: string;
  user: string;
  timestamp: string;
}

export interface StorefrontFilter {
  id: string;
  label: string;
  slug: string;
}

export interface AppliedPromo {
  code: string;
  discountPercent?: number;
  discountFixedUSD?: number;
  discountFixedRWF?: number;
  description: string;
}

export interface PromoPopupConfig {
  enabled: boolean;
  delaySeconds: number; // default 30
  badgeText: string; // e.g. "Welcome Gift"
  eyebrow: string; // e.g. "EXCLUSIVE FIRST PURCHASE OFFER"
  headline: string; // e.g. "Enjoy 25,000 Rwf Free Credit on Your First Order"
  subtext: string; // e.g. "Complimentary 25,000 Rwf studio credit applied at checkout."
  buttonText: string; // e.g. "Claim 25,000 Rwf Credit"
  discountCode: string; // e.g. "RWF25K"
  imageUrl: string;
  filterTag?: string;
  discountAmountRWF?: number;
  creditType?: 'fixed_rwf' | 'percentage';
}

export interface PromoLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  code: string;
  creditClaimed: string;
  claimedAt: string;
  status: 'Claimed' | 'Redeemed' | 'Contacted';
}

export interface PolicySection {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
}

export interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  featured?: boolean;
}

export interface ShapeItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  aspectHint?: string;
  placementGuidance?: string;
}

export interface StyleItem {
  id: string;
  name: string;
  slug: string;
  pileHeightMm?: number;
  densityMultiplier: number; // e.g. 1.0 standard, 1.25 plush, 0.85 low loop
  techniqueDescription: string;
}

export interface WeightFormulaConfig {
  unit: 'kg' | 'lbs';
  densityKgPerM2: number; // default ~3.4 kg/m² for tufted New Zealand wool
  basePackagingKg: number; // default packaging weight e.g. 0.8 kg
  materialMultipliers: Record<string, number>; // e.g. 'Pure Wool': 1.0, 'Wool & Silk': 1.15
  styleMultipliers: Record<string, number>; // e.g. 'High-Relief': 1.25
}

export interface SizingGuideSizeRow {
  id: string;
  size: string; // 'S', 'M', 'L', 'XL', etc.
  name: string; // 'Small / Accent'
  widthCm: number;
  depthCm: number;
  idealFor: string;
}

export interface SizingGuideConfig {
  eyebrow: string;
  headline: string;
  description: string;
  livingRoomTip: string;
  bedroomTip: string;
  diningRoomTip: string;
  shapeSpecificTips: Record<string, string>; // keyed by shape name (e.g. 'Organic', 'Circular', 'Radial', etc.)
  sizeRows: SizingGuideSizeRow[];
  customInquiryText: string;
  customInquiryUrl: string;
}

export interface TeamPermissions {
  canViewDashboard: boolean;
  canEditProducts: boolean;
  canCreateProducts: boolean;
  canPublishLive: boolean;
  canDeleteProducts: boolean;
  canManageOrders: boolean;
  canManageClientele: boolean;
  canManageDiscounts: boolean;
  canManageStoreSettings: boolean; // collections, shapes, styles, weight formula, sizing guide
  canManagePolicies: boolean;
  canManageTeam: boolean;
  canViewFinancials: boolean; // cost prices, margins, total revenue
}

export interface TeamMember {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'Studio Director' | 'Senior Curator' | 'Atelier Manager' | 'Logistics Lead' | 'Custom Role';
  active: boolean;
  pin: string;
  password?: string;
  avatar?: string;
  lastActive: string;
  permissions: TeamPermissions;
}

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  role: string;
  pin: string;
  avatar: string;
  bio: string;
  notificationsEnabled: boolean;
}

