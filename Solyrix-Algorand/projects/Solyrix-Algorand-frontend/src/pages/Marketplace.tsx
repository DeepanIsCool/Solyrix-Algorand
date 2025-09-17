import React, { useState, useEffect, useCallback } from 'react';
import { ContextWithStats, ContextFilters, SearchResult } from '../types/context.types';
import MarketplaceGrid from '../components/marketplace/MarketplaceGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useIPFS } from '../hooks/useIPFS';
import { blockchainService } from '../services/blockchain.service';

// Real contexts will be loaded from blockchain/IPFS
const loadContextsFromBlockchain = async (): Promise<ContextWithStats[]> => {
  // TODO: Implement real blockchain data loading
  // This will fetch contexts from the deployed ContextRegistry smart contract
  return [];
};

const Marketplace: React.FC = () => {
  const [contexts, setContexts] = useState<ContextWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ContextFilters>({});
  const [page, setPage] = useState(1);

  const { error: ipfsError } = useIPFS();

  // Simulate API call to fetch contexts
  const fetchContexts = useCallback(async (
    query: string = '',
    currentFilters: ContextFilters = {},
    pageNum: number = 1,
    append: boolean = false
  ) => {
    setIsLoading(true);
    
    try {
      // Load contexts from blockchain
      const allContexts = await loadContextsFromBlockchain();
      let filteredContexts = [...allContexts];
      
      // Apply search filter
      if (query.trim()) {
        const searchLower = query.toLowerCase();
        filteredContexts = filteredContexts.filter(context =>
          context.metadata.title.toLowerCase().includes(searchLower) ||
          context.metadata.description.toLowerCase().includes(searchLower) ||
          context.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply category filter
      if (currentFilters.category !== undefined) {
        filteredContexts = filteredContexts.filter(context =>
          context.metadata.category === currentFilters.category
        );
      }
      
      // Apply model type filter
      if (currentFilters.modelType !== undefined) {
        filteredContexts = filteredContexts.filter(context =>
          context.metadata.modelCompatibility.includes(currentFilters.modelType!)
        );
      }
      
      // Apply price range filter
      if (currentFilters.priceRange) {
        const { min, max } = currentFilters.priceRange;
        filteredContexts = filteredContexts.filter(context => {
          const priceInAlgo = context.licensing.price / 1_000_000;
          const minCheck = min === undefined || priceInAlgo >= min;
          const maxCheck = max === undefined || priceInAlgo <= max;
          return minCheck && maxCheck;
        });
      }
      
      // Apply rating filter
      if (currentFilters.rating !== undefined) {
        filteredContexts = filteredContexts.filter(context =>
          context.stats.averageRating >= currentFilters.rating!
        );
      }
      
      // Apply tags filter
      if (currentFilters.tags && currentFilters.tags.length > 0) {
        filteredContexts = filteredContexts.filter(context =>
          currentFilters.tags!.some(tag =>
            context.metadata.tags.some(contextTag =>
              contextTag.toLowerCase().includes(tag.toLowerCase())
            )
          )
        );
      }
      
      // Apply author filter
      if (currentFilters.author) {
        filteredContexts = filteredContexts.filter(context =>
          context.creatorAddress.toLowerCase().includes(currentFilters.author!.toLowerCase())
        );
      }
      
      // Apply sorting
      const sortBy = currentFilters.sortBy || 'newest';
      filteredContexts.sort((a, b) => {
        switch (sortBy) {
          case 'oldest':
            return a.creationTimestamp - b.creationTimestamp;
          case 'price_low':
            return a.licensing.price - b.licensing.price;
          case 'price_high':
            return b.licensing.price - a.licensing.price;
          case 'rating':
            return b.stats.averageRating - a.stats.averageRating;
          case 'popularity':
            return b.stats.totalPurchases - a.stats.totalPurchases;
          case 'newest':
          default:
            return b.creationTimestamp - a.creationTimestamp;
        }
      });
      
      // Simulate pagination
      const itemsPerPage = 9;
      const startIndex = (pageNum - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageContexts = filteredContexts.slice(startIndex, endIndex);
      
      if (append) {
        setContexts(prev => [...prev, ...pageContexts]);
      } else {
        setContexts(pageContexts);
      }
      
      setHasMore(endIndex < filteredContexts.length);
      
    } catch (error) {
      console.error('Failed to fetch contexts:', error);
      setContexts([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchContexts('', {}, 1, false);
  }, [fetchContexts]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
    fetchContexts(query, filters, 1, false);
  }, [filters, fetchContexts]);

  // Handle filters
  const handleFilter = useCallback((newFilters: ContextFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchContexts(searchQuery, newFilters, 1, false);
  }, [searchQuery, fetchContexts]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchContexts(searchQuery, filters, nextPage, true);
  }, [page, searchQuery, filters, fetchContexts]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          AI Context Marketplace
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover and purchase AI contexts, prompts, datasets, and configurations 
          created by the community. All stored securely on IPFS and managed on Algorand blockchain.
        </p>
      </div>

      {/* Error Display */}
      {ipfsError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                IPFS Connection Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{ipfsError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Marketplace Grid or Empty State */}
      {!isLoading && contexts.length === 0 && !blockchainService.isDeployed() ? (
        <EmptyState
          type="contracts-not-deployed"
          title="Smart Contracts Not Deployed"
          description="Deploy the DecentralAI smart contracts to TestNet to start creating and browsing AI contexts on the blockchain."
          icon="warning"
        />
      ) : !isLoading && contexts.length === 0 ? (
        <EmptyState
          type="no-contexts"
          title="No AI Contexts Available"
          description="Be the first to create an AI context! Share your prompts, datasets, and configurations with the community."
          actionLabel="Create Context"
          onAction={() => window.location.href = '/create-context'}
          icon="plus"
        />
      ) : (
        <MarketplaceGrid
          contexts={contexts}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onSearch={handleSearch}
          onFilter={handleFilter}
          searchQuery={searchQuery}
          filters={filters}
        />
      )}

      {/* Stats Footer */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {contexts.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              AI Contexts Available
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {contexts.reduce((sum, ctx) => sum + ctx.stats.totalPurchases, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Purchases
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {contexts.length > 0 ? (contexts.reduce((sum, ctx) => sum + ctx.stats.averageRating, 0) / contexts.length).toFixed(1) : '0.0'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Average Rating
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
