import { AIContext, EncryptedContextData } from '../types/context.types';
import { encryptData, decryptData } from '../utils/encryption';

// IPFS configuration
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const PINATA_BASE_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

// Fallback to public IPFS gateways
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/'
];

export interface IPFSUploadResult {
  ipfsHash: string;
  size: number;
  timestamp: Date;
}

export interface IPFSService {
  uploadContext(data: AIContext): Promise<IPFSUploadResult>;
  retrieveContext(ipfsHash: string): Promise<AIContext>;
  pinContext(ipfsHash: string): Promise<boolean>;
  encryptContext(data: AIContext, key: string): Promise<EncryptedContextData>;
  decryptContext(encryptedData: EncryptedContextData, key: string): Promise<AIContext>;
  uploadFile(file: File): Promise<IPFSUploadResult>;
  getFileUrl(ipfsHash: string): string;
}

class IPFSServiceImpl implements IPFSService {
  private cache: Map<string, AIContext> = new Map();
  private maxCacheSize = 100;
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

  /**
   * Upload AI context to IPFS with Pinata pinning
   */
  async uploadContext(data: AIContext): Promise<IPFSUploadResult> {
    try {
      // Validate context data
      this.validateContext(data);

      // Convert to JSON
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });

      // Upload to IPFS via Pinata
      const result = await this.uploadToPinata(blob, `context-${data.metadata.title}.json`);
      
      // Cache the context
      this.addToCache(result.ipfsHash, data);

      return result;
    } catch (error) {
      console.error('Failed to upload context to IPFS:', error);
      throw new Error(`IPFS upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve AI context from IPFS with fallback gateways
   */
  async retrieveContext(ipfsHash: string): Promise<AIContext> {
    // Check cache first
    if (this.cache.has(ipfsHash)) {
      return this.cache.get(ipfsHash)!;
    }

    let lastError: Error | null = null;

    // Try each gateway with retry logic
    for (const gateway of IPFS_GATEWAYS) {
      for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
        try {
          const url = `${gateway}${ipfsHash}`;
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const contextData: AIContext = await response.json();
          
          // Validate retrieved context
          this.validateContext(contextData);
          
          // Cache the context
          this.addToCache(ipfsHash, contextData);

          return contextData;
        } catch (error) {
          lastError = error as Error;
          console.warn(`Attempt ${attempt} failed for gateway ${gateway}:`, error);
          
          if (attempt < this.retryAttempts) {
            await this.delay(this.retryDelay * attempt);
          }
        }
      }
    }

    throw new Error(`Failed to retrieve context from IPFS: ${lastError?.message || 'All gateways failed'}`);
  }

  /**
   * Pin context to IPFS using Pinata
   */
  async pinContext(ipfsHash: string): Promise<boolean> {
    try {
      if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        console.warn('Pinata credentials not configured, skipping pin');
        return false;
      }

      const response = await fetch(`${PINATA_BASE_URL}/pinning/pinByHash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        },
        body: JSON.stringify({
          hashToPin: ipfsHash,
          pinataMetadata: {
            name: `DecentralAI-Context-${ipfsHash}`,
            keyvalues: {
              project: 'DecentralAI',
              type: 'ai-context'
            }
          }
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to pin context:', error);
      return false;
    }
  }

  /**
   * Encrypt context data for premium content
   */
  async encryptContext(data: AIContext, key: string): Promise<EncryptedContextData> {
    try {
      const jsonData = JSON.stringify(data);
      return await encryptData(jsonData, key);
    } catch (error) {
      console.error('Failed to encrypt context:', error);
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt context data
   */
  async decryptContext(encryptedData: EncryptedContextData, key: string): Promise<AIContext> {
    try {
      const decryptedJson = await decryptData(encryptedData, key);
      const contextData: AIContext = JSON.parse(decryptedJson);
      
      this.validateContext(contextData);
      return contextData;
    } catch (error) {
      console.error('Failed to decrypt context:', error);
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload any file to IPFS
   */
  async uploadFile(file: File): Promise<IPFSUploadResult> {
    try {
      return await this.uploadToPinata(file, file.name);
    } catch (error) {
      console.error('Failed to upload file to IPFS:', error);
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get public URL for IPFS content
   */
  getFileUrl(ipfsHash: string): string {
    return `${PINATA_GATEWAY}${ipfsHash}`;
  }

  /**
   * Upload data to Pinata
   */
  private async uploadToPinata(data: Blob | File, filename: string): Promise<IPFSUploadResult> {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Pinata API credentials not configured');
    }

    const formData = new FormData();
    formData.append('file', data, filename);
    
    const metadata = JSON.stringify({
      name: filename,
      keyvalues: {
        project: 'DecentralAI',
        uploadedAt: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const response = await fetch(`${PINATA_BASE_URL}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    
    return {
      ipfsHash: result.IpfsHash,
      size: result.PinSize,
      timestamp: new Date()
    };
  }

  /**
   * Validate AI context structure
   */
  private validateContext(context: AIContext): void {
    if (!context || typeof context !== 'object') {
      throw new Error('Invalid context: not an object');
    }

    if (context.version !== '1.0') {
      throw new Error('Invalid context: unsupported version');
    }

    if (!context.metadata || !context.content || !context.licensing) {
      throw new Error('Invalid context: missing required fields');
    }

    if (!context.metadata.title || !context.metadata.description) {
      throw new Error('Invalid context: missing metadata fields');
    }

    if (typeof context.licensing.price !== 'number' || context.licensing.price < 0) {
      throw new Error('Invalid context: invalid price');
    }
  }

  /**
   * Add context to cache with LRU eviction
   */
  private addToCache(ipfsHash: string, context: AIContext): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(ipfsHash, context);
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize
    };
  }
}

// Import mock service for fallback
import mockIPFSService from './ipfs.service.mock';

// Check if Pinata credentials are configured
const isPinataConfigured = () => {
  return PINATA_API_KEY && 
         PINATA_API_KEY !== 'your_pinata_api_key' && 
         PINATA_SECRET_KEY && 
         PINATA_SECRET_KEY !== 'your_pinata_secret_key';
};

// Export appropriate service based on configuration
export const ipfsService = isPinataConfigured() 
  ? new IPFSServiceImpl() 
  : mockIPFSService;

// Log which service is being used
if (!isPinataConfigured()) {
  console.warn('⚠️ Pinata API keys not configured. Using mock IPFS service for development.');
  console.log('To use real IPFS, configure VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY in .env.local');
}

export default ipfsService;

// Export for testing
export { IPFSServiceImpl };
