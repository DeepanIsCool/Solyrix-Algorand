import React from 'react';
import { Link } from 'react-router-dom';
import { ContextWithStats, ModelType, ContextCategory, LicenseType } from '../../types/context.types';
import { formatMicroAlgosToAlgo } from '../../utils/formatBalance';
import { 
  StarIcon, 
  EyeIcon, 
  ShoppingCartIcon,
  TagIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface ContextCardProps {
  context: ContextWithStats;
  onPurchase?: (context: ContextWithStats) => void;
  showPurchaseButton?: boolean;
  className?: string;
}

const ContextCard: React.FC<ContextCardProps> = ({
  context,
  onPurchase,
  showPurchaseButton = true,
  className = ''
}) => {
  const getCategoryLabel = (category: ContextCategory): string => {
    const labels = {
      [ContextCategory.PROMPT]: 'Prompt',
      [ContextCategory.DATASET]: 'Dataset',
      [ContextCategory.MODEL_CONFIG]: 'Model Config',
      [ContextCategory.FINE_TUNE]: 'Tool'
    };
    return labels[category] || 'Unknown';
  };

  const getModelTypeLabel = (modelType: ModelType): string => {
    const labels = {
      [ModelType.GPT]: 'GPT',
      [ModelType.CLAUDE]: 'Claude',
      [ModelType.LLAMA]: 'LLaMA',
      [ModelType.UNIVERSAL]: 'Universal'
    };
    return labels[modelType] || 'Unknown';
  };

  const getLicenseTypeLabel = (licenseType: LicenseType): string => {
    const labels = {
      [LicenseType.ONE_TIME]: 'One-time',
      [LicenseType.SUBSCRIPTION]: 'Subscription',
      [LicenseType.USAGE_BASED]: 'Usage-based',
      [LicenseType.COMMERCIAL]: 'Commercial'
    };
    return labels[licenseType] || 'Unknown';
  };

  const formatPrice = (price: number): string => {
    return formatMicroAlgosToAlgo(price);
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="w-4 h-4 text-gray-300" />
            <StarIconSolid 
              className="w-4 h-4 text-yellow-400 absolute top-0 left-0" 
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            />
          </div>
        );
      } else {
        stars.push(
          <StarIcon key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }

    return stars;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <Link 
              to={`/context/${context.id}`}
              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {context.metadata.title}
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {context.metadata.description}
            </p>
          </div>
          <div className="ml-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              context.metadata.category === ContextCategory.PROMPT
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                : context.metadata.category === ContextCategory.DATASET
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : context.metadata.category === ContextCategory.MODEL_CONFIG
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
            }`}>
              {getCategoryLabel(context.metadata.category)}
            </span>
          </div>
        </div>

        {/* Tags */}
        {context.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {context.metadata.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <TagIcon className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {context.metadata.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{context.metadata.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Model Compatibility */}
        <div className="flex flex-wrap gap-1 mb-4">
          {context.metadata.modelCompatibility.map((modelType, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400"
            >
              {getModelTypeLabel(modelType)}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {renderStars(context.stats.averageRating)}
              <span className="ml-1">
                ({context.stats.ratingCount})
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <EyeIcon className="w-4 h-4" />
              <span>{context.stats.totalPurchases}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(context.licensing.price)} ALGO
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {getLicenseTypeLabel(context.licensing.type)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <UserIcon className="w-4 h-4" />
              <span>{formatAddress(context.creatorAddress)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CalendarIcon className="w-4 h-4" />
              <span>{formatDate(context.creationTimestamp)}</span>
            </div>
          </div>
          
          {showPurchaseButton && onPurchase && (
            <button
              onClick={() => onPurchase(context)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ShoppingCartIcon className="w-4 h-4 mr-1" />
              Purchase
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContextCard;
