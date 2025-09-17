import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { blockchainService, TransactionResult, ContextCreationResult, PurchaseResult } from '../services/blockchain.service';

interface AlgorandConfig {
  network: string;
  contextRegistryAppId: number;
  licenseManagerAppId: number;
  governanceTokenAppId: number;
  governanceTokenId: number;
}

// Default configuration - should be loaded from environment
const DEFAULT_CONFIG: AlgorandConfig = {
  network: (import.meta.env.VITE_ALGORAND_NETWORK as any) || 'localnet',
  contextRegistryAppId: parseInt(import.meta.env.VITE_CONTEXT_REGISTRY_APP_ID || '0'),
  licenseManagerAppId: parseInt(import.meta.env.VITE_LICENSE_MANAGER_APP_ID || '0'),
  governanceTokenAppId: parseInt(import.meta.env.VITE_GOVERNANCE_TOKEN_APP_ID || '0'),
  governanceTokenId: parseInt(import.meta.env.VITE_GOVERNANCE_TOKEN_ID || '0'),
};

export interface UseAlgorandReturn {
  // Connection state
  isConnected: boolean;
  address: string | null;
  account: { address: string; balance: number } | null;
  balance: number;
  tokenBalance: number;
  governanceTokenBalance: number;
  isOptedIn: boolean;
  networkStatus: { status: string; lastRound: number };
  
  // Loading states
  isLoading: boolean;
  isTransactionPending: boolean;
  
  // Error state
  error: string | null;
  
  // Service instance
  algorandService: any | null;
  
  // Actions
  refreshBalances: () => Promise<void>;
  optInToGovernanceToken: () => Promise<TransactionResult>;
  createContext: (
    ipfsHash: string,
    metadata: any,
    licensing: any
  ) => Promise<TransactionResult>;
  purchaseLicense: (
    contextId: string,
    licenseTypeId: string,
    paymentAmount: number
  ) => Promise<TransactionResult>;
  rateContext: (contextId: string, rating: number) => Promise<TransactionResult>;
  createProposal: (
    title: string,
    description: string,
    category: string
  ) => Promise<TransactionResult>;
  voteOnProposal: (
    proposalId: string,
    vote: 'for' | 'against',
    voteWeight: number
  ) => Promise<TransactionResult>;
  stakeTokens: (amount: number) => Promise<TransactionResult>;
  unstakeTokens: (amount: number) => Promise<TransactionResult>;
  claimRewards: () => Promise<TransactionResult>;
  clearError: () => void;
}

export const useAlgorand = (): UseAlgorandReturn => {
  const { activeAddress, signTransactions, wallets } = useWallet();
  
  // State
  const [balance, setBalance] = useState<number>(0);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [governanceTokenBalance, setGovernanceTokenBalance] = useState<number>(0);
  const [isOptedIn, setIsOptedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTransactionPending, setIsTransactionPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState({ status: 'disconnected', lastRound: 0 });

  const isConnected = !!activeAddress;
  const account = activeAddress ? { address: activeAddress, balance } : null;

  // Real balance refresh - will be implemented with deployed smart contracts
  const refreshBalances = useCallback(async () => {
    if (!activeAddress) return;
    
    setIsLoading(true);
    try {
      // TODO: Implement real balance fetching from smart contracts
      // For now, set to 0 until contracts are deployed
      setBalance(0);
      setTokenBalance(0);
      setGovernanceTokenBalance(0);
      setNetworkStatus({ status: 'connected', lastRound: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh balances');
    } finally {
      setIsLoading(false);
    }
  }, [activeAddress]);

  const optInToGovernanceToken = useCallback(async (): Promise<TransactionResult> => {
    if (!activeAddress || !signTransactions) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsTransactionPending(true);
    try {
      // Check if smart contracts are deployed
      if (!blockchainService.isDeployed()) {
        throw new Error('Smart contracts not deployed. Please deploy contracts first.');
      }

      // TODO: Implement real opt-in transaction
      throw new Error('Governance token opt-in not yet implemented');
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Opt-in failed';
      setError(error);
      return { success: false, error };
    } finally {
      setIsTransactionPending(false);
    }
  }, [activeAddress, signTransactions]);

  const createContext = useCallback(async (
    ipfsHash: string,
    metadata: any,
    licensing: any
  ): Promise<TransactionResult> => {
    if (!activeAddress || !signTransactions) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsTransactionPending(true);
    try {
      // Check if smart contracts are deployed
      if (!blockchainService.isDeployed()) {
        const deploymentStatus = blockchainService.getDeploymentStatus();
        throw new Error(`Smart contracts not deployed. Status: ${JSON.stringify(deploymentStatus)}`);
      }

      // Use the blockchain service for real transaction
      const result = await blockchainService.createContext(
        signTransactions,
        activeAddress,
        ipfsHash,
        metadata.title,
        licensing.price
      );

      if (!result.success) {
        throw new Error(result.error || 'Context creation failed');
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Context creation failed';
      setError(error);
      return { success: false, error };
    } finally {
      setIsTransactionPending(false);
    }
  }, [activeAddress, signTransactions]);

  const purchaseLicense = useCallback(async (
    contextId: string,
    licenseTypeId: string,
    paymentAmount: number
  ): Promise<TransactionResult> => {
    if (!activeAddress || !signTransactions) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsTransactionPending(true);
    try {
      // Check if smart contracts are deployed
      if (!blockchainService.isDeployed()) {
        const deploymentStatus = blockchainService.getDeploymentStatus();
        throw new Error(`Smart contracts not deployed. Status: ${JSON.stringify(deploymentStatus)}`);
      }

      // Use the blockchain service for real transaction
      const result = await blockchainService.purchaseContext(
        signTransactions,
        activeAddress,
        contextId,
        paymentAmount
      );

      if (!result.success) {
        throw new Error(result.error || 'Purchase failed');
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'License purchase failed';
      setError(error);
      return { success: false, error };
    } finally {
      setIsTransactionPending(false);
    }
  }, [activeAddress, signTransactions]);

  const rateContext = useCallback(async (contextId: string, rating: number): Promise<TransactionResult> => {
    if (!activeAddress || !signTransactions) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsTransactionPending(true);
    try {
      if (!blockchainService.isDeployed()) {
        throw new Error('Smart contracts not deployed. Please deploy contracts first.');
      }

      // TODO: Implement real context rating
      throw new Error('Context rating not yet implemented');
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Rating failed';
      setError(error);
      return { success: false, error };
    } finally {
      setIsTransactionPending(false);
    }
  }, [activeAddress, signTransactions]);

  const createProposal = useCallback(async (
    title: string,
    description: string,
    category: string
  ): Promise<TransactionResult> => {
    if (!activeAddress || !signTransactions) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsTransactionPending(true);
    try {
      if (!blockchainService.isDeployed()) {
        throw new Error('Smart contracts not deployed. Please deploy contracts first.');
      }

      // TODO: Implement real proposal creation
      throw new Error('Proposal creation not yet implemented');
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Proposal creation failed';
      setError(error);
      return { success: false, error };
    } finally {
      setIsTransactionPending(false);
    }
  }, [activeAddress, signTransactions]);

  const voteOnProposal = useCallback(async (proposalId: string, vote: "for" | "against", voteWeight: number): Promise<TransactionResult> => {
    if (!activeAddress || !signTransactions) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsTransactionPending(true);
    try {
      if (!blockchainService.isDeployed()) {
        throw new Error('Smart contracts not deployed. Please deploy contracts first.');
      }

      // TODO: Implement real voting
      throw new Error('Voting not yet implemented');
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Voting failed';
      setError(error);
      return { success: false, error };
    } finally {
      setIsTransactionPending(false);
    }
  }, [activeAddress, signTransactions]);

  const stakeTokens = useCallback(async (amount: number): Promise<TransactionResult> => {
    if (!activeAddress || !signTransactions) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsTransactionPending(true);
    try {
      if (!blockchainService.isDeployed()) {
        throw new Error('Smart contracts not deployed. Please deploy contracts first.');
      }

      // TODO: Implement real token staking
      throw new Error('Token staking not yet implemented');
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Staking failed';
      setError(error);
      return { success: false, error };
    } finally {
      setIsTransactionPending(false);
    }
  }, [activeAddress, signTransactions]);

  const unstakeTokens = useCallback(async (amount: number): Promise<TransactionResult> => {
    if (!activeAddress || !signTransactions) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsTransactionPending(true);
    try {
      if (!blockchainService.isDeployed()) {
        throw new Error('Smart contracts not deployed. Please deploy contracts first.');
      }

      // TODO: Implement real token unstaking
      throw new Error('Token unstaking not yet implemented');
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unstaking failed';
      setError(error);
      return { success: false, error };
    } finally {
      setIsTransactionPending(false);
    }
  }, [activeAddress, signTransactions]);

  const claimRewards = useCallback(async (): Promise<TransactionResult> => {
    if (!activeAddress || !signTransactions) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsTransactionPending(true);
    try {
      if (!blockchainService.isDeployed()) {
        throw new Error('Smart contracts not deployed. Please deploy contracts first.');
      }

      // TODO: Implement real rewards claiming
      throw new Error('Rewards claiming not yet implemented');
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Rewards claiming failed';
      setError(error);
      return { success: false, error };
    } finally {
      setIsTransactionPending(false);
    }
  }, [activeAddress, signTransactions]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize balances when connected
  useEffect(() => {
    if (isConnected) {
      refreshBalances();
    }
  }, [isConnected, refreshBalances]);

  return {
    // Connection state
    isConnected,
    address: activeAddress,
    account,
    balance,
    tokenBalance,
    governanceTokenBalance,
    isOptedIn,
    networkStatus,
    
    // Loading states
    isLoading,
    isTransactionPending,
    
    // Error state
    error,
    
    // Service instance
    algorandService: null, // Mock for now
    
    // Actions
    refreshBalances,
    optInToGovernanceToken,
    createContext,
    purchaseLicense,
    rateContext,
    createProposal,
    voteOnProposal,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    clearError,
  };
};
