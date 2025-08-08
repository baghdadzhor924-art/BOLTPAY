import { ScrapedProduct, AIGeneratedContent, GenerationOptions, SEOData } from '../types';

interface GenerateHTMLParams {
  product: ScrapedProduct;
  aiContent: AIGeneratedContent;
  processedImages: string[];
  seoData: SEOData;
  options: GenerationOptions;
}

export function generateHTML(params: GenerateHTMLParams): string {
  const { product, aiContent, processedImages, seoData, options } = params;
  
  const templateStyles = getTemplateStyles(options.template);
  const isRTL = options.language === 'ar';
  
  return `<!DOCTYPE html>
<html lang="${options.language}" ${isRTL ? 'dir="rtl"' : ''}>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${seoData.title}</title>
    <meta name="description" content="${seoData.description}">
    <meta name="keywords" content="${seoData.keywords.join(', ')}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${seoData.ogTitle}">
    <meta property="og:description" content="${seoData.ogDescription}">
    <meta property="og:image" content="${seoData.ogImage}">
    <meta property="og:type" content="product">
    <meta property="og:url" content="${product.url}">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${seoData.ogTitle}">
    <meta name="twitter:description" content="${seoData.ogDescription}">
    <meta name="twitter:image" content="${seoData.ogImage}">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>">
    
    <style>
        ${getBaseStyles()}
        ${templateStyles}
        ${isRTL ? getRTLStyles() : ''}
    </style>
</head>
<body>
    ${generateHeader(aiContent, options)}
    ${generateHeroSection(aiContent, processedImages, options)}
    ${generateFeaturesSection(aiContent, options)}
    ${generateBenefitsSection(aiContent, options)}
    ${options.includeReviews ? generateTestimonialsSection(aiContent, options) : ''}
    ${options.includeSocialProof ? generateSocialProofSection(aiContent, options) : ''}
    ${generateCTASection(aiContent, product, options)}
    ${generateFooter(options)}
    
    <script>
        ${getInteractivityScript()}
    </script>
</body>
</html>`;
}

function getTemplateStyles(template: string): string {
  const styles = {
    modern: `
      :root {
        --primary-color: #667eea;
        --secondary-color: #764ba2;
        --accent-color: #fbbf24;
        --text-color: #1f2937;
        --bg-color: #ffffff;
        --section-bg: #f9fafb;
      }
      .hero-gradient { background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%); }
      .btn-primary { background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%); }
    `,
    minimal: `
      :root {
        --primary-color: #6b7280;
        --secondary-color: #9ca3af;
        --accent-color: #10b981;
        --text-color: #374151;
        --bg-color: #ffffff;
        --section-bg: #f9fafb;
      }
      .hero-gradient { background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); }
      .btn-primary { background: var(--accent-color); }
    `,
    elegant: `
      :root {
        --primary-color: #1f2937;
        --secondary-color: #374151;
        --accent-color: #d97706;
        --text-color: #f9fafb;
        --bg-color: #111827;
        --section-bg: #1f2937;
      }
      .hero-gradient { background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%); }
      .btn-primary { background: linear-gradient(135deg, var(--accent-color) 0%, #f59e0b 100%); }
      body { background-color: var(--bg-color); color: var(--text-color); }
    `,
    bold: `
      :root {
        --primary-color: #dc2626;
        --secondary-color: #b91c1c;
        --accent-color: #fbbf24;
        --text-color: #1f2937;
        --bg-color: #ffffff;
        --section-bg: #fef2f2;
      }
      .hero-gradient { background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%); }
      .btn-primary { background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%); }
    `
  };
  
  return styles[template as keyof typeof styles] || styles.modern;
}

function getBaseStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      background-color: var(--bg-color);
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    .section {
      padding: 80px 0;
    }
    
    .section-alt {
      background-color: var(--section-bg);
    }
    
    h1, h2, h3 {
      font-weight: 700;
      margin-bottom: 1rem;
    }
    
    h1 { font-size: 3rem; line-height: 1.2; }
    h2 { font-size: 2.5rem; line-height: 1.3; }
    h3 { font-size: 1.5rem; line-height: 1.4; }
    
    p { margin-bottom: 1rem; font-size: 1.1rem; }
    
    .btn {
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
    
    .btn-primary {
      color: white;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }
    
    .grid {
      display: grid;
      gap: 2rem;
    }
    
    .grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
    .grid-3 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
    
    .card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-5px);
    }
    
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      text-align: center;
      color: white;
    }
    
    .hero-content {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .product-image {
      width: 100%;
      max-width: 500px;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      margin: 2rem auto;
      display: block;
    }
    
    .testimonial {
      text-align: center;
      padding: 2rem;
    }
    
    .rating {
      color: #fbbf24;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    
    .social-proof {
      text-align: center;
      padding: 3rem 0;
    }
    
    .stats {
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .stat {
      text-align: center;
    }
    
    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-color);
    }
    
    .stat-label {
      font-size: 1rem;
      color: var(--secondary-color);
    }
    
    @media (max-width: 768px) {
      h1 { font-size: 2rem; }
      h2 { font-size: 1.8rem; }
      .section { padding: 40px 0; }
      .container { padding: 0 15px; }
      .hero { min-height: 80vh; }
    }
  `;
}

function getRTLStyles(): string {
  return `
    body { direction: rtl; }
    .grid { direction: ltr; }
    .card { direction: rtl; }
  `;
}

function generateHeader(aiContent: AIGeneratedContent, options: GenerationOptions): string {
  const navText = options.language === 'ar' 
    ? { home: 'الرئيسية', features: 'المميزات', reviews: 'التقييمات', contact: 'اتصل بنا' }
    : { home: 'Home', features: 'Features', reviews: 'Reviews', contact: 'Contact' };
    
  return `
    <header style="position: fixed; top: 0; width: 100%; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); z-index: 1000; padding: 1rem 0;">
      <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">
          🚀 LandingPage
        </div>
        <nav style="display: flex; gap: 2rem;">
          <a href="#home" style="text-decoration: none; color: var(--text-color); font-weight: 500;">${navText.home}</a>
          <a href="#features" style="text-decoration: none; color: var(--text-color); font-weight: 500;">${navText.features}</a>
          ${options.includeReviews ? `<a href="#reviews" style="text-decoration: none; color: var(--text-color); font-weight: 500;">${navText.reviews}</a>` : ''}
        </nav>
      </div>
    </header>
  `;
}

function generateHeroSection(aiContent: AIGeneratedContent, images: string[], options: GenerationOptions): string {
  return `
    <section id="home" class="hero hero-gradient">
      <div class="container">
        <div class="hero-content">
          <h1 style="margin-bottom: 1.5rem;">${aiContent.headline}</h1>
          <p style="font-size: 1.3rem; margin-bottom: 2rem; opacity: 0.9;">${aiContent.subheadline}</p>
          ${images.length > 0 ? `<img src="${images[0]}" alt="Product Image" class="product-image" loading="lazy">` : ''}
          <div style="margin-top: 2rem;">
            <a href="#cta" class="btn btn-primary" style="margin-right: 1rem;">${aiContent.callToAction}</a>
            <a href="#features" class="btn" style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white;">
              ${options.language === 'ar' ? 'اعرف المزيد' : 'Learn More'}
            </a>
          </div>
        </div>
      </div>
    </section>
  `;
}

function generateFeaturesSection(aiContent: AIGeneratedContent, options: GenerationOptions): string {
  const sectionTitle = options.language === 'ar' ? 'المميزات الرئيسية' : 'Key Features';
  
  return `
    <section id="features" class="section">
      <div class="container">
        <h2 style="text-align: center; margin-bottom: 3rem;">${sectionTitle}</h2>
        <div class="grid grid-3">
          ${aiContent.features.map((feature, index) => `
            <div class="card">
              <div style="font-size: 2rem; margin-bottom: 1rem;">✨</div>
              <h3>${feature}</h3>
              <p>${options.language === 'ar' ? 'ميزة متقدمة تضمن لك أفضل تجربة استخدام' : 'Advanced feature ensuring the best user experience'}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function generateBenefitsSection(aiContent: AIGeneratedContent, options: GenerationOptions): string {
  const sectionTitle = options.language === 'ar' ? 'الفوائد التي ستحصل عليها' : 'Benefits You\'ll Get';
  
  return `
    <section class="section section-alt">
      <div class="container">
        <h2 style="text-align: center; margin-bottom: 3rem;">${sectionTitle}</h2>
        <div class="grid grid-2">
          ${aiContent.benefits.map((benefit, index) => `
            <div style="display: flex; align-items: center; margin-bottom: 1.5rem;">
              <div style="background: var(--accent-color); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 1rem; font-weight: 700;">
                ${index + 1}
              </div>
              <div>
                <h3 style="margin-bottom: 0.5rem;">${benefit}</h3>
                <p style="margin: 0; opacity: 0.8;">${options.language === 'ar' ? 'فائدة مهمة تحسن من تجربتك' : 'Important benefit that improves your experience'}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function generateTestimonialsSection(aiContent: AIGeneratedContent, options: GenerationOptions): string {
  const sectionTitle = options.language === 'ar' ? 'آراء العملاء' : 'Customer Reviews';
  
  return `
    <section id="reviews" class="section">
      <div class="container">
        <h2 style="text-align: center; margin-bottom: 3rem;">${sectionTitle}</h2>
        <div class="grid grid-3">
          ${aiContent.testimonials.map(testimonial => `
            <div class="testimonial card">
              <div class="rating">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</div>
              <p style="font-style: italic; margin-bottom: 1.5rem;">"${testimonial.comment}"</p>
              <div style="font-weight: 600;">${testimonial.name}</div>
              ${testimonial.verified ? `<div style="color: var(--accent-color); font-size: 0.9rem; margin-top: 0.5rem;">✓ ${options.language === 'ar' ? 'مشتري موثق' : 'Verified Purchase'}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function generateSocialProofSection(aiContent: AIGeneratedContent, options: GenerationOptions): string {
  const labels = options.language === 'ar' 
    ? { customers: 'عميل راضي', rating: 'تقييم', countries: 'دولة', users: 'مستخدم شهرياً' }
    : { customers: 'Happy Customers', rating: 'Average Rating', countries: 'Countries', users: 'Monthly Users' };
    
  return `
    <section class="social-proof section-alt">
      <div class="container">
        <h2 style="text-align: center; margin-bottom: 2rem;">${options.language === 'ar' ? 'أرقام تتحدث عن نفسها' : 'Numbers That Speak'}</h2>
        <div class="stats">
          <div class="stat">
            <div class="stat-number">${aiContent.socialProof.totalCustomers.toLocaleString()}</div>
            <div class="stat-label">${labels.customers}</div>
          </div>
          <div class="stat">
            <div class="stat-number">${aiContent.socialProof.averageRating}</div>
            <div class="stat-label">${labels.rating}</div>
          </div>
          <div class="stat">
            <div class="stat-number">${aiContent.socialProof.countriesServed}</div>
            <div class="stat-label">${labels.countries}</div>
          </div>
          <div class="stat">
            <div class="stat-number">${aiContent.socialProof.monthlyUsers.toLocaleString()}</div>
            <div class="stat-label">${labels.users}</div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function generateCTASection(aiContent: AIGeneratedContent, product: ScrapedProduct, options: GenerationOptions): string {
  const ctaText = options.language === 'ar' 
    ? { title: 'احصل عليه الآن!', subtitle: 'لا تفوت هذه الفرصة الذهبية', price: 'السعر:', guarantee: 'ضمان استرداد المال لمدة 30 يوماً' }
    : { title: 'Get It Now!', subtitle: 'Don\'t miss this golden opportunity', price: 'Price:', guarantee: '30-day money-back guarantee' };
    
  return `
    <section id="cta" class="section hero-gradient" style="color: white; text-align: center;">
      <div class="container">
        <h2 style="margin-bottom: 1rem;">${ctaText.title}</h2>
        <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9;">${ctaText.subtitle}</p>
        <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem;">${ctaText.price} ${product.price}</div>
        <div style="margin-bottom: 2rem;">
          <a href="${product.url}" class="btn" style="background: white; color: var(--primary-color); font-size: 1.3rem; padding: 20px 40px;" target="_blank">
            ${aiContent.callToAction}
          </a>
        </div>
        <p style="font-size: 0.9rem; opacity: 0.8;">✓ ${ctaText.guarantee}</p>
      </div>
    </section>
  `;
}

function generateFooter(options: GenerationOptions): string {
  const footerText = options.language === 'ar' 
    ? 'تم إنشاؤها بواسطة مولد صفحات الهبوط المدعوم بالذكاء الاصطناعي'
    : 'Generated by AI-Powered Landing Page Generator';
    
  return `
    <footer style="background: var(--primary-color); color: white; text-align: center; padding: 2rem 0;">
      <div class="container">
        <p>${footerText}</p>
        <p style="margin-top: 1rem; opacity: 0.8;">© ${new Date().getFullYear()} Landing Page Bolt. All rights reserved.</p>
      </div>
    </footer>
  `;
}

function getInteractivityScript(): string {
  return `
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Lazy loading for images
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }

    // Header background on scroll
    window.addEventListener('scroll', () => {
      const header = document.querySelector('header');
      if (window.scrollY > 100) {
        header.style.background = 'rgba(255,255,255,0.98)';
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      } else {
        header.style.background = 'rgba(255,255,255,0.95)';
        header.style.boxShadow = 'none';
      }
    });

    // Add animation on scroll
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

    // Observe all cards and sections
    document.querySelectorAll('.card, .section').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });

    // Button click tracking
    document.querySelectorAll('.btn-primary').forEach(btn => {
      btn.addEventListener('click', () => {
        console.log('CTA button clicked');
        // Add analytics tracking here
      });
    });
  `;
}