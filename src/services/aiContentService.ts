import { ScrapedProduct, AIGeneratedContent, Testimonial, SocialProof } from '../types';

export async function generateAIContent(
  product: ScrapedProduct,
  language: 'en' | 'ar'
): Promise<AIGeneratedContent> {
  try {
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    
    if (groqKey && groqKey !== 'your_actual_groq_key_here') {
      return await generateWithGroq(product, language, groqKey);
    }
    
    // Fallback to mock AI content
    return generateMockAIContent(product, language);
    
  } catch (error) {
    console.warn('⚠️ AI generation failed, using mock content:', error);
    return generateMockAIContent(product, language);
  }
}

async function generateWithGroq(
  product: ScrapedProduct,
  language: 'en' | 'ar',
  apiKey: string
): Promise<AIGeneratedContent> {
  const prompt = language === 'ar' 
    ? `اكتب محتوى صفحة هبوط جذابة لمنتج بعنوان: "${product.title}". يجب أن تتضمن: عنوان رئيسي، عنوان فرعي، وصف مفصل، قائمة بالمميزات والفوائد، ودعوة للعمل قوية.`
    : `Create compelling landing page content for a product titled: "${product.title}". Include: headline, subheadline, detailed description, features list, benefits list, and strong call-to-action.`;

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
          content: language === 'ar' 
            ? 'أنت خبير في كتابة المحتوى التسويقي باللغة العربية. اكتب محتوى جذاب ومقنع.'
            : 'You are an expert copywriter specializing in high-converting landing page content.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const generatedText = data.choices[0].message.content;
  
  // Parse the generated content (simplified parsing)
  return parseAIResponse(generatedText, product, language);
}

function generateMockAIContent(product: ScrapedProduct, language: 'en' | 'ar'): AIGeneratedContent {
  if (language === 'ar') {
    return {
      headline: `اكتشف ${product.title} - الحل الأمثل لاحتياجاتك`,
      subheadline: 'منتج عالي الجودة مصمم خصيصاً لتلبية توقعاتك وتجاوزها',
      description: `يقدم ${product.title} تجربة استثنائية تجمع بين الجودة العالية والتصميم المبتكر. مصنوع من أفضل المواد ومصمم بعناية فائقة لضمان الأداء الأمثل والمتانة طويلة الأمد.`,
      features: product.features,
      benefits: [
        'توفير الوقت والجهد',
        'جودة عالية مضمونة',
        'سهولة في الاستخدام',
        'دعم فني متميز',
        'ضمان الاسترداد'
      ],
      callToAction: 'اطلب الآن واحصل على خصم خاص!',
      testimonials: generateMockTestimonials('ar'),
      socialProof: generateMockSocialProof(),
      seoData: {
        title: `${product.title} - أفضل الأسعار والجودة`,
        description: `احصل على ${product.title} بأفضل الأسعار. جودة عالية، شحن سريع، وضمان الاسترداد.`,
        keywords: ['منتج عالي الجودة', 'أفضل الأسعار', 'شحن سريع', 'ضمان الجودة'],
        ogTitle: `${product.title} - العرض الحصري`,
        ogDescription: `اكتشف ${product.title} واحصل على أفضل قيمة مقابل المال`,
        ogImage: product.images[0] || ''
      }
    };
  }

  return {
    headline: `Discover ${product.title} - The Ultimate Solution`,
    subheadline: 'Premium quality product designed to exceed your expectations',
    description: `Experience the perfect blend of innovation and quality with ${product.title}. Crafted with precision using the finest materials, this product delivers exceptional performance and lasting durability that you can trust.`,
    features: product.features,
    benefits: [
      'Save Time and Effort',
      'Guaranteed High Quality',
      'Easy to Use',
      'Excellent Customer Support',
      'Money-Back Guarantee'
    ],
    callToAction: 'Order Now and Get Special Discount!',
    testimonials: generateMockTestimonials('en'),
    socialProof: generateMockSocialProof(),
    seoData: {
      title: `${product.title} - Best Price & Quality`,
      description: `Get ${product.title} at the best price. High quality, fast shipping, and money-back guarantee.`,
      keywords: ['high quality product', 'best price', 'fast shipping', 'quality guarantee'],
      ogTitle: `${product.title} - Exclusive Offer`,
      ogDescription: `Discover ${product.title} and get the best value for your money`,
      ogImage: product.images[0] || ''
    }
  };
}

function parseAIResponse(text: string, product: ScrapedProduct, language: 'en' | 'ar'): AIGeneratedContent {
  // Simplified parsing - in a real implementation, you'd use more sophisticated parsing
  const lines = text.split('\n').filter(line => line.trim());
  
  return {
    headline: lines[0] || (language === 'ar' ? `اكتشف ${product.title}` : `Discover ${product.title}`),
    subheadline: lines[1] || (language === 'ar' ? 'منتج عالي الجودة' : 'Premium quality product'),
    description: lines.slice(2, 5).join(' ') || product.description,
    features: product.features,
    benefits: product.features.map(feature => 
      language === 'ar' ? `يوفر ${feature}` : `Provides ${feature}`
    ),
    callToAction: language === 'ar' ? 'اطلب الآن!' : 'Order Now!',
    testimonials: generateMockTestimonials(language),
    socialProof: generateMockSocialProof(),
    seoData: {
      title: `${product.title} - ${language === 'ar' ? 'أفضل الأسعار' : 'Best Price'}`,
      description: product.description,
      keywords: language === 'ar' ? ['منتج', 'جودة', 'سعر'] : ['product', 'quality', 'price'],
      ogTitle: product.title,
      ogDescription: product.description,
      ogImage: product.images[0] || ''
    }
  };
}

function generateMockTestimonials(language: 'en' | 'ar'): Testimonial[] {
  if (language === 'ar') {
    return [
      {
        name: 'أحمد محمد',
        rating: 5,
        comment: 'منتج رائع وجودة عالية. أنصح به بشدة!',
        verified: true
      },
      {
        name: 'فاطمة علي',
        rating: 5,
        comment: 'تجربة ممتازة وخدمة عملاء متميزة.',
        verified: true
      },
      {
        name: 'محمد حسن',
        rating: 4,
        comment: 'قيمة ممتازة مقابل المال المدفوع.',
        verified: true
      }
    ];
  }

  return [
    {
      name: 'Sarah Johnson',
      rating: 5,
      comment: 'Amazing product! Exceeded my expectations in every way.',
      verified: true
    },
    {
      name: 'Mike Chen',
      rating: 5,
      comment: 'Outstanding quality and excellent customer service.',
      verified: true
    },
    {
      name: 'Emily Davis',
      rating: 4,
      comment: 'Great value for money. Highly recommended!',
      verified: true
    }
  ];
}

function generateMockSocialProof(): SocialProof {
  return {
    totalCustomers: Math.floor(Math.random() * 50000) + 10000,
    averageRating: 4.8,
    countriesServed: Math.floor(Math.random() * 50) + 20,
    monthlyUsers: Math.floor(Math.random() * 100000) + 25000
  };
}