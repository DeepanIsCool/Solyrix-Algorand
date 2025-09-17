import React from 'react';
import { ContextFilters, ContextCategory, ModelType, LicenseType } from '../../types/context.types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SearchFiltersProps {
  filters: ContextFilters;
  onFiltersChange: (filters: ContextFilters) => void;
  onClearFilters: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const handleCategoryChange = (category: ContextCategory | undefined) => {
    onFiltersChange({ ...filters, category });
  };

  const handleModelTypeChange = (modelType: ModelType | undefined) => {
    onFiltersChange({ ...filters, modelType });
  };

  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const currentRange = filters.priceRange || { min: 0, max: 1000 };
    
    onFiltersChange({
      ...filters,
      priceRange: {
        ...currentRange,
        [field]: numValue
      }
    });
  };

  const handleRatingChange = (rating: number | undefined) => {
    onFiltersChange({ ...filters, rating });
  };

  const handleTagsChange = (tags: string) => {
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    onFiltersChange({ ...filters, tags: tagArray.length > 0 ? tagArray : undefined });
  };

  const getCategoryLabel = (category: ContextCategory): string => {
    const labels = {
      [ContextCategory.PROMPT]: 'Prompt',
      [ContextCategory.DATASET]: 'Dataset',
      [ContextCategory.MODEL_CONFIG]: 'Model Config',
      [ContextCategory.FINE_TUNE]: 'Fine-tune'
    };
    return labels[category];
  };

  const getModelTypeLabel = (modelType: ModelType): string => {
    const labels = {
      [ModelType.GPT]: 'GPT',
      [ModelType.CLAUDE]: 'Claude',
      [ModelType.LLAMA]: 'LLaMA',
      [ModelType.UNIVERSAL]: 'Universal'
    };
    return labels[modelType];
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof ContextFilters];
    return value !== undefined && value !== null;
  });

  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Active Filters
          </h3>
          <button
            onClick={onClearFilters}
            className="inline-flex items-center text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <XMarkIcon className="w-4 h-4 mr-1" />
            Clear All
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={filters.category ?? ''}
            onChange={(e) => handleCategoryChange(e.target.value === '' ? undefined : parseInt(e.target.value) as ContextCategory)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {Object.values(ContextCategory).filter(v => typeof v === 'number').map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category as ContextCategory)}
              </option>
            ))}
          </select>
        </div>

        {/* Model Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Model Type
          </label>
          <select
            value={filters.modelType ?? ''}
            onChange={(e) => handleModelTypeChange(e.target.value === '' ? undefined : parseInt(e.target.value) as ModelType)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Models</option>
            {Object.values(ModelType).filter(v => typeof v === 'number').map((modelType) => (
              <option key={modelType} value={modelType}>
                {getModelTypeLabel(modelType as ModelType)}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Price Range (ALGO)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange?.min ?? ''}
              onChange={(e) => handlePriceRangeChange('min', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange?.max ?? ''}
              onChange={(e) => handlePriceRangeChange('max', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Minimum Rating
          </label>
          <select
            value={filters.rating ?? ''}
            onChange={(e) => handleRatingChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="1">1+ Stars</option>
          </select>
        </div>
      </div>

      {/* Tags Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          placeholder="e.g. chatbot, creative-writing, data-analysis"
          value={filters.tags?.join(', ') ?? ''}
          onChange={(e) => handleTagsChange(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Enter tags separated by commas to filter contexts
        </p>
      </div>

      {/* Author Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Creator Address
        </label>
        <input
          type="text"
          placeholder="Enter creator's Algorand address"
          value={filters.author ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, author: e.target.value || undefined })}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.category !== undefined && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              Category: {getCategoryLabel(filters.category)}
              <button
                onClick={() => handleCategoryChange(undefined)}
                className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.modelType !== undefined && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              Model: {getModelTypeLabel(filters.modelType)}
              <button
                onClick={() => handleModelTypeChange(undefined)}
                className="ml-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.priceRange && (filters.priceRange.min !== undefined || filters.priceRange.max !== undefined) && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
              Price: {filters.priceRange.min ?? 0} - {filters.priceRange.max ?? '∞'} ALGO
              <button
                onClick={() => onFiltersChange({ ...filters, priceRange: undefined })}
                className="ml-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.rating !== undefined && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
              Rating: {filters.rating}+ stars
              <button
                onClick={() => handleRatingChange(undefined)}
                className="ml-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.tags && filters.tags.length > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
              Tags: {filters.tags.join(', ')}
              <button
                onClick={() => onFiltersChange({ ...filters, tags: undefined })}
                className="ml-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.author && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              Creator: {filters.author.slice(0, 10)}...
              <button
                onClick={() => onFiltersChange({ ...filters, author: undefined })}
                className="ml-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
