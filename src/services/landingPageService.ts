import { ScrapedProduct, AIGeneratedContent, GenerationOptions, GenerationResult } from '../types';
import { scrapeProductData } from './scraperService';
import { generateAIContent } from './aiContentService';
import { processImages } from './imageProcessorService';
import { generateHTML } from './htmlGeneratorService';
import { generateSEOData } from './seoService';

export class LandingPageService {
  private static instance: LandingPageService;

  static getInstance(): LandingPageService {
    if (!LandingPageService.instance) {
      LandingPageService.instance = new LandingPageService();
    }
    return LandingPageService.instance;
  }

  async generateLandingPage(
    url: string,
    options: GenerationOptions
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting landing page generation...');
      
      // Step 1: Validate URL and determine if we should use real or mock data
      const isRealUrl = this.isRealUrl(url);
      console.log(`🌐 Using ${isRealUrl ? 'real' : 'mock'} product data from URL: ${url}`);
      
      // Step 2: Scrape product data
      console.log('📡 Step 1: Scraping product information...');
      const productData = await scrapeProductData(url, isRealUrl);
      console.log(`✅ Product scraped successfully: ${productData.title}`);
      
      // Step 3: Process images
      console.log('🖼️ Step 2: Processing product images...');
      const processedImages = await processImages(productData.images);
      console.log(`✅ Processed ${processedImages.length} images`);
      
      // Step 4: Generate AI content
      console.log('🤖 Step 3: Generating AI content...');
      const aiContent = await generateAIContent(productData, options.language);
      console.log('✅ AI content generated successfully');
      
      // Step 5: Generate SEO data
      console.log('🔍 Step 4: Generating SEO data...');
      const seoData = await generateSEOData(productData, aiContent);
      console.log('✅ SEO data generated');
      
      // Step 6: Generate final HTML
      console.log('📄 Step 5: Generating HTML...');
      const html = generateHTML({
        product: productData,
        aiContent,
        processedImages,
        seoData,
        options
      });
      
      const generationTime = Date.now() - startTime;
      console.log(`🎉 Landing page generated successfully in ${generationTime}ms`);
      
      return {
        html,
        generationTime,
        isRealData: isRealUrl,
        productTitle: productData.title
      };
      
    } catch (error) {
      console.error('❌ Error generating landing page:', error);
      throw new Error(`Failed to generate landing page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private isRealUrl(url: string): boolean {
    // Check if URL is a real URL (starts with http/https and not a test URL)
    const testUrls = ['test.com', 'example.com', 'localhost', 'mock-url.com'];
    const isHttpUrl = url.startsWith('http://') || url.startsWith('https://');
    const isTestUrl = testUrls.some(testUrl => url.includes(testUrl));
    
    return isHttpUrl && !isTestUrl;
  }
}