import { ScrapedProduct } from '../types';

export async function scrapeProductData(url: string, useRealData: boolean): Promise<ScrapedProduct> {
  if (!useRealData) {
    console.log('📝 Using mock product data for testing');
    return getMockProductData(url);
  }

  try {
    // Try to use BrowseAI if API key is available
    const browseAiKey = import.meta.env.VITE_BROWSE_AI_API_KEY;
    
    if (browseAiKey && browseAiKey !== 'your_actual_browse_ai_key_here') {
      return await scrapeWithBrowseAI(url, browseAiKey);
    }
    
    // Fallback to basic scraping
    return await basicScrape(url);
    
  } catch (error) {
    console.warn('⚠️ Scraping failed, using mock data:', error);
    return getMockProductData(url);
  }
}

async function scrapeWithBrowseAI(url: string, apiKey: string): Promise<ScrapedProduct> {
  const response = await fetch('https://api.browse.ai/v2/robots/bulk', {
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