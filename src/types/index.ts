export interface ScrapedProduct {
  title: string;
  description: string;
  price: string;
  images: string[];
  features: string[];
  url: string;
}

export interface AIGeneratedContent {
  headline: string;
  subheadline: string;
  description: string;
  features: string[];
  benefits: string[];
  callToAction: string;
  testimonials: Testimonial[];
  socialProof: SocialProof;
  seoData: SEOData;
}

export interface Testimonial {
  name: string;
  rating: number;
  comment: string;
  verified: boolean;
}

export interface SocialProof {
  totalCustomers: number;
  averageRating: number;
  countriesServed: number;
  monthlyUsers: number;
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

export interface GenerationOptions {
  template: 'modern' | 'minimal' | 'elegant' | 'bold';
  language: 'en' | 'ar';
  includeReviews: boolean;
  includeSocialProof: boolean;
}

export interface GenerationResult {
  html: string;
  generationTime: number;
  isRealData: boolean;
  productTitle: string;
}