import { ScrapedProduct } from '../types';

export async function scrapeProductData(url: string, useRealData: boolean): Promise<ScrapedProduct> {
  // Always try to use real data first if we have API keys
  const serpApiKey = import.meta.env.VITE_SERP_API_KEY;
  const shouldUseRealData = useRealData && serpApiKey && serpApiKey !== 'your_actual_serp_key_here';
  
  if (!shouldUseRealData) {
    console.log('📝 Using mock product data for testing');
    return getMockProductData(url);
  }

  try {
    console.log('🌐 Attempting to scrape real product data...');
    
    // Try SerpAPI for product search
    if (serpApiKey) {
      return await scrapeWithSerpAPI(url, serpApiKey);
    }
    
    throw new Error('No valid API keys available');
    
  } catch (error) {
    console.warn('⚠️ Scraping failed, using mock data:', error);
    return getMockProductData(url);
  }
}

async function scrapeWithSerpAPI(url: string, apiKey: string): Promise<ScrapedProduct> {
  try {
    // Extract product name from URL for search
    const productName = extractProductNameFromUrl(url);
    console.log(`🔍 Searching for: ${productName}`);
    
    const response = await fetch(
      `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(productName)}&api_key=${apiKey}&num=5`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 SerpAPI response:', data);
    
    if (data.error) {
      throw new Error(`SerpAPI error: ${data.error}`);
    }

    const results = data.shopping_results || [];
    if (results.length === 0) {
      throw new Error('No products found in search results');
    }

    const firstResult = results[0];
    console.log('✅ Found product:', firstResult.title);

    return {
      title: firstResult.title || productName,
      description: firstResult.snippet || 'High-quality product with excellent features',
      price: firstResult.price || '$99.99',
      images: [
        firstResult.thumbnail,
        ...(firstResult.images || [])
      ].filter(Boolean).slice(0, 3),
      features: extractFeatures(firstResult.snippet || firstResult.title || ''),
      url
    };
    
  } catch (error) {
    console.error('❌ SerpAPI scraping failed:', error);
    throw error;
  }
}

function extractFeatures(text: string): string[] {
  const features: string[] = [];
  const featureKeywords = [
    'premium', 'quality', 'durable', 'lightweight', 'waterproof',
    'wireless', 'bluetooth', 'rechargeable', 'portable', 'professional',
    'advanced', 'smart', 'digital', 'automatic', 'adjustable'
  ];

  const words = text.toLowerCase().split(/\s+/);
  
  featureKeywords.forEach(keyword => {
    if (words.some(word => word.includes(keyword))) {
      features.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });

  // Add default features if none found
  if (features.length === 0) {
    features.push('High Quality', 'Reliable', 'User Friendly', 'Great Value');
  }

  return features.slice(0, 5);
}

function extractProductNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
    
    // Extract from common e-commerce URL patterns
    if (url.includes('amazon.com')) {
      const dpIndex = pathParts.findIndex(part => part === 'dp');
      if (dpIndex > 0) {
        return pathParts[dpIndex - 1].replace(/-/g, ' ');
      }
    }
    
    if (url.includes('ebay.com')) {
      const itmIndex = pathParts.findIndex(part => part === 'itm');
      if (itmIndex > 0) {
        return pathParts[itmIndex - 1].replace(/-/g, ' ');
      }
    }

    // Generic extraction from URL path
    const lastPart = pathParts[pathParts.length - 1] || urlObj.hostname;
    return lastPart
      .replace(/[-_]/g, ' ')
      .replace(/\.(html|php|asp|jsp)$/i, '')
      .replace(/\b\w/g, l => l.toUpperCase());

  } catch {
    return 'Product Search';
  }
}
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      robotId: 'generic-product-scraper',
      inputParameters: { url }
    })
  });

  if (!response.ok) {
    throw new Error(`BrowseAI API error: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    title: data.title || extractTitleFromUrl(url),
    description: data.description || 'High-quality product with excellent features',
    price: data.price || '$99.99',
    images: data.images || [
      'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/279906/pexels-photo-279906.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    features: data.features || [
      'Premium Quality Materials',
      'Advanced Technology',
      'User-Friendly Design',
      'Excellent Customer Support'
    ],
    url
  };
}

async function basicScrape(url: string): Promise<ScrapedProduct> {
  try {
    // Basic fetch to get page title and meta description
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LandingPageBot/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const title = extractTitleFromHtml(html) || extractTitleFromUrl(url);
    const description = extractDescriptionFromHtml(html) || 'Premium product with exceptional quality and features';
    
    return {
      title,
      description,
      price: '$99.99',
      images: [
        'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/279906/pexels-photo-279906.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      features: [
        'High-Quality Construction',
        'Modern Design',
        'Easy to Use',
        'Great Value'
      ],
      url
    };
    
  } catch (error) {
    console.warn('Basic scraping failed:', error);
    throw error;
  }
}

function getMockProductData(url: string): ScrapedProduct {
  const productNames = [
    'Premium Wireless Headphones',
    'Smart Fitness Tracker',
    'Eco-Friendly Water Bottle',
    'Professional Camera Lens',
    'Ergonomic Office Chair'
  ];
  
  const randomProduct = productNames[Math.floor(Math.random() * productNames.length)];
  
  return {
    title: randomProduct,
    description: 'Experience the perfect blend of innovation and quality with this exceptional product. Designed with precision and crafted for excellence.',
    price: '$' + (Math.floor(Math.random() * 200) + 50).toString(),
    images: [
      'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/279906/pexels-photo-279906.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    features: [
      'Premium Quality Materials',
      'Advanced Technology Integration',
      'User-Friendly Interface',
      '24/7 Customer Support',
      'Money-Back Guarantee'
    ],
    url
  };
}

function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
    const lastPart = pathParts[pathParts.length - 1] || urlObj.hostname;
    
    return lastPart
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\.(html|php|asp|jsp)$/i, '');
  } catch {
    return 'Premium Product';
  }
}

function extractTitleFromHtml(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : null;
}

function extractDescriptionFromHtml(html: string): string | null {
  const descMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
  return descMatch ? descMatch[1].trim() : null;
}