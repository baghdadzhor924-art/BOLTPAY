import { ProductData, LandingPageContent, GenerationOptions, ProcessedMedia, APIResponse } from '../types';

export class AIContentService {
  private openaiApiKey: string;

  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  async generateContent(
    product: ProductData,
    options: GenerationOptions,
    media: ProcessedMedia[]
  ): Promise<APIResponse<LandingPageContent>> {
    try {
      console.log('🤖 Generating AI content...');

      if (this.openaiApiKey && this.openaiApiKey !== 'your_openai_api_key_here') {
        return await this.generateWithOpenAI(product, options, media);
      }

      // Fallback to mock content
      return {
        success: true,
        data: this.generateMockContent(product, options, media)
      };

    } catch (error) {
      console.warn('⚠️ AI content generation failed, using mock content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: this.generateMockContent(product, options, media)
      };
    }
  }

  private async generateWithOpenAI(
    product: ProductData,
    options: GenerationOptions,
    media: ProcessedMedia[]
  ): Promise<APIResponse<LandingPageContent>> {
    try {
      const prompt = this.buildAdvancedPrompt(product, options, media);
      
      console.log('📤 Sending request to OpenAI GPT-4...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: this.getAdvancedSystemPrompt(options)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 3000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('✅ OpenAI response received');
      
      const generatedText = data.choices[0].message.content;
      
      // Parse the AI response into structured content
      const content = this.parseAdvancedAIResponse(generatedText, product, options, media);
      
      return {
        success: true,
        data: content,
        usage: {
          tokens: data.usage?.total_tokens || 0,
          cost: this.calculateCost(data.usage?.total_tokens || 0)
        }
      };

    } catch (error) {
      console.error('❌ OpenAI API error:', error);
      throw new Error(`OpenAI content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildAdvancedPrompt(product: ProductData, options: GenerationOptions, media: ProcessedMedia[]): string {
    const audienceContext = this.getAudienceContext(options.targetAudience);
    const mediaContext = media.map(m => `Image analysis: ${m.analysis.labels.join(', ')}`).join('\n');
    
    return `Create a comprehensive, high-converting landing page content for this product:

PRODUCT DETAILS:
- Title: ${product.title}
- Description: ${product.description}
- Price: ${product.price}
- Original Price: ${product.originalPrice || 'N/A'}
- Brand: ${product.brand}
- Category: ${product.category}
- Rating: ${product.rating}/5 (${product.reviewCount} reviews)
- Features: ${product.features.join(', ')}
- Availability: ${product.availability}
- Shipping: ${product.shipping.free ? 'Free shipping' : product.shipping.cost || 'Standard shipping'}

MEDIA ANALYSIS:
${mediaContext}

TARGET AUDIENCE: ${audienceContext}
LANGUAGE: ${options.language}
INCLUDE REVIEWS: ${options.includeReviews}
INCLUDE SOCIAL PROOF: ${options.includeSocialProof}
INCLUDE UPSELLS: ${options.includeUpsells}

REQUIREMENTS:
Generate a complete landing page content structure with the following sections. Return ONLY valid JSON format:

{
  "hero": {
    "headline": "Compelling, benefit-focused headline (max 60 chars)",
    "subheadline": "Supporting detail that builds desire (max 120 chars)",
    "cta": "Action-oriented button text (max 20 chars)"
  },
  "product": {
    "description": "Persuasive, benefit-focused description (200-300 words)",
    "features": ["5-7 key features with benefits"],
    "specifications": {
      "key1": "value1",
      "key2": "value2"
    }
  },
  "pricing": {
    "urgency": "Scarcity/urgency message",
    "guarantee": "Money-back guarantee text"
  },
  "reviews": [
    {
      "name": "Realistic customer name",
      "rating": 4-5,
      "comment": "Authentic review (50-100 words)",
      "verified": true,
      "location": "City, Country"
    }
  ],
  "socialProof": {
    "totalCustomers": 10000,
    "averageRating": 4.8,
    "countriesServed": 50,
    "monthlyUsers": 25000
  },
  "upsells": [
    {
      "title": "Complementary product title",
      "description": "Brief description",
      "price": "$XX.XX"
    }
  ],
  "trustElements": [
    "Trust badge 1",
    "Trust badge 2",
    "Trust badge 3"
  ]
}

Make the content highly persuasive, culturally appropriate for ${options.targetAudience}, and optimized for conversions.`;
  }

  private getAdvancedSystemPrompt(options: GenerationOptions): string {
    const audienceStyles = {
      mena: 'Use rich, emotional language with emphasis on value and family benefits. Include cultural sensitivity for Middle Eastern and North African markets.',
      america: 'Focus on convenience, quality, and social proof. Use direct, benefit-focused language with trust indicators.',
      europe: 'Emphasize quality, sustainability, and craftsmanship. Use sophisticated, informative language with attention to detail.'
    };

    return `You are a world-class conversion copywriter and marketing expert specializing in high-converting landing pages for ${options.targetAudience} markets.

EXPERTISE:
- 15+ years in direct response marketing
- Specialized in e-commerce conversion optimization
- Expert in psychological triggers and persuasion techniques
- Deep understanding of cultural nuances across global markets

STYLE GUIDELINES FOR ${options.targetAudience.toUpperCase()}:
${audienceStyles[options.targetAudience]}

CONVERSION PRINCIPLES:
1. Lead with benefits, support with features
2. Use emotional triggers appropriate for the target culture
3. Build trust through social proof and guarantees
4. Create urgency without being manipulative
5. Address objections proactively
6. Use power words and action-oriented language
7. Ensure cultural sensitivity and appropriateness
8. Write in ${options.language === 'ar' ? 'Arabic' : 'English'} language
9. Optimize for mobile-first reading patterns
10. Include specific, measurable benefits

PSYCHOLOGICAL TRIGGERS TO USE:
- Scarcity and urgency
- Social proof and authority
- Reciprocity and value
- Fear of missing out (FOMO)
- Trust and credibility indicators
- Emotional storytelling

Return ONLY valid JSON format. No additional text or explanations.`;
  }

  private getAudienceContext(audience: string): string {
    const contexts = {
      mena: 'Middle East & North Africa - Focus on family values, quality, and value for money. Emphasize trust and reliability.',
      america: 'American market - Emphasize convenience, innovation, and social proof. Focus on time-saving and lifestyle benefits.',
      europe: 'European market - Highlight quality, sustainability, and craftsmanship. Focus on long-term value and environmental consciousness.'
    };

    return contexts[audience as keyof typeof contexts] || contexts.america;
  }

  private parseAdvancedAIResponse(
    text: string,
    product: ProductData,
    options: GenerationOptions,
    media: ProcessedMedia[]
  ): LandingPageContent {
    try {
      console.log('📝 Parsing OpenAI response...');
      
      // Clean the response text
      let cleanedText = text.trim();
      
      // Remove any markdown code blocks
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Try to find JSON content
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      const parsed = JSON.parse(cleanedText);
      console.log('✅ Successfully parsed AI response');
      
      return this.structureAdvancedContent(parsed, product, options, media);
    } catch {
      console.warn('⚠️ Failed to parse AI response as JSON, using fallback extraction:', error);
      return this.extractAdvancedContentFromText(text, product, options, media);
    }
  }

  private structureAdvancedContent(
    parsed: any,
    product: ProductData,
    options: GenerationOptions,
    media: ProcessedMedia[]
  ): LandingPageContent {
    console.log('🏗️ Structuring advanced content...');
    
    return {
      hero: {
        headline: parsed.hero?.headline || parsed.headline || `Discover ${product.title}`,
        subheadline: parsed.hero?.subheadline || parsed.subheadline || 'Premium quality product with exceptional value',
        cta: parsed.hero?.cta || parsed.cta || 'Order Now',
        backgroundImage: media[0]?.optimized || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1200'
      },
      product: {
        title: product.title,
        description: parsed.product?.description || parsed.description || product.description,
        features: parsed.product?.features || parsed.features || product.features,
        specifications: {
          ...product.specifications,
          ...(parsed.product?.specifications || {})
        },
        media
      },
      pricing: {
        current: product.price,
        original: product.originalPrice,
        discount: product.originalPrice ? this.calculateDiscount(product.price, product.originalPrice) : undefined,
        currency: product.currency,
        urgency: parsed.pricing?.urgency || 'Limited time offer!',
        guarantee: parsed.pricing?.guarantee || '30-day money-back guarantee'
      },
      reviews: this.generateAdvancedReviews(parsed.reviews || [], options),
      trustBadges: this.generateTrustBadges(options.targetAudience),
      upsells: options.includeUpsells ? (parsed.upsells || this.generateUpsells(product)) : [],
      contact: this.generateContactInfo(options),
      tracking: {
        facebookPixel: import.meta.env.VITE_FACEBOOK_PIXEL_ID,
        googleAnalytics: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
        customEvents: ['page_view', 'add_to_cart', 'purchase', 'scroll_depth', 'cta_click']
      },
      socialProof: parsed.socialProof || {
        totalCustomers: 10000 + Math.floor(Math.random() * 50000),
        averageRating: 4.5 + Math.random() * 0.5,
        countriesServed: 25 + Math.floor(Math.random() * 75),
        monthlyUsers: 5000 + Math.floor(Math.random() * 20000)
      }
    };
  }

  private extractAdvancedContentFromText(
    text: string,
    product: ProductData,
    options: GenerationOptions,
    media: ProcessedMedia[]
  ): LandingPageContent {
    console.log('📄 Extracting content from text...');
    
    const lines = text.split('\n').filter(line => line.trim());
    
    // Try to extract structured information from the text
    const headline = this.extractSection(text, ['headline', 'title']) || `Discover ${product.title}`;
    const subheadline = this.extractSection(text, ['subheadline', 'subtitle']) || 'Premium quality product with exceptional value';
    const description = this.extractSection(text, ['description', 'about']) || lines.slice(2, 5).join(' ') || product.description;
    
    return {
      hero: {
        headline,
        subheadline,
        cta: 'Order Now',
        backgroundImage: media[0]?.optimized || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1200'
      },
      product: {
        title: product.title,
        description,
        features: product.features,
        specifications: product.specifications,
        media
      },
      pricing: {
        current: product.price,
        original: product.originalPrice,
        currency: product.currency
      },
      reviews: this.generateAdvancedReviews([], options),
      trustBadges: this.generateTrustBadges(options.targetAudience),
      upsells: options.includeUpsells ? this.generateUpsells(product) : [],
      contact: this.generateContactInfo(options),
      tracking: {
        customEvents: ['page_view', 'add_to_cart', 'purchase', 'scroll_depth', 'cta_click']
      },
      socialProof: {
        totalCustomers: 10000 + Math.floor(Math.random() * 50000),
        averageRating: 4.5 + Math.random() * 0.5,
        countriesServed: 25 + Math.floor(Math.random() * 75),
        monthlyUsers: 5000 + Math.floor(Math.random() * 20000)
      }
    };
  }

  private extractSection(text: string, keywords: string[]): string | null {
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[:\\s]*([^\\n]+)`, 'i');
      const match = text.match(regex);
      if (match && match[1]) {
        return match[1].trim().replace(/['"]/g, '');
      }
    }
    return null;
  }

  private calculateCost(tokens: number): number {
    // GPT-4 pricing: $0.03 per 1K prompt tokens, $0.06 per 1K completion tokens
    // Simplified calculation assuming 50/50 split
    return (tokens / 1000) * 0.045;
  }

  private generateMockContent(
    product: ProductData,
    options: GenerationOptions,
    media: ProcessedMedia[]
  ): LandingPageContent {
    console.log('🎭 Generating mock content as fallback...');
    
    const audienceContent = this.getAudienceSpecificContent(options.targetAudience, options.language);
    
    return {
      hero: {
        headline: audienceContent.headline.replace('{product}', product.title),
        subheadline: audienceContent.subheadline,
        cta: audienceContent.cta,
        backgroundImage: media[0]?.optimized || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1200'
      },
      product: {
        title: product.title,
        description: audienceContent.description.replace('{product}', product.title),
        features: product.features,
        specifications: product.specifications,
        media
      },
      pricing: {
        current: product.price,
        original: product.originalPrice,
        discount: product.originalPrice ? this.calculateDiscount(product.price, product.originalPrice) : undefined,
        currency: product.currency,
        urgency: audienceContent.urgency
      },
      reviews: this.generateAdvancedReviews([], options),
      trustBadges: this.generateTrustBadges(options.targetAudience),
      upsells: options.includeUpsells ? this.generateUpsells(product) : [],
      contact: this.generateContactInfo(options),
      tracking: {
        facebookPixel: import.meta.env.VITE_FACEBOOK_PIXEL_ID,
        googleAnalytics: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
        customEvents: ['page_view', 'add_to_cart', 'purchase']
      },
      socialProof: {
        totalCustomers: 10000 + Math.floor(Math.random() * 50000),
        averageRating: 4.5 + Math.random() * 0.5,
        countriesServed: 25 + Math.floor(Math.random() * 75),
        monthlyUsers: 5000 + Math.floor(Math.random() * 20000)
      }
    };
  }

  private getAudienceSpecificContent(audience: string, language: string) {
    const content = {
      mena: {
        en: {
          headline: 'Transform Your Life with {product} - Premium Quality Guaranteed',
          subheadline: 'Join thousands of satisfied customers who chose quality and value',
          cta: 'Order Now - Free Shipping',
          description: 'Experience the perfect blend of innovation and quality with {product}. Designed for families who value excellence and reliability.',
          urgency: 'Limited Stock - Order Today!'
        },
        ar: {
          headline: 'غيّر حياتك مع {product} - جودة مضمونة',
          subheadline: 'انضم لآلاف العملاء الراضين الذين اختاروا الجودة والقيمة',
          cta: 'اطلب الآن - شحن مجاني',
          description: 'اكتشف المزيج المثالي من الابتكار والجودة مع {product}. مصمم للعائلات التي تقدر التميز والموثوقية.',
          urgency: 'كمية محدودة - اطلب اليوم!'
        }
      },
      america: {
        en: {
          headline: 'Get {product} - The Smart Choice for Modern Living',
          subheadline: 'Trusted by over 10,000 customers nationwide with 5-star reviews',
          cta: 'Buy Now - Fast Delivery',
          description: '{product} combines cutting-edge technology with user-friendly design to make your life easier and more efficient.',
          urgency: 'Flash Sale - 48 Hours Only!'
        }
      },
      europe: {
        en: {
          headline: 'Discover {product} - Crafted for Excellence',
          subheadline: 'Sustainable quality meets innovative design for the conscious consumer',
          cta: 'Order Now - Eco-Friendly Packaging',
          description: '{product} represents the pinnacle of European craftsmanship and sustainable innovation, designed to last for years.',
          urgency: 'Limited Edition - While Supplies Last'
        }
      }
    };

    const audienceContent = content[audience as keyof typeof content];
    const langContent = audienceContent?.[language as keyof typeof audienceContent] || audienceContent?.en;
    
    return langContent || content.america.en;
  }

  private generateAdvancedReviews(aiReviews: any[], options: GenerationOptions) {
    console.log('⭐ Generating advanced reviews...');
    
    if (aiReviews && aiReviews.length > 0) {
      return aiReviews.map((review: any) => ({
        name: review.name || 'Anonymous Customer',
        rating: review.rating || 5,
        comment: review.comment || review.text || 'Great product!',
        verified: true,
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        location: review.location || this.getRandomLocation(options.targetAudience),
        avatar: this.generateAvatarUrl()
      }));
    }

    // Generate mock reviews based on audience
    const reviewTemplates = this.getReviewTemplates(options.targetAudience, options.language);
    
    return reviewTemplates.map(template => ({
      ...template,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      location: this.getRandomLocation(options.targetAudience),
      avatar: this.generateAvatarUrl()
    }));
  }

  private getRandomLocation(audience: string): string {
    const locations = {
      mena: ['Dubai, UAE', 'Riyadh, Saudi Arabia', 'Cairo, Egypt', 'Doha, Qatar', 'Kuwait City, Kuwait'],
      america: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Miami, FL'],
      europe: ['London, UK', 'Paris, France', 'Berlin, Germany', 'Rome, Italy', 'Madrid, Spain']
    };
    
    const audienceLocations = locations[audience as keyof typeof locations] || locations.america;
    return audienceLocations[Math.floor(Math.random() * audienceLocations.length)];
  }

  private generateAvatarUrl(): string {
    const avatarIds = [
      '774909', '697509', '1239291', '1222271', '1181686', '1043471',
      '415829', '1130626', '1484794', '1520760', '1674752', '1858175'
    ];
    const randomId = avatarIds[Math.floor(Math.random() * avatarIds.length)];
    return `https://images.pexels.com/photos/${randomId}/pexels-photo-${randomId}.jpeg?auto=compress&cs=tinysrgb&w=100`;
  }

  private getReviewTemplates(audience: string, language: string) {
        ar: [
          { name: 'أحمد حسن', rating: 5, comment: 'جودة ممتازة وتوصيل سريع. أنصح به بشدة لجميع العائلات!', verified: true },
          { name: 'فاطمة الزهراء', rating: 5, comment: 'منتج رائع! يستحق كل قرش. عائلتي كلها تحبه.', verified: true },
          { name: 'عمر خليل', rating: 4, comment: 'قيمة جيدة مقابل المال. خدمة العملاء كانت مفيدة جداً.', verified: true }
        ]
      },
        ar: [
          { name: 'أحمد حسن', rating: 5, comment: 'جودة ممتازة وتوصيل سريع. أنصح به بشدة لجميع العائلات!', verified: true },
          { name: 'فاطمة الزهراء', rating: 5, comment: 'منتج رائع! يستحق كل قرش. عائلتي كلها تحبه.', verified: true },
          { name: 'عمر خليل', rating: 4, comment: 'قيمة جيدة مقابل المال. خدمة العملاء كانت مفيدة جداً.', verified: true }
        ]
      },
      america: {
        en: [
          { name: 'Sarah Johnson', rating: 5, comment: 'Game changer! This product exceeded all my expectations. Fast shipping too!', verified: true },
          { name: 'Mike Chen', rating: 5, comment: 'Outstanding quality and customer service. Will definitely buy again.', verified: true },
          { name: 'Emily Davis', rating: 4, comment: 'Great product, easy to use. Arrived exactly as described.', verified: true }
        ]
      },
      europe: {
        en: [
          { name: 'Hans Mueller', rating: 5, comment: 'Exceptional craftsmanship and sustainable packaging. Truly impressed!', verified: true },
          { name: 'Sophie Dubois', rating: 5, comment: 'Beautiful design and excellent functionality. Worth the investment.', verified: true },
          { name: 'Marco Rossi', rating: 4, comment: 'High quality product with attention to detail. Recommended.', verified: true }
        ]
      }
    };

    // Use enhanced templates if available, otherwise fall back to basic templates
    const templates = enhancedTemplates;

    const audienceTemplates = templates[audience as keyof typeof templates];
    const langTemplates = audienceTemplates?.[language as keyof typeof audienceTemplates] || audienceTemplates?.en;
    
    return langTemplates || templates.america.en;
  }

  private generateTrustBadges(audience: string): string[] {
    // Generate more specific trust badges based on audience
    const audienceSpecificBadges = {
      mena: ['Halal Certified', 'Trusted by 100K+ Families', 'Fast Middle East Delivery', 'Arabic Support Available'],
      america: ['Made in USA', 'FDA Approved', 'BBB Accredited', '30-Day Money Back'],
      europe: ['CE Certified', 'GDPR Compliant', 'Eco-Friendly', 'European Quality Standards']
    };
    
    const badges = {
      mena: [
        'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=200',
        'https://images.pexels.com/photos/6801649/pexels-photo-6801649.jpeg?auto=compress&cs=tinysrgb&w=200'
      ],
      america: [
        'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=200',
        'https://images.pexels.com/photos/6801649/pexels-photo-6801649.jpeg?auto=compress&cs=tinysrgb&w=200'
      ],
      europe: [
        'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=200',
        'https://images.pexels.com/photos/6801649/pexels-photo-6801649.jpeg?auto=compress&cs=tinysrgb&w=200'
      ]
    };

    return badges[audience as keyof typeof badges] || badges.america;
  }

  private generateUpsells(product: ProductData) {
    // Generate more relevant upsells based on product category
    const categoryUpsells = this.getCategorySpecificUpsells(product.category, product.title);
    if (categoryUpsells.length > 0) return categoryUpsells;
    
    return [
      {
        title: `${product.title} Accessories Kit`,
        description: 'Complete your purchase with essential accessories',
        price: '$29.99',
        image: 'https://images.pexels.com/photos/279906/pexels-photo-279906.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        title: 'Extended Warranty',
        description: '2-year extended warranty for peace of mind',
        price: '$19.99',
        image: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ];
  }

  private getCategorySpecificUpsells(category: string, productTitle: string) {
    const upsellTemplates: Record<string, any[]> = {
      electronics: [
        { title: 'Premium Protection Case', description: 'Keep your device safe with our premium case', price: '$24.99' },
        { title: 'Extended Warranty', description: '3-year comprehensive coverage', price: '$39.99' }
      ],
      clothing: [
        { title: 'Matching Accessories', description: 'Complete your look with matching accessories', price: '$19.99' },
        { title: 'Care Kit', description: 'Professional cleaning and care products', price: '$14.99' }
      ],
      home: [
        { title: 'Installation Service', description: 'Professional installation by certified technicians', price: '$49.99' },
        { title: 'Maintenance Kit', description: 'Everything you need for ongoing care', price: '$29.99' }
      ]
    };

    const categoryLower = category.toLowerCase();
    for (const [cat, upsells] of Object.entries(upsellTemplates)) {
      if (categoryLower.includes(cat)) {
        return upsells.map(upsell => ({
          ...upsell,
          image: 'https://images.pexels.com/photos/279906/pexels-photo-279906.jpeg?auto=compress&cs=tinysrgb&w=400'
        }));
      }
    }

    return [];
  }

  private generateContactInfo(options: GenerationOptions) {
    return {
      whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '+1234567890',
      messenger: import.meta.env.VITE_MESSENGER_URL || 'https://m.me/yourpage',
      chatbot: true,
      phone: '+1-800-PRODUCT',
      email: 'support@landingpage.com'
    };
  }

  private calculateDiscount(current: string, original: string): string {
    const currentPrice = parseFloat(current.replace(/[^0-9.]/g, ''));
    const originalPrice = parseFloat(original.replace(/[^0-9.]/g, ''));
  }
}