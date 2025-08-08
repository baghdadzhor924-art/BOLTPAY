import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Download, Eye, Settings, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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

  const landingPageService = LandingPageService.getInstance();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Rocket className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Landing Page Bolt</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform any product URL into a stunning, conversion-optimized landing page using AI
          </p>
        </motion.div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
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
              className="bg-white rounded-2xl shadow-xl p-8"
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
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    {showPreview ? 'Hide' : 'Show'} Code
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

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-6xl mx-auto mt-16"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multiple Templates</h3>
              <p className="text-gray-600">
                Choose from 4 professionally designed templates: Modern, Minimal, Elegant, and Bold.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Content</h3>
              <p className="text-gray-600">
                Generate compelling headlines, descriptions, and call-to-actions using advanced AI.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Generation</h3>
              <p className="text-gray-600">
                Create professional landing pages in seconds with optimized performance and SEO.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}