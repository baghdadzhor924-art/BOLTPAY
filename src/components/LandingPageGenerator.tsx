import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, Eye, Loader2, CheckCircle, AlertCircle,
  Zap, Shield, Globe, Star, Users, TrendingUp, Code, Palette,
  ChevronDown, Play, BookOpen, HelpCircle, Mail, Wand2
} from 'lucide-react';
import { LandingPageGeneratorService } from '../services/landingPageGeneratorService';
import { GenerationOptions, GenerationResult } from '../types';
import Sidebar from './Sidebar';
import HeroSlider from './HeroSlider';

export default function LandingPageGenerator() {
  const [url, setUrl] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [targetMarket, setTargetMarket] = useState('ecommerce');
  const [options, setOptions] = useState<GenerationOptions>({
    template: 'modern',
    language: 'en',
    includeReviews: true,
    includeSocialProof: true
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const landingPageService = LandingPageGeneratorService.getInstance();
  const generatorRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  const targetAudiences = [
    { value: 'mena', label: 'Middle East & North Africa' },
    { value: 'america', label: 'America' },
    { value: 'europe', label: 'Europe' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'E-commerce Owner',
      company: 'Fashion Forward',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      comment: 'This AI tool transformed my product pages completely. Sales increased by 300% in just two weeks!',
      verified: true
    },
    {
      name: 'Michael Chen',
      role: 'Marketing Director',
      company: 'TechStart Inc.',
      avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      comment: 'The quality of landing pages generated is incredible. It saved us thousands in design costs.',
      verified: true
    },
    {
      name: 'Emily Rodriguez',
      role: 'Small Business Owner',
      company: 'Artisan Crafts',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      comment: 'As a non-technical person, this tool made it so easy to create professional pages. Highly recommend!',
      verified: true
    },
    {
      name: 'David Thompson',
      role: 'Digital Marketer',
      company: 'Growth Agency',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 4,
      comment: 'Great tool for rapid prototyping. The AI understands conversion principles really well.',
      verified: true
    },
    {
      name: 'Lisa Wang',
      role: 'Startup Founder',
      company: 'HealthTech Solutions',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      comment: 'This platform helped us launch faster and with better-converting pages than we could have built ourselves.',
      verified: true
    },
    {
      name: 'James Wilson',
      role: 'Product Manager',
      company: 'SaaS Innovations',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      comment: 'The multi-language support and SEO optimization features are outstanding. Perfect for global markets.',
      verified: true
    }
  ];
  
  const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement>, sectionName: string) => {
    setActiveSection(sectionName);
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSidebarNavigation = (route: string, id: string) => {
    console.log(`Navigating to ${route} (${id})`);
    setActiveSection(id);
    
    // Handle specific navigation cases
    if (id === 'generate') {
      scrollToSection(generatorRef, 'generator');
    } else if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // For other routes, you can implement routing logic here
      // For now, just log the navigation
      console.log(`Would navigate to ${route}`);
    }
  };

  const handleGenerate = async () => {
    if (!url.trim()) {
      setError('Please enter a product URL');
      return;
    }
    
    if (!targetAudience) {
      setError('Please select a target audience');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const generationResult = await landingPageService.generateLandingPage(url, options);
      setResult(generationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const blob = new Blob([result.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `landing-page-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreview = () => {
    if (!result) return;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(result.html);
      newWindow.document.close();
    }
  };

  const templates = [
    {
      name: 'Modern',
      value: 'modern',
      description: 'Clean design with blue-purple gradients',
      preview: 'bg-gradient-to-br from-blue-500 to-purple-600'
    },
    {
      name: 'Minimal',
      value: 'minimal',
      description: 'Simple and elegant with subtle colors',
      preview: 'bg-gradient-to-br from-gray-400 to-gray-600'
    },
    {
      name: 'Elegant',
      value: 'elegant',
      description: 'Sophisticated dark theme with gold accents',
      preview: 'bg-gradient-to-br from-gray-900 to-yellow-600'
    },
    {
      name: 'Bold',
      value: 'bold',
      description: 'High-impact design with red gradients',
      preview: 'bg-gradient-to-br from-red-500 to-red-700'
    }
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast Generation',
      description: 'Create professional landing pages in under 5 seconds with our optimized AI engine.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Enterprise Security',
      description: 'Your data is protected with enterprise-grade security and privacy measures.'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Multi-Language Support',
      description: 'Generate landing pages in multiple languages with proper RTL support.'
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Premium Templates',
      description: 'Choose from professionally designed templates optimized for conversions.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Social Proof Integration',
      description: 'Automatically include testimonials and social proof to boost credibility.'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'SEO Optimized',
      description: 'Every page is optimized for search engines with proper meta tags and structure.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Pages Generated' },
    { number: '95%', label: 'Conversion Rate' },
    { number: '50+', label: 'Countries Served' },
    { number: '24/7', label: 'Support Available' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar onNavigate={handleSidebarNavigation} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Hero Section with Slider */}
        <section className="relative h-screen">
          <HeroSlider />
        </section>

        {/* Generator Section */}
        <section ref={generatorRef} className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">AI-Powered Landing Page Generator</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Enter any product URL and watch AI create a professional landing page in seconds
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200">
                {/* URL Input */}
                <div className="mb-6">
                  <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Product URL
                  </label>
                  <input
                    id="productUrl"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/product-page"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={isGenerating}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the URL of the product you want to create a landing page for
                  </p>
                </div>

                {/* Target Audience Selection */}
                <div className="mb-6">
                  <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <select
                    id="targetAudience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={isGenerating}
                  >
                    <option value="">Select target audience</option>
                    {targetAudiences.map((audience) => (
                      <option key={audience.value} value={audience.value}>
                        {audience.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose your primary target audience for optimized content
                  </p>
                </div>

                {/* Target Market Selection */}
                <div className="mb-6">
                  <label htmlFor="targetCountry" className="block text-sm font-medium text-gray-700 mb-2">
                    Target Country
                  </label>
                  <select
                    id="targetCountry"
                    value={targetMarket}
                    onChange={(e) => setTargetMarket(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={isGenerating}
                  >
                    {targetCountries.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Select your target country for localized content
                  </p>
                </div>

                {/* Additional Options */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includeReviews}
                      onChange={(e) => setOptions({ ...options, includeReviews: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isGenerating}
                    />
                    <span className="ml-2 text-sm text-gray-700">Include Customer Reviews</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includeUpsells}
                      onChange={(e) => setOptions({ ...options, includeUpsells: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isGenerating}
                    />
                    <span className="ml-2 text-sm text-gray-700">Include Upsell Products</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includeTrustBadges}
                      onChange={(e) => setOptions({ ...options, includeTrustBadges: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isGenerating}
                    />
                    <span className="ml-2 text-sm text-gray-700">Include Trust Badges</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.enableTracking}
                      onChange={(e) => setOptions({ ...options, enableTracking: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isGenerating}
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Analytics Tracking</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.shopifyIntegration}
                      onChange={(e) => setOptions({ ...options, shopifyIntegration: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isGenerating}
                    />
                    <span className="ml-2 text-sm text-gray-700">Shopify Integration</span>
                  </label>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !url.trim() || !targetAudience}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Landing Page...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Generate Landing Page
                    </>
                  )}
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
                >
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                </motion.div>
              )}

              {/* Success Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
                >
                  <div className="flex items-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900">Landing Page Generated!</h2>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Product</div>
                      <div className="font-semibold text-gray-900">{result.productData.title}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Generation Time</div>
                      <div className="font-semibold text-gray-900">{result.generationTime}ms</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Validation Score</div>
                      <div className="font-semibold text-gray-900">{(result.validationScore * 100).toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Media Processed</div>
                      <div className="font-semibold text-gray-900">{result.mediaProcessed} images</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">SEO Optimized</div>
                      <div className="font-semibold text-gray-900">
                        {result.seoData ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={handlePreview}
                      className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download HTML
                    </button>
                    {result.integrations.shopify && (
                      <a
                        href={result.integrations.shopify.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        View in Shopify
                      </a>
                    )}
                  </div>

                  {/* Warnings and Errors */}
                  {result.warnings && result.warnings.length > 0 && (
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Warnings:</h4>
                      <ul className="list-disc list-inside text-yellow-700 text-sm">
                        {result.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Errors:</h4>
                      <ul className="list-disc list-inside text-red-700 text-sm">
                        {result.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* HTML Preview */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Generated HTML Code</h3>
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                      >
                        {showPreview ? 'Hide' : 'Show'} Code
                        <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${showPreview ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    {showPreview && (
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-green-400 text-sm">
                          <code>{result.html.substring(0, 500)}...</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to create high-converting landing pages with professional quality
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section ref={templatesRef} className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Hear from thousands of satisfied customers who have transformed their business with our AI-powered landing pages
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-center mb-6">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-4">"{testimonial.comment}"</p>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{testimonial.company}</span>
                    {testimonial.verified && (
                      <span className="ml-2 text-green-600">✓ Verified</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section ref={pricingRef} className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Start free and upgrade as you grow. No hidden fees, cancel anytime.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-8 shadow-lg"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">$0<span className="text-lg text-gray-600">/month</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    5 landing pages/month
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Basic templates
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Mock data generation
                  </li>
                </ul>
                <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  Get Started
                </button>
              </motion.div>

              {/* Pro Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-8 shadow-lg border-2 border-blue-500 relative"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Pro</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">$29<span className="text-lg text-gray-600">/month</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Unlimited landing pages
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    All premium templates
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Real data scraping
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    AI content generation
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Priority support
                  </li>
                </ul>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Start Pro Trial
                </button>
              </motion.div>

              {/* Enterprise Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-8 shadow-lg"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">$99<span className="text-lg text-gray-600">/month</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Everything in Pro
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Custom templates
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    API access
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    White-label solution
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Dedicated support
                  </li>
                </ul>
                <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                  Contact Sales
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section ref={aboutRef} className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">About Landing Page Bolt</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're on a mission to make high-quality landing page creation accessible to everyone through the power of AI
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Founded in 2024, Landing Page Bolt was born from the frustration of seeing great products 
                  fail due to poor landing pages. We believe every entrepreneur and business should have 
                  access to professional-quality landing pages without the need for expensive designers 
                  or developers.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our AI-powered platform combines cutting-edge technology with proven conversion 
                  optimization principles to create landing pages that not only look great but also 
                  drive results.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Code className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-gray-700">AI-Powered</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-gray-700">Secure</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-gray-700">Global</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Us?</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                      <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Lightning Fast</h4>
                      <p className="text-gray-600 text-sm">Generate professional pages in under 5 seconds</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Conversion Optimized</h4>
                      <p className="text-gray-600 text-sm">Built with proven conversion principles</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4 mt-1">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Trusted by Thousands</h4>
                      <p className="text-gray-600 text-sm">Join 10,000+ satisfied customers worldwide</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about Landing Page Bolt
              </p>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  question: "How does the AI landing page generation work?",
                  answer: "Our AI analyzes your product URL, extracts key information, and generates compelling content using advanced language models. It then applies this content to professionally designed templates optimized for conversions."
                },
                {
                  question: "Can I customize the generated landing pages?",
                  answer: "Yes! You can choose from multiple templates, languages, and customize various options like including reviews and social proof. The generated HTML can also be further customized with your own CSS and content."
                },
                {
                  question: "What types of URLs are supported?",
                  answer: "We support most e-commerce URLs including Amazon, eBay, Shopify stores, and many others. For testing purposes, you can also use demo URLs that will generate mock data."
                },
                {
                  question: "Is my data secure?",
                  answer: "Absolutely. We use enterprise-grade security measures to protect your data. We don't store your product URLs or generated content permanently, and all API communications are encrypted."
                },
                {
                  question: "Can I use this for commercial purposes?",
                  answer: "Yes! All generated landing pages can be used for commercial purposes. You own the generated content and can use it however you like for your business."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-start">
                    <HelpCircle className="w-6 h-6 text-blue-600 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Create Your First Landing Page?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of entrepreneurs and businesses who trust Landing Page Bolt 
                to create high-converting landing pages in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => scrollToSection(generatorRef, 'generator')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  Start Creating Now
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Sales
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Wand2 className="w-8 h-8 text-blue-400" />
                  <span className="text-xl font-bold">Landing Page Bolt</span>
                </div>
                <p className="text-gray-400 mb-4" dir="rtl">
                  أنشئ صفحات هبوط مذهلة ومحسنة للتحويل بقوة الذكاء الاصطناعي.
                </p>
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                    <span className="text-sm">𝕏</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                    <span className="text-sm">in</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                    <span className="text-sm">f</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Landing Page Bolt. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}