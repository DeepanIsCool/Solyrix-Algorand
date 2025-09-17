import React, { useState } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon, 
  ChevronDownIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useWalletBalance } from '../../hooks/useWalletBalance';
import { formatExactBalance } from '../../utils/formatBalance';

const Account: React.FC = () => {
  const { activeAddress, wallets } = useWallet();
  const { algoBalance, isLoading: isBalanceLoading, error: balanceError, refreshBalance, forceRefresh } = useWalletBalance();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleDisconnect = async () => {
    try {
      const activeWallet = wallets?.find(w => w.isActive);
      if (activeWallet) {
        await activeWallet.disconnect();
      }
      setIsDropdownOpen(false);
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const handleCopyAddress = async () => {
    if (activeAddress) {
      try {
        await navigator.clipboard.writeText(activeAddress);
        setCopiedAddress(true);
        toast.success('Address copied to clipboard');
        setTimeout(() => setCopiedAddress(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
        toast.error('Failed to copy address');
      }
    }
  };

  const handleRefreshBalance = async () => {
    try {
      await forceRefresh();
      toast.success('Balance refreshed');
    } catch (error) {
      console.error('Failed to refresh balance:', error);
      toast.error('Failed to refresh balance');
    }
  };


  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!activeAddress) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <UserCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {formatAddress(activeAddress)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {isBalanceLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : balanceError ? (
              <span className="text-red-500">Error</span>
            ) : (
              `${formatExactBalance(algoBalance)} ALGO`
            )}
          </div>
        </div>
        <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4">
            {/* Wallet Info */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Pera Wallet
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Connected
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-sm font-mono text-gray-900 dark:text-white">
                  {formatAddress(activeAddress)}
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {copiedAddress ? (
                    <CheckIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Balances */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">ALGO Balance</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {isBalanceLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading...
                      </span>
                    ) : balanceError ? (
                      <span className="text-red-500 text-xs">Error loading</span>
                    ) : (
                      `${formatExactBalance(algoBalance)} ALGO`
                    )}
                  </span>
                  <button
                    onClick={handleRefreshBalance}
                    disabled={isBalanceLoading}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                    title="Refresh balance"
                  >
                    <ArrowPathIcon className={`w-3 h-3 ${isBalanceLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Network</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {import.meta.env.VITE_ALGOD_NETWORK || 'LocalNet'}
                </span>
              </div>

              {balanceError && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Failed to load balance: {balanceError}
                  </p>
                </div>
              )}

            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <button
                onClick={handleDisconnect}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Disconnect Wallet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default Account;
