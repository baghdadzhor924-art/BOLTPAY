import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, Download, Eye, Settings, Loader2, CheckCircle, AlertCircle,
  Zap, Shield, Globe, Star, Users, TrendingUp, Code, Palette,
  Menu, X, ChevronDown, Play, BookOpen, HelpCircle, Mail
} from 'lucide-react';
import { LandingPageService } from '../services/landingPageService';
import { GenerationOptions, GenerationResult } from '../types';

export default function LandingPageGenerator() {
  const [url, setUrl] = useState('');
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('generator');

  const landingPageService = LandingPageService.getInstance();
  const generatorRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement>, sectionName: string) => {
    setActiveSection(sectionName);
    setMobileMenuOpen(false);
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    if (!url.trim()) {
      setError('Please enter a valid product URL');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Rocket className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Landing Page Bolt</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection(generatorRef, 'generator')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'generator' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Generator
              </button>
              <button
                onClick={() => scrollToSection(featuresRef, 'features')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'features' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection(templatesRef, 'templates')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'templates' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => scrollToSection(pricingRef, 'pricing')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'pricing' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection(aboutRef, 'about')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'about' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                About
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden py-4 border-t border-gray-200"
            >
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => scrollToSection(generatorRef, 'generator')}
                  className="text-left text-gray-600 hover:text-blue-600 font-medium"
                >
                  Generator
                </button>
                <button
                  onClick={() => scrollToSection(featuresRef, 'features')}
                  className="text-left text-gray-600 hover:text-blue-600 font-medium"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection(templatesRef, 'templates')}
                  className="text-left text-gray-600 hover:text-blue-600 font-medium"
                >
                  Templates
                </button>
                <button
                  onClick={() => scrollToSection(pricingRef, 'pricing')}
                  className="text-left text-gray-600 hover:text-blue-600 font-medium"
                >
                  Pricing
                </button>
                <button
                  onClick={() => scrollToSection(aboutRef, 'about')}
                  className="text-left text-gray-600 hover:text-blue-600 font-medium"
                >
                  About
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Create Stunning
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {' '}Landing Pages
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Transform any product URL into a conversion-optimized landing page using advanced AI technology. 
                No coding required, professional results guaranteed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => scrollToSection(generatorRef, 'generator')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Creating
                </button>
                <button
                  onClick={() => scrollToSection(featuresRef, 'features')}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-200 flex items-center justify-center"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Learn More
                </button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Generator Section */}
        <section ref={generatorRef} className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">AI Landing Page Generator</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Enter any product URL and watch our AI create a professional landing page in seconds
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
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                    Product URL
                  </label>
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/product"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={isGenerating}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter any product URL (Amazon, eBay, etc.) or use test URLs like "test.com/product" for demo
                  </p>
                </div>

                {/* Options Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Style
                    </label>
                    <select
                      value={options.template}
                      onChange={(e) => setOptions({ ...options, template: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isGenerating}
                    >
                      <option value="modern">Modern (Blue/Purple)</option>
                      <option value="minimal">Minimal (Clean/Simple)</option>
                      <option value="elegant">Elegant (Dark/Gold)</option>
                      <option value="bold">Bold (Red/Dynamic)</option>
                    </select>
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={options.language}
                      onChange={(e) => setOptions({ ...options, language: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isGenerating}
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية (Arabic)</option>
                    </select>
                  </div>
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
                      checked={options.includeSocialProof}
                      onChange={(e) => setOptions({ ...options, includeSocialProof: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isGenerating}
                    />
                    <span className="ml-2 text-sm text-gray-700">Include Social Proof</span>
                  </label>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !url.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Landing Page...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5 mr-2" />
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
                      <div className="font-semibold text-gray-900">{result.productTitle}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Generation Time</div>
                      <div className="font-semibold text-gray-900">{result.generationTime}ms</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Data Source</div>
                      <div className="font-semibold text-gray-900">
                        {result.isRealData ? 'Real Data' : 'Mock Data'}
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
                  </div>

                  {/* HTML Preview */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Generated HTML</h3>
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                      >
                        {showPreview ? 'Hide' : 'Show'} Code
                        <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showPreview ? 'rotate-180' : ''}`} />
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
        <section ref={featuresRef} className="py-20 px-4 bg-gray-50">
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

        {/* Templates Section */}
        <section ref={templatesRef} className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Beautiful Templates</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose from professionally designed templates optimized for different industries and conversion goals
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {templates.map((template, index) => (
                <motion.div
                  key={template.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className={`h-32 ${template.preview} flex items-center justify-center`}>
                    <Palette className="w-8 h-8 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                    <button
                      onClick={() => setOptions({ ...options, template: template.value as any })}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        options.template === template.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {options.template === template.value ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section ref={pricingRef} className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Start for free and upgrade as you grow. No hidden fees, cancel anytime.
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
        <section ref={aboutRef} className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">About Landing Page Bolt</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're on a mission to democratize high-quality landing page creation through the power of AI
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
        <section className="py-20 px-4 bg-gray-50">
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
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
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
                  <Rocket className="w-5 h-5 mr-2" />
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
                  <Rocket className="w-8 h-8 text-blue-400" />
                  <span className="text-xl font-bold">Landing Page Bolt</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Create stunning, conversion-optimized landing pages with the power of AI.
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