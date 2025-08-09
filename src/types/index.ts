export interface ProductData {
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  currency: string;
  images: string[];
  videos?: string[];
  gifs?: string[];
  features: string[];
  specifications: Record<string, string>;
  brand: string;
  category: string;
  rating: number;
  reviewCount: number;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  seller: {
    name: string;
    rating: number;
    verified: boolean;
  };
  shipping: {
    free: boolean;
    cost?: string;
    estimatedDays: string;
  };
  variants?: Array<{
    name: string;
    options: string[];
    prices?: Record<string, string>;
  }>;
}

export interface ImageAnalysis {
  labels: string[];
  safeSearch: {
    adult: string;
    spoof: string;
    medical: string;
    violence: string;
    racy: string;
  };
  textAnnotations: string[];
  dominantColors: string[];
  isProductImage: boolean;
  confidence: number;
}

export interface ProcessedMedia {
  original: string;
  processed: string;
  cloudinaryUrl: string;
  backgroundRemoved?: string;
  optimized: string;
  analysis: ImageAnalysis;
}

export interface TargetAudience {
  region: 'mena' | 'america' | 'europe';
  preferences: {
    visualStyle: 'rich' | 'clean' | 'minimal';
    layout: 'aggressive' | 'trustworthy' | 'elegant';
    colors: string[];
    typography: string;
  };
}

export interface LandingPageContent {
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
    backgroundImage: string;
  };
  product: {
    title: string;
    description: string;
    features: string[];
    specifications: Record<string, string>;
    media: ProcessedMedia[];
  };
  pricing: {
    current: string;
    original?: string;
    discount?: string;
    currency: string;
    urgency?: string;
  };
  reviews: Array<{
    name: string;
    rating: number;
    comment: string;
    verified: boolean;
    date: string;
    avatar?: string;
  }>;
  trustBadges: string[];
  upsells: Array<{
    title: string;
    description: string;
    price: string;
    image: string;
  }>;
  contact: {
    whatsapp: string;
    messenger: string;
    chatbot: boolean;
    phone?: string;
    email?: string;
  };
  tracking: {
    facebookPixel?: string;
    googleAnalytics?: string;
    customEvents: string[];
  };
}

export interface GenerationOptions {
  targetAudience: 'mena' | 'america' | 'europe';
  language: 'en' | 'ar' | 'es' | 'fr' | 'de';
  includeUpsells: boolean;
  includeReviews: boolean;
  includeTrustBadges: boolean;
  enableTracking: boolean;
  customDomain?: string;
  shopifyIntegration: boolean;
  woocommerceIntegration: boolean;
}

export interface GenerationResult {
  success: boolean;
  productData: ProductData;
  landingPageContent: LandingPageContent;
  html: string;
  css: string;
  javascript: string;
  generationTime: number;
  mediaProcessed: number;
  validationScore: number;
  seoData: {
    title: string;
    description: string;
    keywords: string[];
    structuredData: Record<string, any>;
  };
  integrations: {
    shopify?: { productId: string; pageId: string };
    woocommerce?: { productId: string; pageId: string };
    domain?: { url: string; status: string };
  };
  errors?: string[];
  warnings?: string[];
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    tokens?: number;
    requests?: number;
    cost?: number;
  };
}