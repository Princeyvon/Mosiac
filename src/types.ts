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

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  status: 'Fulfilled' | 'Processing' | 'Pending' | 'Dispatched';
  date: string;
  itemsCount: number;
}

export interface AuditLog {
  id: string;
  action: string;
  target: string;
  user: string;
  timestamp: string;
}
