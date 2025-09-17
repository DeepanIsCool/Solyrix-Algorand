import React, { useState, useEffect } from 'react';
import { ContextWithStats, ContextFilters, ModelType, LicenseType } from '../../types/context.types';
import ContextCard from '../context/ContextCard';
import PurchaseModalEnhanced from './PurchaseModalEnhanced';
import LoadingSpinner from '../common/LoadingSpinner';
import SearchFilters from '../marketplace/SearchFilters';
import PurchaseModal from '../marketplace/PurchaseModal';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface MarketplaceGridProps {
  contexts: ContextWithStats[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSearch: (query: string) => void;
  onFilter: (filters: ContextFilters) => void;
  searchQuery: string;
  filters: ContextFilters;
}

const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({
  contexts,
  isLoading,
  hasMore,
  onLoadMore,
  onSearch,
  onFilter,
  searchQuery,
  filters
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContext, setSelectedContext] = useState<ContextWithStats | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Update search input when searchQuery prop changes
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handlePurchaseClick = (context: ContextWithStats) => {
    setSelectedContext(context);
    setIsPurchaseModalOpen(true);
  };

  const handleClosePurchaseModal = () => {
    setIsPurchaseModalOpen(false);
    setSelectedContext(null);
  };

  const handlePurchaseComplete = () => {
    handleClosePurchaseModal();
    // Optionally refresh the contexts list or show a success message
    // Optionally refresh the contexts list
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search AI contexts, prompts, datasets..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </form>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium transition-colors ${
              showFilters
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-600'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filters
            {Object.keys(filters).length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                {Object.keys(filters).filter(key => filters[key as keyof ContextFilters] !== undefined).length}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <SearchFilters
              filters={filters}
              onFiltersChange={onFilter}
              onClearFilters={() => onFilter({})}
            />
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {isLoading ? (
            'Searching...'
          ) : (
            `${contexts.length} context${contexts.length !== 1 ? 's' : ''} found`
          )}
        </div>
        
        {/* Sort Options */}
        <select
          onChange={(e) => onFilter({ ...filters, sortBy: e.target.value as any })}
          value={filters.sortBy || 'newest'}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="popularity">Most Popular</option>
        </select>
      </div>

      {/* Loading State */}
      {isLoading && contexts.length === 0 && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading contexts..." />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && contexts.length === 0 && (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No contexts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <button
            onClick={() => {
              setSearchInput('');
              onSearch('');
              onFilter({});
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Context Grid */}
      {contexts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contexts.map((context) => (
            <ContextCard
              key={context.id}
              context={context}
              onPurchase={handlePurchaseClick}
              showPurchaseButton={true}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && !isLoading && (
        <div className="text-center py-8">
          <button
            onClick={onLoadMore}
            className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Load More Contexts
          </button>
        </div>
      )}

      {/* Loading More */}
      {isLoading && contexts.length > 0 && (
        <div className="text-center py-8">
          <LoadingSpinner size="md" text="Loading more contexts..." />
        </div>
      )}

      {/* Enhanced Purchase Modal */}
      {selectedContext && (
        <PurchaseModalEnhanced
          context={selectedContext}
          isOpen={isPurchaseModalOpen}
          onClose={handleClosePurchaseModal}
          onPurchaseComplete={handlePurchaseComplete}
        />
      )}
    </div>
  );
};

export default MarketplaceGrid;
