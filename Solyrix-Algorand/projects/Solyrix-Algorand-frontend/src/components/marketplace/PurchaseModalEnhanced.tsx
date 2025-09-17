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
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WalletIcon,
  UserIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  DocumentDuplicateIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface PurchaseModalProps {
  context: ContextWithStats;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: () => void;
}

const PurchaseModalEnhanced: React.FC<PurchaseModalProps> = ({
  context,
  isOpen,
  onClose,
  onPurchaseComplete
}) => {
  const { 
    isConnected, 
    account,
    purchaseLicense, 
    isTransactionPending 
  } = useAlgorand();
  
  const { algoBalance, isLoading: balanceLoading, refreshBalance } = useWalletBalance();
  
  const [step, setStep] = useState<'review' | 'confirm' | 'processing' | 'success' | 'error'>('review');
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  // Calculate fees and revenue split
  const price = context.licensing.price || 0;
  const platformFee = price * 0.025; // 2.5% platform fee
  const developerRevenue = price * 0.975; // 97.5% to developer
  const priceInAlgo = microAlgosToAlgo(price);
  const platformFeeInAlgo = microAlgosToAlgo(platformFee);
  const developerRevenueInAlgo = microAlgosToAlgo(developerRevenue);

  // Check if user has sufficient balance
  const hasSufficientBalance = algoBalance >= priceInAlgo;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('review');
      setError(null);
      setTxId(null);
      refreshBalance();
    }
  }, [isOpen, refreshBalance]);

  const handleProceedToConfirm = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!hasSufficientBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setStep('confirm');
  };

  const handleConfirmPurchase = async () => {
    setStep('processing');
    setError(null);

    try {
      // Simulate payment processing with proper revenue split
      const contextId = context.id || `context_${Date.now()}`;
      const licenseTypeId = `license_${context.licensing.type}`;
      
      // In production, this would send the transaction with proper revenue split
      // Platform fee goes to platform wallet
      // Developer revenue goes to context creator wallet
      const result = await purchaseLicense(
        contextId,
        licenseTypeId,
        price
      );

      setTxId(result.txId || `demo_tx_${Date.now()}`);
      setStep('success');
      toast.success('Purchase completed successfully!');
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        onPurchaseComplete();
      }, 5000);
      
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        {/* Background overlay with blur */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <ShoppingCartIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Purchase AI Context</h2>
                  <p className="text-sm opacity-90">Secure blockchain transaction</p>
                </div>
              </div>
              {step !== 'processing' && (
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Web3 Badges */}
            <div className="flex gap-2 mt-4">
              <Web3Badge type="onchain" />
              <Web3Badge type="testnet" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Review Step */}
            {step === 'review' && (
              <div className="space-y-6">
                {/* Context Details */}
                <GradientCard variant="primary" hover={false}>
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <SparklesIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          {context.metadata.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {context.metadata.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {context.metadata.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </GradientCard>

                {/* License Details */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                    <span className="font-medium">License Type:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {context.licensing.type === LicenseType.ONE_TIME 
                        ? 'One-time Purchase'
                        : context.licensing.type === LicenseType.SUBSCRIPTION
                        ? 'Subscription'
                        : 'Usage-based'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Commercial Use:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {context.licensing.commercialUse ? 'Allowed' : 'Not Allowed'}
                    </span>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-5">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                    Payment Breakdown
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Context Price</span>
                      <span className="font-bold text-lg">{formatMicroAlgosToAlgo(price)} ALGO</span>
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 flex items-center">
                          <ArrowsRightLeftIcon className="w-4 h-4 mr-1" />
                          Platform Fee (2.5%)
                        </span>
                        <span className="text-orange-500">{formatMicroAlgosToAlgo(platformFee)} ALGO</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 flex items-center">
                          <UserIcon className="w-4 h-4 mr-1" />
                          Developer Receives (97.5%)
                        </span>
                        <span className="text-green-500">{formatMicroAlgosToAlgo(developerRevenue)} ALGO</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 dark:text-white">Total Payment</span>
                        <span className="font-bold text-xl text-blue-600 dark:text-blue-400">
                          {formatMicroAlgosToAlgo(price)} ALGO
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wallet Balance */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <WalletIcon className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium">Your Balance:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {balanceLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <span className={`font-bold ${hasSufficientBalance ? 'text-green-500' : 'text-red-500'}`}>
                          {algoBalance.toFixed(6)} ALGO
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {!hasSufficientBalance && (
                    <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                        Insufficient balance. You need {(priceInAlgo - algoBalance).toFixed(6)} more ALGO.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Confirm Step */}
            {step === 'confirm' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheckIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Confirm Your Purchase
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You are about to purchase this AI context for{' '}
                    <span className="font-bold text-blue-600">{formatMicroAlgosToAlgo(price)} ALGO</span>
                  </p>
                </div>

                {/* Transaction Details */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">From Wallet:</span>
                    <span className="font-mono text-xs">{account?.address.slice(0, 8)}...{account?.address.slice(-8)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">To Developer:</span>
                    <span className="font-mono text-xs">{context.creatorAddress.slice(0, 8)}...{context.creatorAddress.slice(-8)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Network:</span>
                    <span>Algorand TestNet</span>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    ⚠️ This transaction is final and cannot be reversed. Please ensure you want to proceed.
                  </p>
                </div>
              </div>
            )}

            {/* Processing Step */}
            {step === 'processing' && (
              <div className="text-center py-8">
                <div className="mb-4">
                  <LoadingSpinner size="lg" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Processing Transaction...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we process your payment on the blockchain
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  Do not close this window
                </p>
              </div>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                  <CheckCircleIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Purchase Successful! 🎉
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You now have access to this AI context
                </p>

                {txId && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Transaction ID:</p>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="font-mono text-xs">{txId.slice(0, 20)}...</span>
                      <button
                        onClick={() => copyToClipboard(txId)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-500">
                  This window will close automatically in a few seconds...
                </p>
              </div>
            )}

            {/* Error Step */}
            {step === 'error' && (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
                  <ExclamationTriangleIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Purchase Failed
                </h3>
                <p className="text-red-600 dark:text-red-400 mb-4">
                  {error || 'An unexpected error occurred'}
                </p>
                <button
                  onClick={() => setStep('review')}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {(step === 'review' || step === 'confirm') && (
            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={step === 'confirm' ? () => setStep('review') : handleClose}
                  className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 transition-colors"
                >
                  {step === 'confirm' ? 'Back' : 'Cancel'}
                </button>
                
                {step === 'review' ? (
                  <button
                    onClick={handleProceedToConfirm}
                    disabled={!isConnected || !hasSufficientBalance || balanceLoading}
                    className="group px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all flex items-center shadow-lg"
                  >
                    Proceed to Payment
                    <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmPurchase}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all shadow-lg"
                  >
                    Confirm Purchase
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseModalEnhanced;
