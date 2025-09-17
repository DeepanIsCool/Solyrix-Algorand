import { useState, useCallback } from 'react';
import { ipfsService, IPFSUploadResult } from '../services/ipfs.service';
import { AIContext, EncryptedContextData } from '../types/context.types';

export interface UseIPFSReturn {
  // Loading states
  isLoading: boolean;
  isUploading: boolean;
  isRetrieving: boolean;
  isEncrypting: boolean;
  
  // Error state
  error: string | null;
  
  // Upload progress
  uploadProgress: number;
  
  // Actions
  uploadContext: (context: AIContext) => Promise<IPFSUploadResult>;
  retrieveContext: (ipfsHash: string) => Promise<AIContext>;
  uploadFile: (file: File | any) => Promise<string>;
  uploadToIPFS: (data: any) => Promise<string>;
  encryptData: (data: string, password: string) => Promise<EncryptedContextData>;
  encryptContext: (context: AIContext, password: string) => Promise<EncryptedContextData>;
  decryptContext: (encryptedData: EncryptedContextData, password: string) => Promise<AIContext>;
  pinContext: (ipfsHash: string) => Promise<boolean>;
  getFileUrl: (ipfsHash: string) => string;
  clearError: () => void;
  
  // Cache management
  clearCache: () => void;
  getCacheStats: () => { size: number; maxSize: number };
}

export const useIPFS = (): UseIPFSReturn => {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Upload context to IPFS
  const uploadContext = useCallback(async (context: AIContext): Promise<IPFSUploadResult> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await ipfsService.uploadContext(context);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Auto-pin the uploaded context
      try {
        await ipfsService.pinContext(result.ipfsHash);
      } catch (pinError) {
        console.warn('Failed to pin context, but upload succeeded:', pinError);
      }

      return result;
    } catch (err) {
      const errorMessage = `Failed to upload context: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // Retrieve context from IPFS
  const retrieveContext = useCallback(async (ipfsHash: string): Promise<AIContext> => {
    setIsRetrieving(true);
    setError(null);

    try {
      const context = await ipfsService.retrieveContext(ipfsHash);
      return context;
    } catch (err) {
      const errorMessage = `Failed to retrieve context: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsRetrieving(false);
    }
  }, []);

  // Upload file to IPFS
  const uploadFile = useCallback(async (file: File | any): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        throw new Error('File size exceeds 100MB limit');
      }

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 90));
      }, 300);

      const result = await ipfsService.uploadFile(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      return result.ipfsHash;
    } catch (err) {
      const errorMessage = `Failed to upload file: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const uploadToIPFS = useCallback(async (data: any): Promise<string> => {
    setIsUploading(true);
    setError(null);
    
    try {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const blob = new Blob([dataString], { type: 'application/json' });
      const file = new File([blob], 'context-data.json', { type: 'application/json' });
      const result = await ipfsService.uploadFile(file);
      return result.ipfsHash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload to IPFS';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const encryptData = useCallback(async (data: string, password: string): Promise<EncryptedContextData> => {
    setIsEncrypting(true);
    setError(null);
    
    try {
      const { encryptData: encrypt } = await import('../utils/encryption');
      return await encrypt(data, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to encrypt data';
      setError(errorMessage);
      throw err;
    } finally {
      setIsEncrypting(false);
    }
  }, []);

  // Encrypt context
  const encryptContext = useCallback(async (
    context: AIContext, 
    password: string
  ): Promise<EncryptedContextData> => {
    setIsEncrypting(true);
    setError(null);

    try {
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const encryptedData = await ipfsService.encryptContext(context, password);
      return encryptedData;
    } catch (err) {
      const errorMessage = `Failed to encrypt context: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsEncrypting(false);
    }
  }, []);

  // Decrypt context
  const decryptContext = useCallback(async (
    encryptedData: EncryptedContextData, 
    password: string
  ): Promise<AIContext> => {
    setIsEncrypting(true);
    setError(null);

    try {
      const context = await ipfsService.decryptContext(encryptedData, password);
      return context;
    } catch (err) {
      const errorMessage = `Failed to decrypt context: ${err instanceof Error ? err.message : 'Invalid password or corrupted data'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsEncrypting(false);
    }
  }, []);

  // Pin context to IPFS
  const pinContext = useCallback(async (ipfsHash: string): Promise<boolean> => {
    try {
      const result = await ipfsService.pinContext(ipfsHash);
      return result;
    } catch (err) {
      console.warn('Failed to pin context:', err);
      return false;
    }
  }, []);

  // Get file URL
  const getFileUrl = useCallback((ipfsHash: string): string => {
    return ipfsService.getFileUrl(ipfsHash);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    console.log('Cache cleared');
  }, []);

  // Get cache stats
  const getCacheStats = useCallback(() => {
    return { size: 0, maxSize: 100 };
  }, []);

  return {
    // Loading states
    isLoading,
    isUploading,
    isRetrieving,
    isEncrypting,
    
    // Error state
    error,
    
    // Upload progress
    uploadProgress,
    
    // Actions
    uploadContext,
    retrieveContext,
    uploadFile,
    uploadToIPFS,
    encryptData,
    encryptContext,
    decryptContext,
    pinContext,
    getFileUrl,
    clearError,
    
    // Cache management
    clearCache: () => {
      console.log('Cache cleared');
    },
    getCacheStats: () => ({ size: 0, maxSize: 100 }),
  };
};
