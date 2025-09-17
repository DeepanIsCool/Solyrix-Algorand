import React, { useState, useEffect } from 'react';
import { ContextWithStats } from '../../types/context.types';
import { useAlgorand } from '../../hooks/useAlgorand';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import GradientCard from '../common/GradientCard';
import Web3Badge from '../common/Web3Badge';
import { formatMicroAlgosToAlgo } from '../../utils/formatBalance';
import {
  DocumentTextIcon,
  CloudArrowDownIcon,
  KeyIcon,
  CalendarIcon,
  CheckCircleIcon,
  LockOpenIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface PurchasedContext {
  context: ContextWithStats;
  purchaseDate: Date;
  transactionId: string;
  licenseKey?: string;
  decryptionKey?: string;
}

const PurchasedContexts: React.FC = () => {
  const { account } = useAlgorand();
  const [purchasedContexts, setPurchasedContexts] = useState<PurchasedContext[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContext, setSelectedContext] = useState<PurchasedContext | null>(null);

  useEffect(() => {
    const loadPurchasedContexts = async () => {
      if (!account?.address) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // TODO: Load actual purchased contexts from blockchain
        // For demo, we'll create some sample data
        const mockPurchased: PurchasedContext[] = [
          // Add mock data here for testing
        ];
        
        setPurchasedContexts(mockPurchased);
      } catch (error) {
        console.error('Failed to load purchased contexts:', error);
        toast.error('Failed to load your purchased contexts');
      } finally {
        setIsLoading(false);
      }
    };

    loadPurchasedContexts();
  }, [account]);

  const handleDownload = async (purchased: PurchasedContext) => {
    try {
      // TODO: Implement actual download from IPFS
      toast.success('Downloading context...');
      
      // In production, this would:
      // 1. Fetch the encrypted content from IPFS using the hash
      // 2. Decrypt it using the provided key
      // 3. Download the decrypted content
      
    } catch (error) {
      toast.error('Failed to download context');
    }
  };

  const handleViewDetails = (purchased: PurchasedContext) => {
    setSelectedContext(purchased);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!account) {
    return (
      <EmptyState
        type="no-profile"
        title="Wallet Not Connected"
        description="Connect your wallet to view your purchased AI contexts"
        icon="warning"
      />
    );
  }

  if (purchasedContexts.length === 0) {
    return (
      <EmptyState
        type="no-contexts"
        title="No Purchased Contexts"
        description="You haven't purchased any AI contexts yet. Browse the marketplace to find contexts that suit your needs."
        actionLabel="Browse Marketplace"
        onAction={() => window.location.href = '/marketplace'}
        icon="search"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center gap-2 mb-4">
          <Web3Badge type="onchain" />
          <Web3Badge type="ipfs" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Purchased AI Contexts
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Access and download your licensed AI contexts
        </p>
      </div>

      {/* Purchased Contexts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {purchasedContexts.map((purchased, index) => (
          <GradientCard key={index} variant="primary" hover>
            <div className="p-6 space-y-4">
              {/* Context Info */}
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <DocumentTextIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {purchased.context.metadata.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {purchased.context.metadata.description.slice(0, 100)}...
                  </p>
                </div>
              </div>

              {/* License Status */}
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Licensed</span>
              </div>

              {/* Purchase Date */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <CalendarIcon className="w-4 h-4" />
                <span>Purchased {purchased.purchaseDate.toLocaleDateString()}</span>
              </div>

              {/* Price Paid */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Price Paid:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {formatMicroAlgosToAlgo(purchased.context.licensing.price)} ALGO
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleDownload(purchased)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
                >
                  <CloudArrowDownIcon className="w-4 h-4 mr-1" />
                  Download
                </button>
                
                <button
                  onClick={() => handleViewDetails(purchased)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <FolderOpenIcon className="w-4 h-4 mr-1" />
                  Details
                </button>
              </div>
            </div>
          </GradientCard>
        ))}
      </div>

      {/* Details Modal */}
      {selectedContext && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-6">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedContext(null)}
            />
            
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Purchase Details
              </h3>
              
              <div className="space-y-4">
                {/* Transaction ID */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Transaction ID:</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs">
                      {selectedContext.transactionId.slice(0, 20)}...
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedContext.transactionId, 'Transaction ID')}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* License Key */}
                {selectedContext.licenseKey && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <KeyIcon className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">License Key:</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs">
                        {selectedContext.licenseKey.slice(0, 20)}...
                      </span>
                      <button
                        onClick={() => copyToClipboard(selectedContext.licenseKey!, 'License Key')}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                {/* Decryption Key */}
                {selectedContext.decryptionKey && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <LockOpenIcon className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">Decryption Key:</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs">
                        {selectedContext.decryptionKey.slice(0, 20)}...
                      </span>
                      <button
                        onClick={() => copyToClipboard(selectedContext.decryptionKey!, 'Decryption Key')}
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                      ⚠️ Keep this key secure. You'll need it to decrypt the content.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedContext(null)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasedContexts;
