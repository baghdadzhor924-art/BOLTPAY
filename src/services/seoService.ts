import { ScrapedProduct, AIGeneratedContent, SEOData } from '../types';

export async function generateSEOData(
  product: ScrapedProduct,
  aiContent: AIGeneratedContent
): Promise<SEOData> {
  try {
    const serpApiKey = import.meta.env.VITE_SERP_API_KEY;
    
    if (serpApiKey && serpApiKey !== 'your_actual_serp_key_here') {
      return await generateSEOWithCompetitorAnalysis(product, aiContent, serpApiKey);
    }
    
    return generateBasicSEO(product, aiContent);
    
  } catch (error) {
    console.warn('⚠️ SEO generation failed, using basic SEO:', error);
    return generateBasicSEO(product, aiContent);
  }
}

async function generateSEOWithCompetitorAnalysis(
  product: ScrapedProduct,
  aiContent: AIGeneratedContent,
  apiKey: string
): Promise<SEOData> {
  try {
    // Analyze competitors for the product category
    const keywords = extractKeywords(product.title);
    const competitorData = await analyzeCompetitors(keywords, apiKey);
    
    return {
      title: `${product.title} - Best Price & Quality | Buy Now`,
      description: aiContent.description.substring(0, 160),
      keywords: [...keywords, ...extractCompetitorKeywords(competitorData)],
      ogTitle: aiContent.headline,
      ogDescription: aiContent.subheadline,
      ogImage: product.images[0] || ''
    };
    
  } catch (error) {
    console.warn('Competitor analysis failed:', error);
    return generateBasicSEO(product, aiContent);
  }
}

function generateBasicSEO(product: ScrapedProduct, aiContent: AIGeneratedContent): SEOData {
  const keywords = extractKeywords(product.title);
  
  return {
    title: `${product.title} - Premium Quality | Best Price`,
    description: aiContent.description.length > 160 
      ? aiContent.description.substring(0, 157) + '...'
      : aiContent.description,
    keywords: keywords,
    ogTitle: aiContent.headline,
    ogDescription: aiContent.subheadline,
    ogImage: product.images[0] || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1200'
  };
}

async function analyzeCompetitors(keywords: string[], apiKey: string): Promise<any[]> {
  const results = await Promise.all(
    keywords.slice(0, 2).map(async (keyword) => { // Limit to 2 keywords to save API calls
      try {
        const response = await fetch(
          `https://serpapi.com/search.json?q=${encodeURIComponent(keyword)}&api_key=${apiKey}&num=5`
        );
        
        if (!response.ok) {
          throw new Error(`SerpAPI error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.organic_results || [];
        
      } catch (error) {
        console.warn(`Failed to analyze keyword: ${keyword}`, error);
        return [];
      }
    })
  );
  
  return results.flat();
}

function extractKeywords(title: string): string[] {
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'];
  
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 10);
}

function extractCompetitorKeywords(competitorData: any[]): string[] {
  const keywords: string[] = [];
  
  competitorData.forEach(result => {
    if (result.title) {
      const titleKeywords = extractKeywords(result.title);
      keywords.push(...titleKeywords);
    }
  });
  
  // Return unique keywords, limited to top 15
  return [...new Set(keywords)].slice(0, 15);
}