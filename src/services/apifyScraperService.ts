import axios from 'axios';

const APIFY_API_TOKEN = import.meta.env.VITE_APIFY_API_TOKEN;
const APIFY_ACTOR_ID = 'junglee~Amazon-crawler';

interface ApifyScrapedData {
  title?: string;
  price?: string;
  images?: string[];
  description?: string;
  url: string;
}

interface ApifyResponse {
  data: {
    items: ApifyScrapedData[];
  };
}

export class ApifyScraperService {
  private static instance: ApifyScraperService;

  static getInstance(): ApifyScraperService {
    if (!ApifyScraperService.instance) {
      ApifyScraperService.instance = new ApifyScraperService();
    }
    return ApifyScraperService.instance;
  }

  async scrapeProductImages(productUrl: string): Promise<ApifyScrapedData> {
    try {
      console.log('🕷️ Starting Apify scraping for:', productUrl);
      
      // Start the Apify actor run
      const runResponse = await this.startApifyRun(productUrl);
      const runId = runResponse.data.id;
      
      console.log('🔄 Apify run started with ID:', runId);
      
      // Wait for the run to complete
      const result = await this.waitForRunCompletion(runId);
      
      console.log('✅ Apify scraping completed');
      return result;
      
    } catch (error) {
      console.error('❌ Apify scraping failed:', error);
      
      // Return fallback data with the original URL
      return {
        title: 'Product from ' + this.extractDomainFromUrl(productUrl),
        price: 'Price not available',
        images: [
          'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/279906/pexels-photo-279906.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        description: 'Product information could not be retrieved. Using placeholder data.',
        url: productUrl
      };
    }
  }

  private async startApifyRun(productUrl: string) {
    const runUrl = `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs?token=${APIFY_API_TOKEN}`;
    
    const inputData = {
      startUrls: [{ url: productUrl }],
      maxItems: 1,
      extendOutputFunction: `($) => {
        return {
          images: $('img').map((i, el) => $(el).attr('src') || $(el).attr('data-src')).get().filter(src => src && src.includes('http'))
        };
      }`
    };

    return await axios.post(runUrl, inputData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
  }

  private async waitForRunCompletion(runId: string, maxWaitTime = 120000): Promise<ApifyScrapedData> {
    const startTime = Date.now();
    const checkInterval = 3000; // Check every 3 seconds
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const statusUrl = `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_API_TOKEN}`;
        const statusResponse = await axios.get(statusUrl);
        const status = statusResponse.data.data.status;
        
        console.log('📊 Apify run status:', status);
        
        if (status === 'SUCCEEDED') {
          return await this.getRunResults(runId);
        } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
          throw new Error(`Apify run ${status.toLowerCase()}`);
        }
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        
      } catch (error) {
        console.warn('⚠️ Error checking run status:', error);
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
    }
    
    throw new Error('Apify run timed out');
  }

  private async getRunResults(runId: string): Promise<ApifyScrapedData> {
    const resultsUrl = `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_API_TOKEN}`;
    const resultsResponse = await axios.get(resultsUrl);
    const items = resultsResponse.data;
    
    if (!items || items.length === 0) {
      throw new Error('No data scraped from the product page');
    }
    
    const scrapedData = items[0];
    
    // Process and clean the scraped data
    return {
      title: scrapedData.title || 'Product Title',
      price: scrapedData.price || 'Price not available',
      images: this.processImages(scrapedData.images || []),
      description: scrapedData.description || 'Product description not available',
      url: scrapedData.url || ''
    };
  }

  private processImages(rawImages: string[]): string[] {
    if (!Array.isArray(rawImages)) {
      return [];
    }
    
    // Filter and clean image URLs
    const processedImages = rawImages
      .filter(img => img && typeof img === 'string')
      .filter(img => img.startsWith('http'))
      .filter(img => this.isValidImageUrl(img))
      .map(img => this.cleanImageUrl(img))
      .slice(0, 10); // Limit to 10 images max
    
    console.log(`🖼️ Processed ${processedImages.length} images from ${rawImages.length} raw images`);
    
    return processedImages;
  }

  private isValidImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const lowerUrl = url.toLowerCase();
    
    // Check if URL contains image extensions or common image hosting patterns
    return imageExtensions.some(ext => lowerUrl.includes(ext)) ||
           lowerUrl.includes('image') ||
           lowerUrl.includes('img') ||
           lowerUrl.includes('photo') ||
           lowerUrl.includes('picture');
  }

  private cleanImageUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remove common tracking parameters
      const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'tag'];
      paramsToRemove.forEach(param => {
        urlObj.searchParams.delete(param);
      });
      
      return urlObj.toString();
    } catch {
      return url; // Return original if URL parsing fails
    }
  }

  private extractDomainFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'Unknown Site';
    }
  }
}