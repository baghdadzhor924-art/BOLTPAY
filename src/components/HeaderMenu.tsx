import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, Menu, X, ChevronDown, 
  LayoutDashboard, Wand2, FileText, TrendingUp, 
  Download, Puzzle, Image, BarChart3, Settings, 
  MessageCircle
} from 'lucide-react';

interface MenuItem {
  label: string;
  route: string;
  id: string;
  icon: React.ReactNode;
  submenu?: { label: string; route: string; id: string }[];
}

const menuItems: MenuItem[] = [
  {
    label: 'لوحة التحكم',
    route: '/dashboard',
    id: 'dashboard',
    icon: <LayoutDashboard className="w-4 h-4" />
  },
  {
    label: 'توليد صفحة',
    route: '/generate',
    id: 'generate',
    icon: <Wand2 className="w-4 h-4" />
  },
  {
    label: 'صفحاتي',
    route: '/pages',
    id: 'pages',
    icon: <FileText className="w-4 h-4" />
  },
  {
    label: 'طلب تحسين',
    route: '/optimize',
    id: 'optimize',
    icon: <TrendingUp className="w-4 h-4" />
  },
  {
    label: 'تصدير',
    route: '/export',
    id: 'export',
    icon: <Download className="w-4 h-4" />,
    submenu: [
      { label: 'Shopify', route: '/export/shopify', id: 'export_shopify' },
      { label: 'WooCommerce', route: '/export/woocommerce', id: 'export_woocommerce' }
    ]
  },
  {
    label: 'تكاملات',
    route: '/integrations',
    id: 'integrations',
    icon: <Puzzle className="w-4 h-4" />,
    submenu: [
      { label: 'Facebook Pixel', route: '/integrations/facebook', id: 'integrations_facebook' },
      { label: 'WhatsApp', route: '/integrations/whatsapp', id: 'integrations_whatsapp' },
      { label: 'Messenger', route: '/integrations/messenger', id: 'integrations_messenger' },
      { label: 'Chatbot', route: '/integrations/chatbot', id: 'integrations_chatbot' },
      { label: 'Domain', route: '/integrations/domain', id: 'integrations_domain' }
    ]
  },
  {
    label: 'الوسائط',
    route: '/media',
    id: 'media',
    icon: <Image className="w-4 h-4" />
  },
  {
    label: 'تحليل الإعلانات (ML)',
    route: '/ad-analysis',
    id: 'ad_analysis',
    icon: <BarChart3 className="w-4 h-4" />
  },
  {
    label: 'الإعدادات',
    route: '/settings',
    id: 'settings',
    icon: <Settings className="w-4 h-4" />,
    submenu: [
      { label: 'API Keys', route: '/settings/api', id: 'settings_api' },
      { label: 'Billing', route: '/settings/billing', id: 'settings_billing' },
      { label: 'Account', route: '/settings/account', id: 'settings_account' }
    ]
  },
  {
    label: 'دعم / دردشة AI',
    route: '/support',
    id: 'support',
    icon: <MessageCircle className="w-4 h-4" />
  }
];

interface HeaderMenuProps {
  onNavigate?: (route: string, id: string) => void;
}

export default function HeaderMenu({ onNavigate }: HeaderMenuProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleMenuClick = (route: string, id: string) => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    onNavigate?.(route, id);
  };

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Rocket className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Landing Page Bolt</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1" dir="rtl">
            {menuItems.map((item) => (
              <div key={item.id} className="relative">
                {item.submenu ? (
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(item.id)}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                      data-route={item.id}
                    >
                      {item.icon}
                      <span className="mr-2">{item.label}</span>
                      <ChevronDown className={`w-3 h-3 mr-1 transition-transform ${
                        activeDropdown === item.id ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {activeDropdown === item.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                      >
                        {item.submenu.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => handleMenuClick(subItem.route, subItem.id)}
                            className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                            data-route={subItem.id}
                          >
                            {subItem.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleMenuClick(item.route, item.id)}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                    data-route={item.id}
                  >
                    {item.icon}
                    <span className="mr-2">{item.label}</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden py-4 border-t border-gray-200"
            dir="rtl"
          >
            <div className="flex flex-col space-y-2">
              {menuItems.map((item) => (
                <div key={item.id}>
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={() => toggleDropdown(item.id)}
                        className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                        data-route={item.id}
                      >
                        <div className="flex items-center">
                          {item.icon}
                          <span className="mr-3">{item.label}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${
                          activeDropdown === item.id ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      {activeDropdown === item.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-2 pr-8 space-y-1"
                        >
                          {item.submenu.map((subItem) => (
                            <button
                              key={subItem.id}
                              onClick={() => handleMenuClick(subItem.route, subItem.id)}
                              className="w-full text-right px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                              data-route={subItem.id}
                            >
                              {subItem.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMenuClick(item.route, item.id)}
                      className="w-full flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                      data-route={item.id}
                    >
                      {item.icon}
                      <span className="mr-3">{item.label}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}