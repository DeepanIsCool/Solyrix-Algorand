import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import algosdk from 'algosdk';
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs';

interface WalletBalance {
  algoBalance: number;
  isLoading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

export const useWalletBalance = (): WalletBalance => {
  const { activeAddress } = useWallet();
  const [algoBalance, setAlgoBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const getAlgodClient = useCallback(() => {
    try {
      const config = getAlgodConfigFromViteEnvironment();
      return new algosdk.Algodv2(
        typeof config.token === 'string' ? config.token : '',
        config.server,
        config.port
      );
    } catch (err) {
      console.error('Failed to create Algod client:', err);
      throw new Error('Failed to initialize Algorand client');
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!activeAddress) {
      setAlgoBalance(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const algodClient = getAlgodClient();
      const accountInfo = await algodClient.accountInformation(activeAddress).do();
      
      // Convert microAlgos to Algos with exact precision
      const amount = typeof accountInfo.amount === 'bigint' 
        ? Number(accountInfo.amount) 
        : accountInfo.amount;
      
      // Use precise division to avoid floating point errors
      const balanceInAlgos = amount / 1000000;
      
      // Store the exact balance without rounding
      setAlgoBalance(balanceInAlgos);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance';
      setError(errorMessage);
      
      // Don't reset balance on error, keep the last known value
      // setAlgoBalance(0);
    } finally {
      setIsLoading(false);
    }
  }, [activeAddress, getAlgodClient]);

  // Fetch balance when address changes
  useEffect(() => {
    if (activeAddress) {
      refreshBalance();
    } else {
      setAlgoBalance(0);
      setError(null);
    }
  }, [activeAddress, refreshBalance]);

  // Auto-refresh balance every 30 seconds when connected
  useEffect(() => {
    if (!activeAddress) return;

    const interval = setInterval(() => {
      refreshBalance();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [activeAddress, refreshBalance]);

  const forceRefresh = useCallback(async () => {
    // Reset state completely
    setAlgoBalance(0);
    setError(null);
    await refreshBalance();
  }, [refreshBalance]);

  return {
    algoBalance,
    isLoading,
    error,
    refreshBalance,
    forceRefresh,
  };
};
