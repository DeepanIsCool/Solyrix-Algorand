/**
 * Mock IPFS Service for testing without Pinata credentials
 * This service simulates IPFS functionality for development
 */

import { AIContext, ContextCategory, ModelType, LicenseType } from '../types/context.types';

// Export types for use in other files
export interface IPFSUploadResult {
  ipfsHash: string;
  url: string;
  size: number;
  timestamp: number;
}

export interface IPFSRetrieveResult {
  context: AIContext;
  ipfsHash: string;
  cached: boolean;
  retrievedAt: number;
}

export interface EncryptedContextData {
  encryptedData: string;
  iv: string;
  salt: string;
  algorithm: string;
}

export interface IPFSService {
  uploadContext(context: AIContext): Promise<IPFSUploadResult>;
  retrieveContext(ipfsHash: string): Promise<IPFSRetrieveResult>;
  uploadEncrypted(data: EncryptedContextData): Promise<IPFSUploadResult>;
  retrieveEncrypted(ipfsHash: string): Promise<EncryptedContextData>;
  pinContent(ipfsHash: string): Promise<boolean>;
  unpinContent(ipfsHash: string): Promise<boolean>;
  uploadFile(file: File | Blob): Promise<IPFSUploadResult>;
  getFileUrl(ipfsHash: string): string;
}

class MockIPFSService implements IPFSService {
  private mockStorage: Map<string, any> = new Map();
  private mockDelay = 500; // Simulate network delay

  /**
   * Mock upload context to IPFS
   */
  async uploadContext(context: AIContext): Promise<IPFSUploadResult> {
    await this.delay();
    const mockHash = this.generateMockHash();
    this.mockStorage.set(mockHash, context);
    
    console.log('Mock IPFS Upload:', {
      hash: mockHash,
      context: context
    });
    
    return {
      ipfsHash: mockHash,
      url: `https://mock-gateway.ipfs.io/${mockHash}`,
      size: JSON.stringify(context).length,
      timestamp: Date.now()
    };
  }

  /**
   * Mock retrieve context from IPFS
   */
  async retrieveContext(ipfsHash: string): Promise<IPFSRetrieveResult> {
    await this.delay();
    const context = this.mockStorage.get(ipfsHash);
    
    if (!context) {
      // Return a mock context if not found
      return {
        context: this.createMockContext(),
        ipfsHash,
        cached: false,
        retrievedAt: Date.now()
      };
    }
    
    return {
      context,
      ipfsHash,
      cached: false,
      retrievedAt: Date.now()
    };
  }

  /**
   * Mock upload encrypted data
   */
  async uploadEncrypted(data: EncryptedContextData): Promise<IPFSUploadResult> {
    await this.delay();
    const mockHash = this.generateMockHash();
    this.mockStorage.set(mockHash, data);
    
    return {
      ipfsHash: mockHash,
      url: `https://mock-gateway.ipfs.io/${mockHash}`,
      size: JSON.stringify(data).length,
      timestamp: Date.now()
    };
  }

  /**
   * Mock retrieve encrypted data
   */
  async retrieveEncrypted(ipfsHash: string): Promise<EncryptedContextData> {
    await this.delay();
    const data = this.mockStorage.get(ipfsHash);
    
    if (!data) {
      return {
        encryptedData: '',
        iv: '',
        salt: '',
        algorithm: 'AES-GCM'
      };
    }
    
    return data;
  }

  /**
   * Mock pin content
   */
  async pinContent(ipfsHash: string): Promise<boolean> {
    await this.delay();
    console.log(`Mock: Pinned content ${ipfsHash}`);
    return true;
  }

  /**
   * Mock unpin content
   */
  async unpinContent(ipfsHash: string): Promise<boolean> {
    await this.delay();
    console.log(`Mock: Unpinned content ${ipfsHash}`);
    return true;
  }

  /**
   * Mock upload any file
   */
  async uploadFile(file: File | Blob): Promise<IPFSUploadResult> {
    await this.delay();
    const mockHash = this.generateMockHash();
    
    // Read file content as text for mock storage
    const content = await file.text();
    this.mockStorage.set(mockHash, content);
    
    console.log('Mock IPFS File Upload:', {
      hash: mockHash,
      filename: file instanceof File ? file.name : 'blob',
      size: file.size,
      type: file.type
    });
    
    return {
      ipfsHash: mockHash,
      url: `https://mock-gateway.ipfs.io/${mockHash}`,
      size: file.size,
      timestamp: Date.now()
    };
  }

  /**
   * Get public URL for IPFS content
   */
  getFileUrl(ipfsHash: string): string {
    return `https://mock-gateway.ipfs.io/${ipfsHash}`;
  }

  /**
   * Helper: Generate mock IPFS hash
   */
  private generateMockHash(): string {
    const chars = 'QmabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let hash = 'Qm';
    for (let i = 0; i < 44; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }

  /**
   * Helper: Create mock context for testing
   */
  private createMockContext(): AIContext {
    return {
      version: "1.0",
      id: `mock-${Date.now()}`,
      ipfsHash: this.generateMockHash(),
      metadata: {
        title: 'Mock Context',
        description: 'This is a mock context for testing',
        tags: ['mock', 'test'],
        category: ContextCategory.PROMPT,
        modelCompatibility: [ModelType.GPT],
        author: 'Mock Author',
        version: 1,
        created: new Date(),
        updated: new Date()
      },
      content: {
        systemPrompt: 'You are a mock AI assistant',
        examples: [],
        parameters: {}
      },
      licensing: {
        type: LicenseType.ONE_TIME,
        price: 0,
        terms: 'Mock terms for testing',
        commercialUse: true
      }
    };
  }

  /**
   * Helper: Simulate network delay
   */
  private delay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.mockDelay));
  }
}

// Export singleton instance
export const mockIPFSService = new MockIPFSService();
export default mockIPFSService;
