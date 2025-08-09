import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, Eye, EyeOff, Save, AlertCircle, CheckCircle, 
  Settings, Shield, Globe, Image, ShoppingCart, MessageCircle 
} from 'lucide-react';

interface ApiKey {
  key: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  required: boolean;
  placeholder: string;
}

const apiKeys: ApiKey[] = [
  // Search APIs
  {
    key: 'VITE_SERP_API_KEY',
    name: 'SerpAPI Key',
    description: 'For Google Shopping, Amazon, eBay product searches',
    icon: <Globe className="w-5 h-5" />,
    category: 'Search APIs',
    required: true,
    placeholder: 'Enter your SerpAPI key'
  },
  {
    key: 'VITE_AMAZON_API_KEY',
    name: 'Amazon Product API',
    description: 'Amazon Product Advertising API for detailed product data',
    icon: <ShoppingCart className="w-5 h-5" />,
    category: 'Search APIs',
    required: false,
    placeholder: 'Enter your Amazon API key'
  },
  {
    key: 'VITE_EBAY_API_KEY',
    name: 'eBay Finding API',
    description: 'eBay Finding API for product searches',
    icon: <ShoppingCart className="w-5 h-5" />,
    category: 'Search APIs',
    required: false,
    placeholder: 'Enter your eBay API key'
  },
  {
    key: 'VITE_ALIEXPRESS_API_KEY',
    name: 'AliExpress API',
    description: 'AliExpress API for product data',
    icon: <ShoppingCart className="w-5 h-5" />,
    category: 'Search APIs',
    required: false,
    placeholder: 'Enter your AliExpress API key'
  },

  // Image Analysis APIs
  {
    key: 'VITE_GOOGLE_VISION_API_KEY',
    name: 'Google Vision API',
    description: 'For image analysis, label detection, and text extraction',
    icon: <Image className="w-5 h-5" />,
    category: 'Image Analysis',
    required: true,
    placeholder: 'Enter your Google Vision API key'
  },
  {
    key: 'VITE_CLARIFAI_API_KEY',
    name: 'Clarifai API',
    description: 'For advanced image classification and filtering',
    icon: <Image className="w-5 h-5" />,
    category: 'Image Analysis',
    required: false,
    placeholder: 'Enter your Clarifai API key'
  },

  // Media Processing
  {
    key: 'VITE_REMOVE_BG_API_KEY',
    name: 'Remove.bg API',
    description: 'For automatic background removal from product images',
    icon: <Image className="w-5 h-5" />,
    category: 'Media Processing',
    required: false,
    placeholder: 'Enter your Remove.bg API key'
  },
  {
    key: 'VITE_CLOUDINARY_URL',
    name: 'Cloudinary URL',
    description: 'For image hosting, optimization, and delivery',
    icon: <Image className="w-5 h-5" />,
    category: 'Media Processing',
    required: true,
    placeholder: 'cloudinary://api_key:api_secret@cloud_name'
  },

  // AI Content Generation
  {
    key: 'VITE_GROQ_API_KEY',
    name: 'Groq API Key',
    description: 'For AI content generation using Mixtral model',
    icon: <Settings className="w-5 h-5" />,
    category: 'AI Services',
    required: true,
    placeholder: 'Enter your Groq API key'
  },

  // E-commerce Integration
  {
    key: 'VITE_SHOPIFY_API_KEY',
    name: 'Shopify API Key',
    description: 'For Shopify store integration and product management',
    icon: <ShoppingCart className="w-5 h-5" />,
    category: 'E-commerce',
    required: false,
    placeholder: 'Enter your Shopify API key'
  },
  {
    key: 'VITE_SHOPIFY_STORE_URL',
    name: 'Shopify Store URL',
    description: 'Your Shopify store URL (e.g., your-store.myshopify.com)',
    icon: <ShoppingCart className="w-5 h-5" />,
    category: 'E-commerce',
    required: false,
    placeholder: 'your-store.myshopify.com'
  },

  // Communication APIs
  {
    key: 'VITE_WHATSAPP_API_KEY',
    name: 'WhatsApp Business API',
    description: 'For WhatsApp Business integration',
    icon: <MessageCircle className="w-5 h-5" />,
    category: 'Communication',
    required: false,
    placeholder: 'Enter your WhatsApp API key'
  },
  {
    key: 'VITE_WHATSAPP_NUMBER',
    name: 'WhatsApp Number',
    description: 'Your WhatsApp Business number (with country code)',
    icon: <MessageCircle className="w-5 h-5" />,
    category: 'Communication',
    required: false,
    placeholder: '+1234567890'
  },
  {
    key: 'VITE_FACEBOOK_MESSENGER_API_KEY',
    name: 'Facebook Messenger API',
    description: 'For Facebook Messenger integration',
    icon: <MessageCircle className="w-5 h-5" />,
    category: 'Communication',
    required: false,
    placeholder: 'Enter your Messenger API key'
  },
  {
    key: 'VITE_MESSENGER_URL',
    name: 'Messenger URL',
    description: 'Your Facebook Messenger page URL',
    icon: <MessageCircle className="w-5 h-5" />,
    category: 'Communication',
    required: false,
    placeholder: 'https://m.me/yourpage'
  },
  {
    key: 'VITE_CHATBOT_API_KEY',
    name: 'Chatbot API Key',
    description: 'For AI chatbot integration',
    icon: <MessageCircle className="w-5 h-5" />,
    category: 'Communication',
    required: false,
    placeholder: 'Enter your Chatbot API key'
  },

  // Analytics
  {
    key: 'VITE_FACEBOOK_PIXEL_ID',
    name: 'Facebook Pixel ID',
    description: 'For Facebook advertising and conversion tracking',
    icon: <Settings className="w-5 h-5" />,
    category: 'Analytics',
    required: false,
    placeholder: 'Enter your Facebook Pixel ID'
  },
  {
    key: 'VITE_GOOGLE_ANALYTICS_ID',
    name: 'Google Analytics ID',
    description: 'For website analytics and tracking',
    icon: <Settings className="w-5 h-5" />,
    category: 'Analytics',
    required: false,
    placeholder: 'G-XXXXXXXXXX'
  }
];

export default function ApiKeySettings() {
  const [apiKeyValues, setApiKeyValues] = useState<Record<string, string>>({});
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({});
  const [saveMessage, setSaveMessage] = useState<string>('');

  // Load saved API keys from localStorage on component mount
  useEffect(() => {
    const saved: Record<string, string> = {};
    apiKeys.forEach(apiKey => {
      const value = localStorage.getItem(apiKey.key);
      if (value) {
        saved[apiKey.key] = value;
      }
    });
    setApiKeyValues(saved);
  }, []);

  const handleKeyChange = (keyName: string, value: string) => {
    setApiKeyValues(prev => ({
      ...prev,
      [keyName]: value
    }));
  };

  const toggleKeyVisibility = (keyName: string) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const saveApiKey = (keyName: string) => {
    const value = apiKeyValues[keyName];
    if (value) {
      localStorage.setItem(keyName, value);
      setSavedKeys(prev => ({ ...prev, [keyName]: true }));
      setSaveMessage(`${keyName} saved successfully!`);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const saveAllKeys = () => {
    let savedCount = 0;
    Object.entries(apiKeyValues).forEach(([key, value]) => {
      if (value.trim()) {
        localStorage.setItem(key, value);
        savedCount++;
      }
    });
    
    setSavedKeys(prev => {
      const newSaved = { ...prev };
      Object.keys(apiKeyValues).forEach(key => {
        if (apiKeyValues[key].trim()) {
          newSaved[key] = true;
        }
      });
      return newSaved;
    });

    setSaveMessage(`${savedCount} API keys saved successfully!`);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const getKeyStatus = (keyName: string) => {
    const value = apiKeyValues[keyName];
    const isSaved = savedKeys[keyName];
    
    if (!value) return 'empty';
    if (isSaved) return 'saved';
    return 'unsaved';
  };

  const groupedKeys = apiKeys.reduce((groups, apiKey) => {
    if (!groups[apiKey.category]) {
      groups[apiKey.category] = [];
    }
    groups[apiKey.category].push(apiKey);
    return groups;
  }, {} as Record<string, ApiKey[]>);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center mb-4">
          <Key className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">API Key Configuration</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Configure your API keys to enable all features of the landing page generator. 
          Keys are stored securely in your browser's local storage.
        </p>
      </motion.div>

      {/* Save Message */}
      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center"
        >
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-green-700">{saveMessage}</span>
        </motion.div>
      )}

      {/* Save All Button */}
      <div className="mb-8 flex justify-end">
        <button
          onClick={saveAllKeys}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
        >
          <Save className="w-5 h-5 mr-2" />
          Save All Keys
        </button>
      </div>

      {/* API Key Groups */}
      {Object.entries(groupedKeys).map(([category, keys]) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="w-6 h-6 text-blue-600 mr-2" />
            {category}
          </h2>
          
          <div className="grid gap-6">
            {keys.map((apiKey) => {
              const status = getKeyStatus(apiKey.key);
              const isVisible = visibleKeys[apiKey.key];
              const value = apiKeyValues[apiKey.key] || '';

              return (
                <div
                  key={apiKey.key}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 text-blue-600">
                        {apiKey.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          {apiKey.name}
                          {apiKey.required && (
                            <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium">
                              Required
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-600 text-sm">{apiKey.description}</p>
                      </div>
                    </div>
                    
                    {/* Status Indicator */}
                    <div className="flex items-center">
                      {status === 'saved' && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-5 h-5 mr-1" />
                          <span className="text-sm font-medium">Saved</span>
                        </div>
                      )}
                      {status === 'unsaved' && value && (
                        <div className="flex items-center text-yellow-600">
                          <AlertCircle className="w-5 h-5 mr-1" />
                          <span className="text-sm font-medium">Unsaved</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={isVisible ? 'text' : 'password'}
                        value={value}
                        onChange={(e) => handleKeyChange(apiKey.key, e.target.value)}
                        placeholder={apiKey.placeholder}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                      />
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.key)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    <button
                      onClick={() => saveApiKey(apiKey.key)}
                      disabled={!value.trim()}
                      className="bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 rounded-xl p-6 border border-blue-200"
      >
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Getting Your API Keys
        </h3>
        <div className="space-y-2 text-blue-800">
          <p><strong>SerpAPI:</strong> Sign up at serpapi.com for search functionality</p>
          <p><strong>Google Vision:</strong> Get API key from Google Cloud Console</p>
          <p><strong>Groq:</strong> Sign up at console.groq.com for AI content generation</p>
          <p><strong>Cloudinary:</strong> Create account at cloudinary.com for media management</p>
          <p><strong>Remove.bg:</strong> Get API key from remove.bg for background removal</p>
          <p><strong>Shopify:</strong> Generate private app credentials in your Shopify admin</p>
        </div>
      </motion.div>
    </div>
  );
}