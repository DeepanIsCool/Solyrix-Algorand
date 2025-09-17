import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@txnlab/use-wallet-react';
import ConnectWallet from '../wallet/ConnectWallet';
import Account from '../wallet/Account';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  PlusCircleIcon, 
  ChartBarIcon, 
  CogIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const location = useLocation();
  const { activeAddress } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Mock network status for now
  const networkStatus = { status: 'connected' };

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBagIcon },
    { name: 'Create', href: '/create-context', icon: PlusCircleIcon },
    { name: 'Profile', href: '/profile', icon: ChartBarIcon },
    { name: 'Governance', href: '/governance', icon: CogIcon },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DA</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                DecentralAI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Network Status & Wallet */}
          <div className="flex items-center space-x-4">
            {/* Network Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                networkStatus.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {networkStatus.status === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Wallet Section */}
            {activeAddress ? (
              <Account />
            ) : (
              <ConnectWallet />
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Network Status */}
              <div className="flex items-center space-x-2 px-3 py-2">
                <div className={`w-2 h-2 rounded-full ${
                  networkStatus.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Network: {networkStatus.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
