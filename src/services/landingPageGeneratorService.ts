import { 
  ProductData, 
  LandingPageContent, 
  GenerationOptions, 
  GenerationResult, 
  ProcessedMedia,
  TargetAudience,
  APIResponse 
} from '../types';
import { ProductSearchService } from './productSearchService';
import { ImageAnalysisService } from './imageAnalysisService';
import { MediaProcessingService } from './mediaProcessingService';
import { AIContentService } from './aiContentService';
import { IntegrationService } from './integrationService';

export class LandingPageGeneratorService {
  private static instance: LandingPageGeneratorService;
  private productSearchService: ProductSearchService;
  private imageAnalysisService: ImageAnalysisService;
  private mediaProcessingService: MediaProcessingService;
  private aiContentService: AIContentService;
  private integrationService: IntegrationService;

  private constructor() {
    this.productSearchService = new ProductSearchService();
    this.imageAnalysisService = new ImageAnalysisService();
    this.mediaProcessingService = new MediaProcessingService();
    this.aiContentService = new AIContentService();
    this.integrationService = new IntegrationService();
  }

  static getInstance(): LandingPageGeneratorService {
    if (!LandingPageGeneratorService.instance) {
      LandingPageGeneratorService.instance = new LandingPageGeneratorService();
    }
    return LandingPageGeneratorService.instance;
  }

  async generateLandingPage(url: string, options: GenerationOptions): Promise<GenerationResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log('🚀 Starting comprehensive landing page generation...');
      console.log(`📋 Options:`, options);

      // Step 1: Search for product data across multiple platforms
      console.log('🔍 Step 1: Searching for product data...');
      const productSearchResult = await this.productSearchService.searchProduct(url);
      
      if (!productSearchResult.success || !productSearchResult.data?.length) {
        errors.push('Failed to find product data');
        throw new Error('No product data found');
      }

      const primaryProduct = productSearchResult.data[0];
      console.log(`✅ Found product: ${primaryProduct.title}`);

      // Step 2: Analyze product images
      console.log('🔍 Step 2: Analyzing product images...');
      const imageAnalysisResult = await this.imageAnalysisService.analyzeImages(primaryProduct.images);
      
      if (!imageAnalysisResult.success) {
        warnings.push('Image analysis partially failed');
      }

      const imageAnalyses = imageAnalysisResult.data || [];

      // Step 3: Validate product match
      console.log('🎯 Step 3: Validating product match...');
      const validationScore = await this.imageAnalysisService.validateProductMatch(
        primaryProduct.title,
        imageAnalyses
      );

      if (validationScore < 0.3) {
        warnings.push('Low product validation score - results may be inaccurate');
      }

      // Step 4: Process media (background removal, optimization, Cloudinary upload)
      console.log('🖼️ Step 4: Processing media files...');
      const mediaProcessingResult = await this.mediaProcessingService.processMedia(
        primaryProduct.images,
        imageAnalyses
      );

      const processedMedia = mediaProcessingResult.data || [];

      // Step 5: Generate AI content based on target audience
      console.log('🤖 Step 5: Generating AI content...');
      const aiContentResult = await this.aiContentService.generateContent(
        primaryProduct,
        options,
        processedMedia
      );

      if (!aiContentResult.success) {
        errors.push('AI content generation failed');
      }

      const landingPageContent = aiContentResult.data!;

      // Step 6: Generate HTML, CSS, and JavaScript
      console.log('📄 Step 6: Generating landing page code...');
      const { html, css, javascript } = this.generateLandingPageCode(
        primaryProduct,
        landingPageContent,
        processedMedia,
        options
      );

      // Step 7: Handle integrations (Shopify, WooCommerce, Domain)
      console.log('🔗 Step 7: Setting up integrations...');
      const integrations = await this.integrationService.setupIntegrations(
        primaryProduct,
        landingPageContent,
        options
      );

      // Step 8: Generate SEO data
      const seoData = this.generateSEOData(primaryProduct, landingPageContent, options);

      const generationTime = Date.now() - startTime;
      console.log(`🎉 Landing page generated successfully in ${generationTime}ms`);

      return {
        success: true,
        productData: primaryProduct,
        landingPageContent,
        html,
        css,
        javascript,
        generationTime,
        mediaProcessed: processedMedia.length,
        validationScore,
        seoData,
        integrations,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      console.error('❌ Landing page generation failed:', error);
      
      return {
        success: false,
        productData: this.createFallbackProduct(url),
        landingPageContent: this.createFallbackContent(),
        html: this.generateFallbackHTML(url),
        css: '',
        javascript: '',
        generationTime: Date.now() - startTime,
        mediaProcessed: 0,
        validationScore: 0,
        seoData: {
          title: 'Product Landing Page',
          description: 'Professional landing page',
          keywords: ['product', 'landing page'],
          structuredData: {}
        },
        integrations: {},
        errors: [...errors, error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private generateLandingPageCode(
    product: ProductData,
    content: LandingPageContent,
    media: ProcessedMedia[],
    options: GenerationOptions
  ): { html: string; css: string; javascript: string } {
    const targetAudience = this.getTargetAudienceConfig(options.targetAudience);
    const isRTL = options.language === 'ar';

    const html = this.generateHTML(product, content, media, options, targetAudience, isRTL);
    const css = this.generateCSS(targetAudience, isRTL);
    const javascript = this.generateJavaScript(content, options);

    return { html, css, javascript };
  }

  private generateHTML(
    product: ProductData,
    content: LandingPageContent,
    media: ProcessedMedia[],
    options: GenerationOptions,
    targetAudience: TargetAudience,
    isRTL: boolean
  ): string {
    return `<!DOCTYPE html>
<html lang="${options.language}" ${isRTL ? 'dir="rtl"' : ''}>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.hero.headline}</title>
    <meta name="description" content="${content.hero.subheadline}">
    
    <!-- SEO Meta Tags -->
    <meta property="og:title" content="${content.hero.headline}">
    <meta property="og:description" content="${content.hero.subheadline}">
    <meta property="og:image" content="${media[0]?.optimized || ''}">
    <meta property="og:type" content="product">
    
    <!-- Tracking Scripts -->
    ${content.tracking.facebookPixel ? `
    <script>
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${content.tracking.facebookPixel}');
      fbq('track', 'PageView');
    </script>
    ` : ''}
    
    ${content.tracking.googleAnalytics ? `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${content.tracking.googleAnalytics}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${content.tracking.googleAnalytics}');
    </script>
    ` : ''}
    
    <style>
        ${this.generateCSS(targetAudience, isRTL)}
    </style>
</head>
<body class="${targetAudience.preferences.visualStyle}-theme">
    <!-- Hero Section -->
    <section class="hero" style="background-image: url('${content.hero.backgroundImage}')">
        <div class="container">
            <div class="hero-content">
                <h1 class="hero-headline">${content.hero.headline}</h1>
                <p class="hero-subheadline">${content.hero.subheadline}</p>
                <div class="hero-cta">
                    <button class="cta-button primary" onclick="scrollToOrder()">
                        ${content.hero.cta}
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Product Showcase -->
    <section class="product-showcase">
        <div class="container">
            <div class="product-grid">
                <div class="product-media">
                    <div class="media-gallery">
                        ${media.map((item, index) => `
                            <img src="${item.optimized}" 
                                 alt="${product.title}" 
                                 class="product-image ${index === 0 ? 'active' : ''}"
                                 onclick="setActiveImage(${index})">
                        `).join('')}
                    </div>
                </div>
                <div class="product-info">
                    <h2 class="product-title">${content.product.title}</h2>
                    <div class="product-rating">
                        ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                        <span class="rating-count">(${product.reviewCount} reviews)</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">${content.pricing.current}</span>
                        ${content.pricing.original ? `<span class="original-price">${content.pricing.original}</span>` : ''}
                        ${content.pricing.discount ? `<span class="discount">${content.pricing.discount}</span>` : ''}
                    </div>
                    <div class="product-description">
                        <p>${content.product.description}</p>
                    </div>
                    <div class="product-features">
                        <h3>Key Features:</h3>
                        <ul>
                            ${content.product.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="product-cta">
                        <button class="cta-button primary large" onclick="addToCart()">
                            ${content.hero.cta}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    ${options.includeReviews ? `
    <!-- Reviews Section -->
    <section class="reviews">
        <div class="container">
            <h2 class="section-title">Customer Reviews</h2>
            <div class="reviews-grid">
                ${content.reviews.map(review => `
                    <div class="review-card">
                        <div class="review-header">
                            <div class="reviewer-info">
                                ${review.avatar ? `<img src="${review.avatar}" alt="${review.name}" class="reviewer-avatar">` : ''}
                                <div>
                                    <h4 class="reviewer-name">${review.name}</h4>
                                    <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                                </div>
                            </div>
                            ${review.verified ? '<span class="verified-badge">✓ Verified Purchase</span>' : ''}
                        </div>
                        <p class="review-comment">${review.comment}</p>
                        <span class="review-date">${review.date}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    ${options.includeUpsells && content.upsells.length > 0 ? `
    <!-- Upsells Section -->
    <section class="upsells">
        <div class="container">
            <h2 class="section-title">You Might Also Like</h2>
            <div class="upsells-grid">
                ${content.upsells.map(upsell => `
                    <div class="upsell-card">
                        <img src="${upsell.image}" alt="${upsell.title}" class="upsell-image">
                        <h3 class="upsell-title">${upsell.title}</h3>
                        <p class="upsell-description">${upsell.description}</p>
                        <div class="upsell-price">${upsell.price}</div>
                        <button class="cta-button secondary" onclick="addUpsellToCart('${upsell.title}')">
                            Add to Cart
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- Trust Badges -->
    ${options.includeTrustBadges ? `
    <section class="trust-badges">
        <div class="container">
            <div class="badges-grid">
                ${content.trustBadges.map(badge => `
                    <div class="trust-badge">
                        <img src="${badge}" alt="Trust Badge" class="badge-image">
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- Contact Section -->
    <section class="contact">
        <div class="container">
            <h2 class="section-title">Get in Touch</h2>
            <div class="contact-methods">
                ${content.contact.whatsapp ? `
                    <a href="https://wa.me/${content.contact.whatsapp}" class="contact-method whatsapp" target="_blank">
                        <span class="contact-icon">📱</span>
                        <span class="contact-text">WhatsApp</span>
                    </a>
                ` : ''}
                ${content.contact.messenger ? `
                    <a href="${content.contact.messenger}" class="contact-method messenger" target="_blank">
                        <span class="contact-icon">💬</span>
                        <span class="contact-text">Messenger</span>
                    </a>
                ` : ''}
                ${content.contact.phone ? `
                    <a href="tel:${content.contact.phone}" class="contact-method phone">
                        <span class="contact-icon">📞</span>
                        <span class="contact-text">${content.contact.phone}</span>
                    </a>
                ` : ''}
                ${content.contact.email ? `
                    <a href="mailto:${content.contact.email}" class="contact-method email">
                        <span class="contact-icon">✉️</span>
                        <span class="contact-text">${content.contact.email}</span>
                    </a>
                ` : ''}
            </div>
        </div>
    </section>

    <!-- Order Form -->
    <section id="order" class="order-form">
        <div class="container">
            <h2 class="section-title">Order Now</h2>
            <form class="order-form-content" onsubmit="submitOrder(event)">
                <div class="form-group">
                    <label for="customerName">Full Name</label>
                    <input type="text" id="customerName" name="customerName" required>
                </div>
                <div class="form-group">
                    <label for="customerEmail">Email</label>
                    <input type="email" id="customerEmail" name="customerEmail" required>
                </div>
                <div class="form-group">
                    <label for="customerPhone">Phone</label>
                    <input type="tel" id="customerPhone" name="customerPhone" required>
                </div>
                <div class="form-group">
                    <label for="customerAddress">Address</label>
                    <textarea id="customerAddress" name="customerAddress" required></textarea>
                </div>
                <div class="form-group">
                    <label for="quantity">Quantity</label>
                    <select id="quantity" name="quantity" onchange="updateTotal()">
                        <option value="1">1 - ${content.pricing.current}</option>
                        <option value="2">2 - ${content.pricing.current} each</option>
                        <option value="3">3 - ${content.pricing.current} each</option>
                    </select>
                </div>
                <div class="order-total">
                    <span class="total-label">Total: </span>
                    <span class="total-amount" id="totalAmount">${content.pricing.current}</span>
                </div>
                <button type="submit" class="cta-button primary large">
                    Complete Order
                </button>
            </form>
        </div>
    </section>

    ${content.contact.chatbot ? `
    <!-- Chatbot -->
    <div id="chatbot" class="chatbot">
        <div class="chatbot-toggle" onclick="toggleChatbot()">
            <span class="chatbot-icon">🤖</span>
        </div>
        <div class="chatbot-window" id="chatbotWindow">
            <div class="chatbot-header">
                <h4>Customer Support</h4>
                <button onclick="toggleChatbot()" class="chatbot-close">×</button>
            </div>
            <div class="chatbot-messages" id="chatbotMessages">
                <div class="bot-message">
                    Hi! How can I help you with your order today?
                </div>
            </div>
            <div class="chatbot-input">
                <input type="text" id="chatbotInput" placeholder="Type your message..." onkeypress="handleChatbotInput(event)">
                <button onclick="sendChatbotMessage()">Send</button>
            </div>
        </div>
    </div>
    ` : ''}

    <script>
        ${this.generateJavaScript(content, options)}
    </script>
</body>
</html>`;
  }

  private generateCSS(targetAudience: TargetAudience, isRTL: boolean): string {
    const colors = targetAudience.preferences.colors;
    const primaryColor = colors[0] || '#2563eb';
    const secondaryColor = colors[1] || '#7c3aed';
    const accentColor = colors[2] || '#dc2626';

    return `
/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: ${targetAudience.preferences.typography || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'};
    line-height: 1.6;
    color: #333;
    ${isRTL ? 'direction: rtl;' : ''}
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Theme Variations */
.rich-theme {
    --primary-color: ${primaryColor};
    --secondary-color: ${secondaryColor};
    --accent-color: ${accentColor};
    --text-color: #333;
    --bg-color: #fff;
}

.clean-theme {
    --primary-color: #4f46e5;
    --secondary-color: #6b7280;
    --accent-color: #10b981;
    --text-color: #374151;
    --bg-color: #f9fafb;
}

/* Hero Section */
.hero {
    min-height: 100vh;
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    display: flex;
    align-items: center;
    position: relative;
    color: white;
}

.hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%);
}

.hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
}

.hero-headline {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.hero-subheadline {
    font-size: 1.5rem;
    margin-bottom: 2.5rem;
    opacity: 0.95;
}

/* Buttons */
.cta-button {
    display: inline-block;
    padding: 15px 30px;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
}

.cta-button.primary {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.cta-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

.cta-button.large {
    padding: 20px 40px;
    font-size: 1.3rem;
}

.cta-button.secondary {
    background: transparent;
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
}

/* Product Showcase */
.product-showcase {
    padding: 80px 0;
    background: var(--bg-color);
}

.product-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
}

.media-gallery {
    display: grid;
    gap: 15px;
}

.product-image {
    width: 100%;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.3s ease;
}

.product-image:hover {
    transform: scale(1.05);
    box-shadow: 0 15px 40px rgba(0,0,0,0.2);
}

.product-image.active {
    border: 3px solid var(--primary-color);
}

.product-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--text-color);
}

.product-rating {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    color: #fbbf24;
}

.rating-count {
    margin-left: 10px;
    color: var(--secondary-color);
    font-size: 1rem;
}

.product-price {
    margin-bottom: 2rem;
}

.current-price {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--accent-color);
}

.original-price {
    font-size: 1.5rem;
    text-decoration: line-through;
    color: var(--secondary-color);
    margin-left: 15px;
}

.discount {
    background: var(--accent-color);
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.9rem;
    margin-left: 15px;
}

.product-features ul {
    list-style: none;
    padding: 0;
}

.product-features li {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    position: relative;
    padding-left: 25px;
}

.product-features li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--primary-color);
    font-weight: bold;
}

/* Reviews Section */
.reviews {
    padding: 80px 0;
    background: #f8fafc;
}

.section-title {
    text-align: center;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 3rem;
    color: var(--text-color);
}

.reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.review-card {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.review-card:hover {
    transform: translateY(-5px);
}

.review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.reviewer-info {
    display: flex;
    align-items: center;
}

.reviewer-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-right: 15px;
}

.reviewer-name {
    font-weight: 600;
    margin-bottom: 5px;
}

.review-rating {
    color: #fbbf24;
}

.verified-badge {
    background: #10b981;
    color: white;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
}

/* Contact Methods */
.contact {
    padding: 60px 0;
    background: var(--primary-color);
    color: white;
}

.contact .section-title {
    color: white;
}

.contact-methods {
    display: flex;
    justify-content: center;
    gap: 30px;
    flex-wrap: wrap;
}

.contact-method {
    display: flex;
    align-items: center;
    padding: 15px 25px;
    background: rgba(255,255,255,0.1);
    border-radius: 50px;
    text-decoration: none;
    color: white;
    transition: all 0.3s ease;
}

.contact-method:hover {
    background: rgba(255,255,255,0.2);
    transform: translateY(-2px);
}

.contact-icon {
    font-size: 1.5rem;
    margin-right: 10px;
}

/* Order Form */
.order-form {
    padding: 80px 0;
    background: #f8fafc;
}

.order-form-content {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.form-group {
    margin-bottom: 25px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--text-color);
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 12px 15px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
}

.order-total {
    text-align: center;
    margin: 30px 0;
    font-size: 1.5rem;
    font-weight: 700;
}

.total-amount {
    color: var(--accent-color);
}

/* Chatbot */
.chatbot {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
}

.chatbot-toggle {
    width: 60px;
    height: 60px;
    background: var(--primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
}

.chatbot-toggle:hover {
    transform: scale(1.1);
}

.chatbot-icon {
    font-size: 1.5rem;
}

.chatbot-window {
    position: absolute;
    bottom: 70px;
    right: 0;
    width: 350px;
    height: 400px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    display: none;
    flex-direction: column;
}

.chatbot-window.active {
    display: flex;
}

.chatbot-header {
    padding: 15px 20px;
    background: var(--primary-color);
    color: white;
    border-radius: 12px 12px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chatbot-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
}

.chatbot-messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.bot-message {
    background: #f3f4f6;
    padding: 10px 15px;
    border-radius: 18px;
    margin-bottom: 10px;
    max-width: 80%;
}

.user-message {
    background: var(--primary-color);
    color: white;
    padding: 10px 15px;
    border-radius: 18px;
    margin-bottom: 10px;
    max-width: 80%;
    margin-left: auto;
}

.chatbot-input {
    padding: 15px 20px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 10px;
}

.chatbot-input input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    outline: none;
}

.chatbot-input button {
    padding: 8px 15px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
}

/* Responsive Design */
@media (max-width: 768px) {
    .hero-headline {
        font-size: 2.5rem;
    }
    
    .hero-subheadline {
        font-size: 1.2rem;
    }
    
    .product-grid {
        grid-template-columns: 1fr;
        gap: 40px;
    }
    
    .reviews-grid {
        grid-template-columns: 1fr;
    }
    
    .contact-methods {
        flex-direction: column;
        align-items: center;
    }
    
    .chatbot-window {
        width: 300px;
        height: 350px;
    }
}

/* RTL Specific Styles */
${isRTL ? `
.reviewer-avatar {
    margin-right: 0;
    margin-left: 15px;
}

.contact-icon {
    margin-right: 0;
    margin-left: 10px;
}

.product-features li {
    padding-left: 0;
    padding-right: 25px;
}

.product-features li::before {
    left: auto;
    right: 0;
}

.rating-count {
    margin-left: 0;
    margin-right: 10px;
}

.original-price,
.discount {
    margin-left: 0;
    margin-right: 15px;
}

.user-message {
    margin-left: 0;
    margin-right: auto;
}
` : ''}
`;
  }

  private generateJavaScript(content: LandingPageContent, options: GenerationOptions): string {
    return `
// Global variables
let currentImageIndex = 0;
let chatbotOpen = false;
let orderTotal = parseFloat('${content.pricing.current}'.replace(/[^0-9.]/g, ''));

// Image gallery functionality
function setActiveImage(index) {
    const images = document.querySelectorAll('.product-image');
    images.forEach((img, i) => {
        img.classList.toggle('active', i === index);
    });
    currentImageIndex = index;
    
    // Track image view
    if (typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', {
            content_type: 'product_image',
            content_ids: ['${content.product.title}'],
            value: orderTotal,
            currency: '${content.pricing.currency}'
        });
    }
}

// Smooth scrolling
function scrollToOrder() {
    document.getElementById('order').scrollIntoView({
        behavior: 'smooth'
    });
    
    // Track CTA click
    if (typeof fbq !== 'undefined') {
        fbq('track', 'InitiateCheckout', {
            content_type: 'product',
            content_ids: ['${content.product.title}'],
            value: orderTotal,
            currency: '${content.pricing.currency}'
        });
    }
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'begin_checkout', {
            currency: '${content.pricing.currency}',
            value: orderTotal,
            items: [{
                item_id: '${content.product.title}',
                item_name: '${content.product.title}',
                category: 'product',
                quantity: 1,
                price: orderTotal
            }]
        });
    }
}

// Update order total
function updateTotal() {
    const quantity = parseInt(document.getElementById('quantity').value);
    const total = orderTotal * quantity;
    document.getElementById('totalAmount').textContent = '${content.pricing.currency === 'USD' ? '$' : ''}' + total.toFixed(2);
}

// Add to cart functionality
function addToCart() {
    // Track add to cart
    if (typeof fbq !== 'undefined') {
        fbq('track', 'AddToCart', {
            content_type: 'product',
            content_ids: ['${content.product.title}'],
            value: orderTotal,
            currency: '${content.pricing.currency}'
        });
    }
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'add_to_cart', {
            currency: '${content.pricing.currency}',
            value: orderTotal,
            items: [{
                item_id: '${content.product.title}',
                item_name: '${content.product.title}',
                category: 'product',
                quantity: 1,
                price: orderTotal
            }]
        });
    }
    
    // Show success message
    alert('Product added to cart! Scroll down to complete your order.');
    scrollToOrder();
}

// Add upsell to cart
function addUpsellToCart(upsellTitle) {
    // Track upsell add to cart
    if (typeof fbq !== 'undefined') {
        fbq('track', 'AddToCart', {
            content_type: 'product',
            content_ids: [upsellTitle],
            value: 29.99, // Default upsell price
            currency: '${content.pricing.currency}'
        });
    }
    
    alert('Upsell added to cart!');
}

// Order form submission
function submitOrder(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const orderData = {
        product: '${content.product.title}',
        customer: {
            name: formData.get('customerName'),
            email: formData.get('customerEmail'),
            phone: formData.get('customerPhone'),
            address: formData.get('customerAddress')
        },
        quantity: parseInt(formData.get('quantity')),
        total: orderTotal * parseInt(formData.get('quantity'))
    };
    
    // Track purchase
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Purchase', {
            content_type: 'product',
            content_ids: ['${content.product.title}'],
            value: orderData.total,
            currency: '${content.pricing.currency}'
        });
    }
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'purchase', {
            transaction_id: 'order_' + Date.now(),
            value: orderData.total,
            currency: '${content.pricing.currency}',
            items: [{
                item_id: '${content.product.title}',
                item_name: '${content.product.title}',
                category: 'product',
                quantity: orderData.quantity,
                price: orderTotal
            }]
        });
    }
    
    // Here you would typically send the order to your backend
    console.log('Order submitted:', orderData);
    
    // Show success message
    alert('Thank you for your order! We will contact you shortly to confirm the details.');
    
    // Reset form
    event.target.reset();
    updateTotal();
}

${content.contact.chatbot ? `
// Chatbot functionality
function toggleChatbot() {
    const window = document.getElementById('chatbotWindow');
    chatbotOpen = !chatbotOpen;
    window.classList.toggle('active', chatbotOpen);
    
    if (chatbotOpen) {
        document.getElementById('chatbotInput').focus();
    }
}

function handleChatbotInput(event) {
    if (event.key === 'Enter') {
        sendChatbotMessage();
    }
}

function sendChatbotMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatbotMessage(message, 'user');
    input.value = '';
    
    // Simulate bot response
    setTimeout(() => {
        const response = generateBotResponse(message);
        addChatbotMessage(response, 'bot');
    }, 1000);
}

function addChatbotMessage(message, sender) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender + '-message';
    messageDiv.textContent = message;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateBotResponse(userMessage) {
    const responses = {
        'price': 'The current price is ${content.pricing.current}. We also offer bulk discounts!',
        'shipping': 'We offer ${content.product.specifications.shipping || 'fast shipping'} to most locations.',
        'warranty': 'This product comes with ${content.product.specifications.warranty || 'a standard warranty'}.',
        'return': 'We have a 30-day return policy for your peace of mind.',
        'support': 'Our customer support team is available 24/7 to help you.',
        'default': 'Thank you for your question! Our team will get back to you shortly. You can also call us or use WhatsApp for immediate assistance.'
    };
    
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
        if (key !== 'default' && lowerMessage.includes(key)) {
            return response;
        }
    }
    
    return responses.default;
}
` : ''}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Set initial image as active
    setActiveImage(0);
    
    // Initialize total
    updateTotal();
    
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.review-card, .upsell-card, .product-info').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Track page view
    if (typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', {
            content_type: 'product',
            content_ids: ['${content.product.title}'],
            value: orderTotal,
            currency: '${content.pricing.currency}'
        });
    }
});

// Handle page visibility for tracking
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        // Track time spent on page
        if (typeof gtag !== 'undefined') {
            gtag('event', 'timing_complete', {
                name: 'page_view_time',
                value: Date.now() - performance.timing.navigationStart
            });
        }
    }
});
`;
  }

  private getTargetAudienceConfig(audience: string): TargetAudience {
    const configs = {
      mena: {
        region: 'mena' as const,
        preferences: {
          visualStyle: 'rich' as const,
          layout: 'aggressive' as const,
          colors: ['#dc2626', '#fbbf24', '#059669'],
          typography: 'Arial, sans-serif'
        }
      },
      america: {
        region: 'america' as const,
        preferences: {
          visualStyle: 'clean' as const,
          layout: 'trustworthy' as const,
          colors: ['#2563eb', '#7c3aed', '#10b981'],
          typography: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }
      },
      europe: {
        region: 'europe' as const,
        preferences: {
          visualStyle: 'clean' as const,
          layout: 'elegant' as const,
          colors: ['#4f46e5', '#6b7280', '#059669'],
          typography: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
        }
      }
    };

    return configs[audience as keyof typeof configs] || configs.america;
  }

  private generateSEOData(
    product: ProductData,
    content: LandingPageContent,
    options: GenerationOptions
  ) {
    return {
      title: `${content.hero.headline} | Best Price & Quality`,
      description: content.hero.subheadline,
      keywords: [
        product.title.toLowerCase(),
        product.brand.toLowerCase(),
        product.category.toLowerCase(),
        'buy online',
        'best price',
        'free shipping'
      ],
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description,
        brand: {
          '@type': 'Brand',
          name: product.brand
        },
        offers: {
          '@type': 'Offer',
          price: parseFloat(product.price.replace(/[^0-9.]/g, '')),
          priceCurrency: product.currency,
          availability: 'https://schema.org/InStock'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewCount
        }
      }
    };
  }

  private createFallbackProduct(url: string): ProductData {
    return {
      id: 'fallback_product',
      title: 'Premium Product',
      description: 'High-quality product with excellent features and reliable performance.',
      price: '$99.99',
      currency: 'USD',
      images: [
        'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      features: ['High Quality', 'Reliable', 'User Friendly'],
      specifications: {},
      brand: 'Premium Brand',
      category: 'General',
      rating: 4.5,
      reviewCount: 100,
      availability: 'in_stock',
      seller: {
        name: 'Trusted Seller',
        rating: 4.8,
        verified: true
      },
      shipping: {
        free: true,
        estimatedDays: '3-7 days'
      }
    };
  }

  private createFallbackContent(): LandingPageContent {
    return {
      hero: {
        headline: 'Premium Product Landing Page',
        subheadline: 'Discover quality and value in one amazing product',
        cta: 'Order Now',
        backgroundImage: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1200'
      },
      product: {
        title: 'Premium Product',
        description: 'High-quality product with excellent features.',
        features: ['High Quality', 'Reliable', 'User Friendly'],
        specifications: {},
        media: []
      },
      pricing: {
        current: '$99.99',
        currency: 'USD'
      },
      reviews: [],
      trustBadges: [],
      upsells: [],
      contact: {
        whatsapp: '',
        messenger: '',
        chatbot: false
      },
      tracking: {
        customEvents: []
      }
    };
  }

  private generateFallbackHTML(url: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Premium Product Landing Page</title>
</head>
<body>
    <h1>Premium Product Landing Page</h1>
    <p>Landing page generation failed. Please try again with a different URL.</p>
    <p>URL provided: ${url}</p>
</body>
</html>`;
  }
}