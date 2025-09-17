import { useState, useEffect, useCallback } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';

// Create the PeraWalletConnect instance outside of the hook
const peraWallet = new PeraWalletConnect({
  chainId: import.meta.env.VITE_ALGOD_NETWORK === 'mainnet' ? 416001 : 
           import.meta.env.VITE_ALGOD_NETWORK === 'testnet' ? 416002 : 
           import.meta.env.VITE_ALGOD_NETWORK === 'betanet' ? 416003 : 4160,
  shouldShowSignTxnToast: true
});

export interface PeraWalletState {
  isConnected: boolean;
  accountAddress: string | null;
  balance: number;
  isConnecting: boolean;
  error: string | null;
}

export interface PeraWalletActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (txn: algosdk.Transaction) => Promise<Uint8Array>;
  signTransactions: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>;
  getBalance: () => Promise<number>;
}

export type UsePeraWalletReturn = PeraWalletState & PeraWalletActions;

export const usePeraWallet = (): UsePeraWalletReturn => {
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!accountAddress;

  // Initialize Algod client
  const getAlgodClient = useCallback(() => {
    const server = import.meta.env.VITE_ALGOD_SERVER || 'http://localhost';
    const port = import.meta.env.VITE_ALGOD_PORT || '4001';
    const token = import.meta.env.VITE_ALGOD_TOKEN || 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    
    return new algosdk.Algodv2(token, server, port);
  }, []);

  // Get account balance
  const getBalance = useCallback(async (): Promise<number> => {
    if (!accountAddress) return 0;
    
    try {
      const algodClient = getAlgodClient();
      const accountInfo = await algodClient.accountInformation(accountAddress).do();
      const balanceInMicroAlgos = Number(accountInfo.amount);
      setBalance(balanceInMicroAlgos);
      return balanceInMicroAlgos;
    } catch (err) {
      console.error('Failed to get balance:', err);
      setError('Failed to get balance');
      return 0;
    }
  }, [accountAddress, getAlgodClient]);

  // Connect to Pera Wallet
  const connect = useCallback(async (): Promise<void> => {
    setIsConnecting(true);
    setError(null);

    try {
      const newAccounts = await peraWallet.connect();
      
      // Setup the disconnect event listener
      peraWallet.connector?.on('disconnect', handleDisconnect);
      
      if (newAccounts.length > 0) {
        setAccountAddress(newAccounts[0]);
      }
    } catch (err: any) {
      // Handle the case where user closes the modal
      if (err?.data?.type !== 'CONNECT_MODAL_CLOSED') {
        console.error('Failed to connect to Pera Wallet:', err);
        setError('Failed to connect to Pera Wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect from Pera Wallet
  const handleDisconnect = useCallback(() => {
    peraWallet.disconnect();
    setAccountAddress(null);
    setBalance(0);
    setError(null);
  }, []);

  const disconnect = useCallback(() => {
    handleDisconnect();
  }, [handleDisconnect]);

  // Sign a single transaction
  const signTransaction = useCallback(async (txn: algosdk.Transaction): Promise<Uint8Array> => {
    if (!accountAddress) {
      throw new Error('No account connected');
    }

    try {
      const signedTxn = await peraWallet.signTransaction([[{ txn }]]);
      return signedTxn[0];
    } catch (err) {
      console.error('Failed to sign transaction:', err);
      throw new Error('Failed to sign transaction');
    }
  }, [accountAddress]);

  // Sign multiple transactions
  const signTransactions = useCallback(async (txns: algosdk.Transaction[]): Promise<Uint8Array[]> => {
    if (!accountAddress) {
      throw new Error('No account connected');
    }

    try {
      const signerTxns = txns.map(txn => ({ txn }));
      const signedTxns = await peraWallet.signTransaction([signerTxns]);
      return signedTxns;
    } catch (err) {
      console.error('Failed to sign transactions:', err);
      throw new Error('Failed to sign transactions');
    }
  }, [accountAddress]);

  // Reconnect session on mount
  useEffect(() => {
    const reconnectSession = async () => {
      try {
        const accounts = await peraWallet.reconnectSession();
        
        // Setup the disconnect event listener
        peraWallet.connector?.on('disconnect', handleDisconnect);
        
        if (peraWallet.isConnected && accounts.length > 0) {
          setAccountAddress(accounts[0]);
        }
      } catch (err) {
        console.error('Failed to reconnect session:', err);
      }
    };

    reconnectSession();
  }, [handleDisconnect]);

  // Update balance when account changes
  useEffect(() => {
    if (accountAddress) {
      getBalance();
      
      // Set up periodic balance updates
      const interval = setInterval(getBalance, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [accountAddress, getBalance]);

  return {
    isConnected,
    accountAddress,
    balance,
    isConnecting,
    error,
    connect,
    disconnect,
    signTransaction,
    signTransactions,
    getBalance
  };
};

// Export the peraWallet instance for direct access if needed
export { peraWallet };
