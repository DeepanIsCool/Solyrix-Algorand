import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ContextWithStats, ContextFilters } from '../types/context.types';
import { useAlgorand } from '../hooks/useAlgorand';
import MarketplaceGrid from '../components/marketplace/MarketplaceGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import GradientCard from '../components/common/GradientCard';
import Web3Badge from '../components/common/Web3Badge';
import { blockchainService } from '../services/blockchain.service';
import {
  ShoppingBagIcon,
  PlusCircleIcon,
  ChartBarIcon,
  EyeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  SparklesIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { formatMicroAlgosToAlgo } from '../utils/formatBalance';

// Load all contexts from blockchain (for browsing)
const loadAllContextsFromBlockchain = async (): Promise<ContextWithStats[]> => {
  // TODO: Implement real blockchain data loading
  // This will fetch all contexts from the deployed ContextRegistry smart contract
  return [];
};

// Load user's own contexts (for selling)
const loadUserContextsFromBlockchain = async (userAddress: string): Promise<ContextWithStats[]> => {
  // TODO: Implement real blockchain data loading
  // This will fetch contexts created by the specific user
  return [];
};

type MarketplaceSection = 'browse' | 'sell';

const MarketplaceUnified: React.FC = () => {
  const { account, isConnected } = useAlgorand();
  
  // Section state
  const [activeSection, setActiveSection] = useState<MarketplaceSection>('browse');
  
  // Browse section state
  const [allContexts, setAllContexts] = useState<ContextWithStats[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseHasMore, setBrowseHasMore] = useState(true);
  const [browseSearchQuery, setBrowseSearchQuery] = useState('');
  const [browseFilters, setBrowseFilters] = useState<ContextFilters>({});
  
  // Sell section state
  const [userContexts, setUserContexts] = useState<ContextWithStats[]>([]);
  const [sellLoading, setSellLoading] = useState(false);
  const [sellHasMore, setSellHasMore] = useState(true);
  const [sellSearchQuery, setSellSearchQuery] = useState('');
  const [sellFilters, setSellFilters] = useState<ContextFilters>({});
  
  // Analytics for seller section
  const [sellerStats, setSellerStats] = useState({
    totalEarnings: 0,
    totalSales: 0,
    totalViews: 0,
    activeListings: 0
  });

  // Load all contexts for browsing
  const fetchAllContexts = useCallback(async (
    query?: string,
    currentFilters?: ContextFilters,
    append: boolean = false
  ) => {
    setBrowseLoading(true);
    
    // Use provided params or fall back to current state
    const searchQuery = query !== undefined ? query : browseSearchQuery;
    const filters = currentFilters !== undefined ? currentFilters : browseFilters;
    
    try {
      const contexts = await loadAllContextsFromBlockchain();
      let filteredContexts = [...contexts];
      
      // Apply search and filters
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        filteredContexts = filteredContexts.filter(context =>
          context.metadata.title.toLowerCase().includes(searchLower) ||
          context.metadata.description.toLowerCase().includes(searchLower) ||
          context.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply filters (category, price range, etc.)
      if (filters.category !== undefined) {
        filteredContexts = filteredContexts.filter(context => 
          context.metadata.category === filters.category
        );
      }
      
      if (filters.priceRange) {
        filteredContexts = filteredContexts.filter(context => {
          const price = context.licensing.price || 0;
          return price >= (filters.priceRange!.min || 0) && 
                 price <= (filters.priceRange!.max || Infinity);
        });
      }
      
      // Exclude user's own contexts from browse section
      if (account?.address) {
        filteredContexts = filteredContexts.filter(context => 
          context.creatorAddress !== account.address
        );
      }
      
      setAllContexts(prev => append ? [...prev, ...filteredContexts] : filteredContexts);
      setBrowseHasMore(filteredContexts.length >= 20); // Assume 20 per page
      
    } catch (error) {
      console.error('Failed to load contexts:', error);
    } finally {
      setBrowseLoading(false);
    }
  }, [account]);

  // Load user's contexts for selling
  const fetchUserContexts = useCallback(async (
    query?: string,
    currentFilters?: ContextFilters,
    append: boolean = false
  ) => {
    if (!account?.address) return;
    
    setSellLoading(true);
    
    // Use provided params or fall back to current state
    const searchQuery = query !== undefined ? query : sellSearchQuery;
    const filters = currentFilters !== undefined ? currentFilters : sellFilters;
    
    try {
      const contexts = await loadUserContextsFromBlockchain(account.address);
      let filteredContexts = [...contexts];
      
      // Apply search and filters
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        filteredContexts = filteredContexts.filter(context =>
          context.metadata.title.toLowerCase().includes(searchLower) ||
          context.metadata.description.toLowerCase().includes(searchLower) ||
          context.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      setUserContexts(prev => append ? [...prev, ...filteredContexts] : filteredContexts);
      setSellHasMore(filteredContexts.length >= 20);
      
      // Calculate seller stats
      const stats = {
        totalEarnings: contexts.reduce((sum, ctx) => sum + ((ctx.stats as any)?.totalEarnings || 0), 0),
        totalSales: contexts.reduce((sum, ctx) => sum + ((ctx.stats as any)?.purchases || 0), 0),
        totalViews: contexts.reduce((sum, ctx) => sum + ((ctx.stats as any)?.views || 0), 0),
        activeListings: contexts.length
      };
      setSellerStats(stats);
      
    } catch (error) {
      console.error('Failed to load user contexts:', error);
    } finally {
      setSellLoading(false);
    }
  }, [account]);

  // Load data when section changes - removed callbacks from dependencies to prevent infinite loop
  useEffect(() => {
    if (activeSection === 'browse') {
      // Load browse data directly
      (async () => {
        setBrowseLoading(true);
        try {
          const contexts = await loadAllContextsFromBlockchain();
          let filteredContexts = [...contexts];
          
          if (browseSearchQuery.trim()) {
            const searchLower = browseSearchQuery.toLowerCase();
            filteredContexts = filteredContexts.filter(context =>
              context.metadata.title.toLowerCase().includes(searchLower) ||
              context.metadata.description.toLowerCase().includes(searchLower) ||
              context.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
          }
          
          if (browseFilters.category !== undefined) {
            filteredContexts = filteredContexts.filter(context => 
              context.metadata.category === browseFilters.category
            );
          }
          
          if (browseFilters.priceRange) {
            filteredContexts = filteredContexts.filter(context => {
              const price = context.licensing.price || 0;
              return price >= (browseFilters.priceRange!.min || 0) && 
                     price <= (browseFilters.priceRange!.max || Infinity);
            });
          }
          
          if (account?.address) {
            filteredContexts = filteredContexts.filter(context => 
              context.creatorAddress !== account.address
            );
          }
          
          setAllContexts(filteredContexts);
          setBrowseHasMore(filteredContexts.length >= 20);
        } catch (error) {
          console.error('Failed to load contexts:', error);
        } finally {
          setBrowseLoading(false);
        }
      })();
    } else if (activeSection === 'sell' && account?.address) {
      // Load sell data directly
      (async () => {
        setSellLoading(true);
        try {
          const contexts = await loadUserContextsFromBlockchain(account.address);
          let filteredContexts = [...contexts];
          
          if (sellSearchQuery.trim()) {
            const searchLower = sellSearchQuery.toLowerCase();
            filteredContexts = filteredContexts.filter(context =>
              context.metadata.title.toLowerCase().includes(searchLower) ||
              context.metadata.description.toLowerCase().includes(searchLower) ||
              context.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
          }
          
          setUserContexts(filteredContexts);
          setSellHasMore(filteredContexts.length >= 20);
          
          const stats = {
            totalEarnings: contexts.reduce((sum, ctx) => sum + ((ctx.stats as any)?.totalEarnings || 0), 0),
            totalSales: contexts.reduce((sum, ctx) => sum + ((ctx.stats as any)?.purchases || 0), 0),
            totalViews: contexts.reduce((sum, ctx) => sum + ((ctx.stats as any)?.views || 0), 0),
            activeListings: contexts.length
          };
          setSellerStats(stats);
        } catch (error) {
          console.error('Failed to load user contexts:', error);
        } finally {
          setSellLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]); // Only depend on section change to avoid infinite loops

  // Handle search for browse section
  const handleBrowseSearch = (query: string) => {
    setBrowseSearchQuery(query);
    fetchAllContexts(query, browseFilters);
  };

  // Handle filters for browse section
  const handleBrowseFilter = (filters: ContextFilters) => {
    setBrowseFilters(filters);
    fetchAllContexts(browseSearchQuery, filters);
  };

  // Handle search for sell section
  const handleSellSearch = (query: string) => {
    setSellSearchQuery(query);
    fetchUserContexts(query, sellFilters);
  };

  // Handle filters for sell section
  const handleSellFilter = (filters: ContextFilters) => {
    setSellFilters(filters);
    fetchUserContexts(sellSearchQuery, filters);
  };

  // Load more for browse section
  const handleBrowseLoadMore = () => {
    fetchAllContexts(browseSearchQuery, browseFilters, true);
  };

  // Load more for sell section
  const handleSellLoadMore = () => {
    fetchUserContexts(sellSearchQuery, sellFilters, true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center gap-2 mb-4">
          <Web3Badge type="onchain" animated />
          <Web3Badge type="decentralized" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            AI Agent Marketplace
          </span>
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Discover and purchase AI agents from developers worldwide, or list your own agents for sale
        </p>
      </div>

      {/* Section Tabs */}
      <div className="flex justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveSection('browse')}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all
                ${activeSection === 'browse'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <ShoppingBagIcon className="w-5 h-5" />
              <span>Browse All Agents</span>
            </button>
            
            <button
              onClick={() => setActiveSection('sell')}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all
                ${activeSection === 'sell'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <BuildingStorefrontIcon className="w-5 h-5" />
              <span>My Agents for Sale</span>
            </button>
          </div>
        </div>
      </div>

      {/* Browse Section */}
      {activeSection === 'browse' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <ShoppingBagIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Browse All AI Agents
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Discover and purchase AI agents from developers worldwide
                </p>
              </div>
            </div>
          </div>

          <MarketplaceGrid
            contexts={allContexts}
            isLoading={browseLoading}
            hasMore={browseHasMore}
            onLoadMore={handleBrowseLoadMore}
            onSearch={handleBrowseSearch}
            onFilter={handleBrowseFilter}
            searchQuery={browseSearchQuery}
            filters={browseFilters}
          />
        </div>
      )}

      {/* Sell Section */}
      {activeSection === 'sell' && (
        <div className="space-y-6">
          {!isConnected ? (
            <EmptyState
              type="no-profile"
              title="Wallet Not Connected"
              description="Connect your wallet to manage your AI agents for sale"
              icon="warning"
            />
          ) : (
            <>
              {/* Seller Header with Stats */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                      <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        My Agents for Sale
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage your AI agents and track sales performance
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    to="/create-context"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all shadow-lg"
                  >
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    Create New Agent
                  </Link>
                </div>

                {/* Seller Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <GradientCard variant="primary" hover={false}>
                    <div className="p-6 text-center">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-fit mx-auto mb-3">
                        <CurrencyDollarIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatMicroAlgosToAlgo(sellerStats.totalEarnings)} ALGO
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</div>
                    </div>
                  </GradientCard>

                  <GradientCard variant="secondary" hover={false}>
                    <div className="p-6 text-center">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-fit mx-auto mb-3">
                        <ChartBarIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {sellerStats.totalSales}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Sales</div>
                    </div>
                  </GradientCard>

                  <GradientCard variant="secondary" hover={false}>
                    <div className="p-6 text-center">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-fit mx-auto mb-3">
                        <EyeIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {sellerStats.totalViews}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
                    </div>
                  </GradientCard>

                  <GradientCard variant="primary" hover={false}>
                    <div className="p-6 text-center">
                      <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-fit mx-auto mb-3">
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {sellerStats.activeListings}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Active Listings</div>
                    </div>
                  </GradientCard>
                </div>
              </div>

              {/* User's Contexts Grid */}
              {userContexts.length === 0 && !sellLoading ? (
                <EmptyState
                  type="no-contexts"
                  title="No AI Agents Listed"
                  description="You haven't created any AI agents for sale yet. Create your first agent to start earning!"
                  actionLabel="Create Your First Agent"
                  onAction={() => window.location.href = '/create-context'}
                  icon="plus"
                />
              ) : (
                <MarketplaceGrid
                  contexts={userContexts}
                  isLoading={sellLoading}
                  hasMore={sellHasMore}
                  onLoadMore={handleSellLoadMore}
                  onSearch={handleSellSearch}
                  onFilter={handleSellFilter}
                  searchQuery={sellSearchQuery}
                  filters={sellFilters}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketplaceUnified;
