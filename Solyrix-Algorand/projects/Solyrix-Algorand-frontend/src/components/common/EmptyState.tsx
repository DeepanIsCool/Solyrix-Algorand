import React from 'react';
import { 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface EmptyStateProps {
  type: 'no-contexts' | 'no-profile' | 'no-results' | 'contracts-not-deployed';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: 'warning' | 'info' | 'plus' | 'search';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  icon = 'info'
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'warning':
        return <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500" />;
      case 'plus':
        return <PlusIcon className="w-12 h-12 text-blue-500" />;
      case 'search':
        return <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />;
      default:
        return <InformationCircleIcon className="w-12 h-12 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'contracts-not-deployed':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'no-results':
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className={`rounded-lg border p-8 text-center ${getBackgroundColor()}`}>
      <div className="flex justify-center mb-4">
        {getIcon()}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {actionLabel}
        </button>
      )}

      {type === 'contracts-not-deployed' && (
        <div className="mt-4 text-xs text-yellow-700 dark:text-yellow-300">
          <p>Deploy smart contracts to enable real blockchain functionality</p>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
