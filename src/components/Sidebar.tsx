import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Wand2, 
  Store, 
  ShoppingCart, 
  Brain, 
  MessageCircle, 
  Settings,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  onNavigate?: (route: string, id: string) => void;
}

const menuItems = [
  {
    label: 'Home', 
    route: '/home',
    id: 'home',
    icon: <Home className="w-5 h-5" />
  },
  {
    label: 'Generate Page',
    route: '/generate',
    id: 'generate',
    icon: <Wand2 className="w-5 h-5" />
  },
  {
    label: 'My Store',
    route: '/store',
    id: 'store',
    icon: <Store className="w-5 h-5" />
  },
  {
    label: 'Pixel Tracking',
    route: '/pixel-tracking',
    id: 'pixel_tracking',
    icon: <Brain className="w-5 h-5" />
  },
  {
    label: 'Custom Domain',
    route: '/custom-domain',
    id: 'custom_domain',
    icon: <Settings className="w-5 h-5" />
  },
  {
    label: 'Chatbot',
    route: '/chatbot',
    id: 'chatbot',
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    label: 'WhatsApp',
    route: '/whatsapp',
    id: 'whatsapp',
    icon: <MessageCircle className="w-5 h-5" />
   },
   {
    label: 'Messenger',
    route: '/messenger',
    id: 'messenger',
    icon: <MessageCircle className="w-5 h-5" />
  }
];

export default function Sidebar({ onNavigate }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('home');

  const handleMenuClick = (route: string, id: string) => {
    setActiveItem(id);
    setIsOpen(false);
    onNavigate?.(route, id);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isOpen || window.innerWidth >= 1024 ? 0 : -280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed left-0 top-0 h-full w-72 bg-white shadow-xl z-40 lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Landing Bolt</h1>
                <p className="text-sm text-gray-500">AI-Powered Pages</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item.route, item.id)}
                    data-route={item.id}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeItem === item.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className={activeItem === item.id ? 'text-blue-600' : 'text-gray-400'}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                <p className="text-xs text-gray-500 truncate">john@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}