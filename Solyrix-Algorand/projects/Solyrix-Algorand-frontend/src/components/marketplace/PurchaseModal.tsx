import React, { useState, useEffect } from 'react';
import { ContextWithStats, LicenseType } from '../../types/context.types';
import { useAlgorand } from '../../hooks/useAlgorand';
import { useWalletBalance } from '../../hooks/useWalletBalance';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatMicroAlgosToAlgo, microAlgosToAlgo } from '../../utils/formatBalance';
import GradientCard from '../common/GradientCard';
import Web3Badge from '../common/Web3Badge';
import { 
  XMarkIcon, 
  ShoppingCartIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WalletIcon,
  UserIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface PurchaseModalProps {
  context: ContextWithStats;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: () => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  context,
  isOpen,
  onClose,
  onPurchaseComplete
}) => {
  const { 
    isConnected, 
    purchaseLicense, 
    isTransactionPending 
  } = useAlgorand();
  
  const { algoBalance } = useWalletBalance();
  
  const [step, setStep] = useState<'review' | 'confirm' | 'processing' | 'success' | 'error'>('review');
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('review');
      setError(null);
      setTxId(null);
    }
  }, [isOpen]);

  const formatPrice = (price: number): string => {
    return formatMicroAlgosToAlgo(price);
  };

  const formatBalance = (balance: number): string => {
    return balance.toString().replace(/\.?0+$/, ''); // Remove trailing zeros
  };

  const getLicenseTypeLabel = (licenseType: LicenseType): string => {
    const labels = {
      [LicenseType.ONE_TIME]: 'One-time Purchase',
      [LicenseType.SUBSCRIPTION]: 'Subscription',
      [LicenseType.USAGE_BASED]: 'Usage-based',
      [LicenseType.COMMERCIAL]: 'Commercial License'
    };
    return labels[licenseType] || 'Unknown';
  };

  const getLicenseDescription = (licenseType: LicenseType): string => {
    const descriptions = {
      [LicenseType.ONE_TIME]: 'Permanent access to this AI context',
      [LicenseType.SUBSCRIPTION]: 'Time-limited access with automatic renewal',
      [LicenseType.USAGE_BASED]: 'Pay per use with usage limits',
      [LicenseType.COMMERCIAL]: 'Commercial usage rights included'
    };
    return descriptions[licenseType] || 'Standard license terms apply';
  };

  // Convert context price from microAlgos to ALGO for comparison
  const contextPriceInAlgo = microAlgosToAlgo(context.licensing.price);
  const estimatedFeesInAlgo = microAlgosToAlgo(2000); // Estimated transaction fees in microAlgos
  const totalCostInAlgo = contextPriceInAlgo + estimatedFeesInAlgo;
  
  const canAfford = algoBalance >= totalCostInAlgo;

  const handlePurchase = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!canAfford) {
      toast.error('Insufficient balance');
      return;
    }

    setStep('confirm');
  };

  const handleConfirmPurchase = async () => {
    setStep('processing');
    setError(null);

    try {
      // For demo purposes, we'll use placeholder values
      // In a real implementation, these would come from the context data
      const contextId = context.id || 'demo_context_id';
      const licenseTypeId = 'demo_license_type_id';
      
      const result = await purchaseLicense(
        contextId,
        licenseTypeId,
        context.licensing.price
      );

      setTxId(result.txId || null);
      setStep('success');
      toast.success('Purchase completed successfully!');
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onPurchaseComplete();
      }, 3000);
      
    } catch (err) {
      console.error('Purchase failed:', err);
      setError(err instanceof Error ? err.message : 'Purchase failed');
      setStep('error');
      toast.error('Purchase failed');
    }
  };

  const handleClose = () => {
    if (step === 'processing') {
      return; // Don't allow closing during transaction
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" onClick={handleClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Purchase AI Context
            </h3>
            {step !== 'processing' && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Content based on step */}
          {step === 'review' && (
            <div className="space-y-4">
              {/* Context Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {context.metadata.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {context.metadata.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {getLicenseTypeLabel(context.licensing.type)}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatBalance(contextPriceInAlgo)} ALGO
                  </span>
                </div>
              </div>

              {/* License Details */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                      License Terms
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {getLicenseDescription(context.licensing.type)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {context.licensing.terms}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Context Price</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatBalance(contextPriceInAlgo)} ALGO
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Estimated Fees</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatBalance(estimatedFeesInAlgo)} ALGO
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatBalance(totalCostInAlgo)} ALGO
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance Check */}
              <div className={`p-3 rounded-lg ${
                canAfford 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {canAfford ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${
                      canAfford ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'
                    }`}>
                      Your Balance: {formatBalance(algoBalance)} ALGO
                    </p>
                    {!canAfford && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Insufficient balance for this purchase
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={!canAfford || !isConnected}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingCartIcon className="w-4 h-4 mr-2" />
                  Purchase
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="text-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Confirm Purchase
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You are about to purchase "{context.metadata.title}" for {formatBalance(contextPriceInAlgo)} ALGO.
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">
                Processing Purchase
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please wait while your transaction is being processed...
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Purchase Successful!
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                You now have access to "{context.metadata.title}"
              </p>
              {txId && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Transaction ID:
                  </p>
                  <p className="text-xs font-mono text-gray-900 dark:text-white break-all">
                    {txId}
                  </p>
                </div>
              )}
              <button
                onClick={onPurchaseComplete}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Purchase Failed
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {error || 'An unexpected error occurred during the purchase.'}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
