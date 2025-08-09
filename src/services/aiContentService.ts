import { ProductData, LandingPageContent, GenerationOptions, ProcessedMedia, APIResponse } from '../types';

export class AIContentService {
  private groqApiKey: string;

  constructor() {
    this.groqApiKey = import.meta.env.VITE_GROQ_API_KEY || '';
  }

  async generateContent(
    product: ProductData,
    options: GenerationOptions,
    media: ProcessedMedia[]
  ): Promise<APIResponse<LandingPageContent>> {
    try {
      console.log('🤖 Generating AI content...');

      if (this.groqApiKey && this.groqApiKey !== 'your_actual_groq_key_here') {
        return await this.generateWithGroq(product, options, media);
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

  private async generateWithGroq(
    product: ProductData,
    options: GenerationOptions,
    media: ProcessedMedia[]
  ): Promise<APIResponse<LandingPageContent>> {
    try {
      const prompt = this.buildPrompt(product, options);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.groqApiKey}`
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(options)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0].message.content;
      
      // Parse the AI response into structured content
      const content = this.parseAIResponse(generatedText, product, options, media);
      
      return {
        success: true,
        data: content,
        usage: {
          tokens: data.usage?.total_tokens || 0
        }
      };

    } catch (error) {
      throw new Error(`Groq content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildPrompt(product: ProductData, options: GenerationOptions): string {
    const audienceContext = this.getAudienceContext(options.targetAudience);
    
    return `Create compelling landing page content for this product:

PRODUCT DETAILS:
- Title: ${product.title}
- Description: ${product.description}
- Price: ${product.price}
- Brand: ${product.brand}
- Category: ${product.category}
- Rating: ${product.rating}/5 (${product.reviewCount} reviews)
- Features: ${product.features.join(', ')}

TARGET AUDIENCE: ${audienceContext}
LANGUAGE: ${options.language}

Generate the following sections:
1. Hero headline (compelling, benefit-focused)
2. Hero subheadline (supporting detail)
3. Call-to-action text
4. Product description (persuasive, benefit-focused)
5. Key features list (5-7 items)
6. Customer testimonials (3-5 realistic testimonials)
7. Trust elements
8. Urgency/scarcity messaging

Format as JSON with clear sections.`;
  }

  private getSystemPrompt(options: GenerationOptions): string {
    const audienceStyles = {
      mena: 'Use rich, emotional language with emphasis on value and family benefits. Include cultural sensitivity for Middle Eastern and North African markets.',
      america: 'Focus on convenience, quality, and social proof. Use direct, benefit-focused language with trust indicators.',
      europe: 'Emphasize quality, sustainability, and craftsmanship. Use sophisticated, informative language with attention to detail.'
    };

    return `You are an expert copywriter specializing in high-converting landing pages for ${options.targetAudience} markets. 

Style Guidelines:
${audienceStyles[options.targetAudience]}

Always:
- Focus on benefits over features
- Use emotional triggers appropriate for the target audience
- Include social proof and trust elements
- Create urgency without being pushy
- Write in ${options.language === 'ar' ? 'Arabic' : 'English'} language
- Ensure cultural appropriateness for the target region`;
  }

  private getAudienceContext(audience: string): string {
    const contexts = {
      mena: 'Middle East & North Africa - Focus on family values, quality, and value for money. Emphasize trust and reliability.',
      america: 'American market - Emphasize convenience, innovation, and social proof. Focus on time-saving and lifestyle benefits.',
      europe: 'European market - Highlight quality, sustainability, and craftsmanship. Focus on long-term value and environmental consciousness.'
    };

    return contexts[audience as keyof typeof contexts] || contexts.america;
  }

  private parseAIResponse(
    text: string,
    product: ProductData,
    options: GenerationOptions,
    media: ProcessedMedia[]
  ): LandingPageContent {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(text);
      return this.structureContent(parsed, product, options, media);
    } catch {
      // If JSON parsing fails, extract content manually
      return this.extractContentFromText(text, product, options, media);
    }
  }

  private structureContent(
    parsed: any,
    product: ProductData,
    options: GenerationOptions,
    media: ProcessedMedia[]
  ): LandingPageContent {
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
        specifications: product.specifications,
        media
      },
      pricing: {
        current: product.price,
        original: product.originalPrice,
        discount: product.originalPrice ? this.calculateDiscount(product.price, product.originalPrice) : undefined,
        currency: product.currency,
        urgency: parsed.pricing?.urgency || 'Limited time offer!'
      },
      reviews: this.generateReviews(parsed.testimonials || parsed.reviews, options),
      trustBadges: this.generateTrustBadges(options.targetAudience),
      upsells: options.includeUpsells ? this.generateUpsells(product) : [],
      contact: this.generateContactInfo(options),
      tracking: {
        facebookPixel: import.meta.env.VITE_FACEBOOK_PIXEL_ID,
        googleAnalytics: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
        customEvents: ['page_view', 'add_to_cart', 'purchase']
      }
    };
  }

  private extractContentFromText(
    text: string,
    product: ProductData,
    options: GenerationOptions,
    media: ProcessedMedia[]
  ): LandingPageContent {
    const lines = text.split('\n').filter(line => line.trim());
    
    return {
      hero: {
        headline: lines[0] || `Discover ${product.title}`,
        subheadline: lines[1] || 'Premium quality product with exceptional value',
        cta: 'Order Now',
        backgroundImage: media[0]?.optimized || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1200'
      },
      product: {
        title: product.title,
        description: lines.slice(2, 5).join(' ') || product.description,
        features: product.features,
        specifications: product.specifications,
        media
      },
      pricing: {
        current: product.price,
        original: product.originalPrice,
        currency: product.currency
      },
      reviews: this.generateReviews([], options),
      trustBadges: this.generateTrustBadges(options.targetAudience),
      upsells: options.includeUpsells ? this.generateUpsells(product) : [],
      contact: this.generateContactInfo(options),
      tracking: {
        customEvents: ['page_view', 'add_to_cart', 'purchase']
      }
    };
  }

  private generateMockContent(
    product: ProductData,
    options: GenerationOptions,
    media: ProcessedMedia[]
  ): LandingPageContent {
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
      reviews: this.generateReviews([], options),
      trustBadges: this.generateTrustBadges(options.targetAudience),
      upsells: options.includeUpsells ? this.generateUpsells(product) : [],
      contact: this.generateContactInfo(options),
      tracking: {
        facebookPixel: import.meta.env.VITE_FACEBOOK_PIXEL_ID,
        googleAnalytics: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
        customEvents: ['page_view', 'add_to_cart', 'purchase']
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

  private generateReviews(aiReviews: any[], options: GenerationOptions) {
    if (aiReviews && aiReviews.length > 0) {
      return aiReviews.map((review: any) => ({
        name: review.name || 'Anonymous Customer',
        rating: review.rating || 5,
        comment: review.comment || review.text || 'Great product!',
        verified: true,
        date: new Date().toLocaleDateString(),
        avatar: `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo-${Math.floor(Math.random() * 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=100`
      }));
    }

    // Generate mock reviews based on audience
    const reviewTemplates = this.getReviewTemplates(options.targetAudience, options.language);
    
    return reviewTemplates.map(template => ({
      ...template,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      avatar: `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo-${Math.floor(Math.random() * 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=100`
    }));
  }

  private getReviewTemplates(audience: string, language: string) {
    const templates = {
      mena: {
        en: [
          { name: 'Ahmed Hassan', rating: 5, comment: 'Excellent quality and fast delivery. Highly recommend to all families!', verified: true },
          { name: 'Fatima Al-Zahra', rating: 5, comment: 'Amazing product! Worth every penny. My whole family loves it.', verified: true },
          { name: 'Omar Khalil', rating: 4, comment: 'Good value for money. Customer service was very helpful.', verified: true }
        ],
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

    const audienceTemplates = templates[audience as keyof typeof templates];
    const langTemplates = audienceTemplates?.[language as keyof typeof audienceTemplates] || audienceTemplates?.en;
    
    return langTemplates || templates.america.en;
  }

  private generateTrustBadges(audience: string): string[] {
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
    console.log('🤖 Starting AI content generation...');
    
    if (originalPrice > currentPrice) {
    if (groqApiKey && groqApiKey.trim() && groqApiKey !== 'your_actual_groq_key_here') {
      console.log('🔑 Using Groq API for content generation');
      return `${discount}% OFF`;
    }
    
    console.log('📝 Using mock content generation');
    return '';
  }
}
  try {
    const prompt = buildPrompt(product, language);
    console.log('📤 Sending request to Groq API...');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: getSystemPrompt(language)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Groq API response received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Groq API');
    }

    const generatedText = data.choices[0].message.content;
    return parseAIResponse(generatedText, product, language);
    
  } catch (error) {
    console.error('❌ Groq API failed:', error);
    throw error;
  }
}

function buildPrompt(product: any, language: string): string {
  const isArabic = language === 'ar';
  
  if (isArabic) {
    return `اكتب محتوى صفحة هبوط مقنع لهذا المنتج:

اسم المنتج: ${product.title}
الوصف: ${product.description}
السعر: ${product.price}
المميزات: ${product.features?.join(', ') || 'مميزات عالية الجودة'}

اكتب المحتوى التالي باللغة العربية:
1. عنوان رئيسي جذاب (يركز على الفوائد)
2. عنوان فرعي داعم
3. نص دعوة للعمل
4. وصف مقنع للمنتج
5. قائمة بـ 5 مميزات رئيسية
6. 3 شهادات عملاء واقعية

اجعل المحتوى مقنعاً ومركزاً على الفوائد وليس المميزات فقط.`;
  }
  
  return `Create compelling landing page content for this product:

Product Name: ${product.title}
Description: ${product.description}
Price: ${product.price}
Features: ${product.features?.join(', ') || 'High-quality features'}

Generate the following content in English:
1. Compelling headline (benefit-focused)
2. Supporting subheadline
3. Call-to-action text
4. Persuasive product description
5. List of 5 key features
6. 3 realistic customer testimonials

Focus on benefits over features and make it conversion-optimized.`;
}

function getSystemPrompt(language: string): string {
  if (language === 'ar') {
    return `أنت كاتب محتوى خبير متخصص في صفحات الهبوط عالية التحويل للأسواق العربية.

اكتب دائماً:
- ركز على الفوائد وليس المميزات فقط
- استخدم لغة عاطفية مناسبة للثقافة العربية
- أضف عناصر الثقة والدليل الاجتماعي
- اخلق شعوراً بالإلحاح دون أن تكون مزعجاً
- اكتب باللغة العربية الفصحى المبسطة`;
  }
  
  return `You are an expert copywriter specializing in high-converting landing pages.

Always:
- Focus on benefits over features
- Use emotional triggers appropriate for the target audience
- Include social proof and trust elements
- Create urgency without being pushy
- Write in clear, persuasive language`;
}

function parseAIResponse(text: string, product: any, language: string): AIGeneratedContent {
  // Try to extract structured content from the AI response
  const lines = text.split('\n').filter(line => line.trim());
  
  // Default content structure
  const defaultContent = generateMockContent(product, language);
  
  // Extract headline (usually the first substantial line)
  const headline = lines.find(line => line.length > 10 && !line.includes(':')) || defaultContent.headline;
  
  // Extract features (look for numbered lists or bullet points)
  const features = [];
  for (const line of lines) {
    if (line.match(/^\d+\./) || line.match(/^[-•*]/)) {
      const feature = line.replace(/^\d+\.\s*/, '').replace(/^[-•*]\s*/, '').trim();
      if (feature.length > 5) {
        features.push(feature);
      }
    }
  }
  
  return {
    headline: headline.replace(/^["']|["']$/g, '').trim(),
    subheadline: lines[1] || defaultContent.subheadline,
    description: lines.slice(2, 5).join(' ') || defaultContent.description,
    callToAction: language === 'ar' ? 'اطلب الآن' : 'Order Now',
    features: features.length > 0 ? features.slice(0, 5) : defaultContent.features,
    benefits: defaultContent.benefits,
    testimonials: defaultContent.testimonials,
    socialProof: defaultContent.socialProof
  };
}