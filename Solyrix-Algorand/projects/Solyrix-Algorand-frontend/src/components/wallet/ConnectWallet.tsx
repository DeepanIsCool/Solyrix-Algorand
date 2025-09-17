import React, { useState } from 'react';
import { WalletIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useWallet, WalletId } from '@txnlab/use-wallet-react';
import { toast } from 'react-hot-toast';

const ConnectWallet: React.FC = () => {
  const { wallets, activeAddress } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Don't show if already connected
  if (activeAddress) {
    return null;
  }

  const handleWalletConnect = async (walletId: string) => {
    const wallet = wallets?.find(w => w.id === walletId);
    if (!wallet) return;

    setIsConnecting(true);
    try {
      console.log(`Attempting to connect to ${wallet.metadata.name}...`);
      
      // For Pera wallet, the connect() method will automatically show the QR code
      await wallet.connect();
      
      setIsModalOpen(false);
      toast.success(`Connected to ${wallet.metadata.name}`);
      console.log(`Successfully connected to ${wallet.metadata.name}`);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          toast.error('Connection cancelled by user');
        } else if (error.message.includes('timeout')) {
          toast.error('Connection timeout - please try again');
        } else {
          toast.error(`Failed to connect: ${error.message}`);
        }
      } else {
        toast.error(`Failed to connect to ${wallet.metadata.name}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const isKmd = (walletId: string) => walletId === WalletId.KMD;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <WalletIcon className="w-4 h-4 mr-2" />
        Connect Wallet
      </button>

      {/* Wallet Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Connect Wallet
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Choose a wallet to connect to DecentralAI
                </p>

                <div className="space-y-3">
                  {wallets?.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleWalletConnect(wallet.id)}
                      disabled={isConnecting}
                      className="w-full flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {!isKmd(wallet.id) && (
                        <img
                          src={wallet.metadata.icon}
                          alt={`${wallet.metadata.name} icon`}
                          className="w-8 h-8 rounded-lg"
                        />
                      )}
                      {isKmd(wallet.id) && (
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-300">KMD</span>
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {isKmd(wallet.id) ? 'LocalNet Wallet' : wallet.metadata.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {wallet.id === WalletId.PERA && 'Scan QR code with Pera Wallet mobile app'}
                          {wallet.id === WalletId.DEFLY && 'Connect with Defly Wallet'}
                          {wallet.id === WalletId.EXODUS && 'Connect with Exodus Wallet'}
                          {isKmd(wallet.id) && 'For local development'}
                        </div>
                      </div>
                      {isConnecting && (
                        <div className="w-4 h-4">
                          <svg className="animate-spin w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {wallets?.find(w => w.id === WalletId.PERA) && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <strong>Pera Wallet Instructions:</strong>
                    </p>
                    <ol className="text-xs text-blue-700 dark:text-blue-300 mt-1 ml-4 list-decimal space-y-1">
                      <li>Click "Pera Wallet" above to initiate connection</li>
                      <li>A QR code will appear in a new window/popup</li>
                      <li>Open Pera Wallet app on your mobile device</li>
                      <li>Tap "Scan QR" and scan the displayed QR code</li>
                      <li>Approve the connection in your mobile app</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectWallet;
