import React from 'react';
import { Link } from 'react-router-dom';
import { ContextWithStats, LicenseType } from '../../types/context.types';
import { formatMicroAlgosToAlgo } from '../../utils/formatBalance';
import GradientCard from '../common/GradientCard';
import { 
  EyeIcon, 
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

interface SellerContextCardProps {
  context: ContextWithStats;
  onEdit?: (context: ContextWithStats) => void;
  onDelete?: (context: ContextWithStats) => void;
  onToggleStatus?: (context: ContextWithStats) => void;
  className?: string;
}

const SellerContextCard: React.FC<SellerContextCardProps> = ({
  context,
  onEdit,
  onDelete,
  onToggleStatus,
  className = ''
}) => {
  const isActive = true; // TODO: Get from context status
  const totalEarnings = (context.stats as any)?.totalEarnings || 0;
  const totalSales = (context.stats as any)?.purchases || 0;
  const totalViews = (context.stats as any)?.views || 0;

  return (
    <GradientCard variant="primary" hover className={className}>
      <div className="p-6 space-y-4">
        {/* Header with Status */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              {context.metadata.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {context.metadata.description}
            </p>
          </div>
          
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${isActive 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
              : 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300'
            }
          `}>
            {isActive ? 'Active' : 'Paused'}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {context.metadata.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <CurrencyDollarIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {formatMicroAlgosToAlgo(totalEarnings)}
              </span>
            </div>
            <div className="text-xs text-gray-500">Earned</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <ShoppingCartIcon className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {totalSales}
              </span>
            </div>
            <div className="text-xs text-gray-500">Sales</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <EyeIcon className="w-4 h-4 text-purple-500 mr-1" />
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {totalViews}
              </span>
            </div>
            <div className="text-xs text-gray-500">Views</div>
          </div>
        </div>

        {/* Price and License */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {formatMicroAlgosToAlgo(context.licensing.price)} ALGO
            </div>
            <div className="text-xs text-gray-500">
              {context.licensing.type === LicenseType.ONE_TIME 
                ? 'One-time Purchase'
                : context.licensing.type === LicenseType.SUBSCRIPTION
                ? 'Subscription'
                : 'Usage-based'}
            </div>
          </div>
          
          <Link
            to={`/analytics/${context.id}`}
            className="inline-flex items-center px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ChartBarIcon className="w-3 h-3 mr-1" />
            Analytics
          </Link>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={() => onEdit?.(context)}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
          >
            <PencilIcon className="w-4 h-4 mr-1" />
            Edit
          </button>
          
          <button
            onClick={() => onToggleStatus?.(context)}
            className={`
              flex-1 inline-flex items-center justify-center px-3 py-2 text-sm rounded-lg transition-colors
              ${isActive
                ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/40'
                : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/40'
              }
            `}
          >
            {isActive ? (
              <>
                <PauseIcon className="w-4 h-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4 mr-1" />
                Activate
              </>
            )}
          </button>
          
          <button
            onClick={() => onDelete?.(context)}
            className="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </GradientCard>
  );
};

export default SellerContextCard;
