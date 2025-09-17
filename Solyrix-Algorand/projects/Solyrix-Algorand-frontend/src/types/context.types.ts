// Type definitions for AI contexts and related data structures

export enum ModelType {
  GPT = 0,
  CLAUDE = 1,
  LLAMA = 2,
  UNIVERSAL = 3
}

export enum ContextCategory {
  PROMPT = 0,
  DATASET = 1,
  MODEL_CONFIG = 2,
  FINE_TUNE = 3
}

export enum LicenseType {
  ONE_TIME = 0,
  SUBSCRIPTION = 1,
  USAGE_BASED = 2,
  COMMERCIAL = 3
}

export interface ModelParameters {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  [key: string]: any;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface DatasetReference {
  name: string;
  description: string;
  format: string;
  size: number;
  ipfsHash: string;
}

export interface AIContextContent {
  systemPrompt?: string;
  examples?: Example[];
  parameters?: ModelParameters;
  tools?: ToolDefinition[];
  datasets?: DatasetReference[];
}

export interface AIContextMetadata {
  title: string;
  description: string;
  author: string;
  created: Date;
  updated: Date;
  tags: string[];
  modelCompatibility: ModelType[];
  category: ContextCategory;
  version: number;
}

export interface AIContextLicensing {
  type: LicenseType;
  terms: string;
  commercialUse: boolean;
  price: number;
  duration?: number; // in seconds, 0 for permanent
  usageLimit?: number; // 0 for unlimited
}

export interface AIContext {
  version: "1.0";
  id?: string;
  ipfsHash?: string;
  metadata: AIContextMetadata;
  content: AIContextContent;
  licensing: AIContextLicensing;
}

export interface ContextStats {
  totalPurchases: number;
  ratingSum: number;
  ratingCount: number;
  averageRating: number;
  isActive: boolean;
}

export interface ContextWithStats extends AIContext {
  stats: ContextStats;
  creatorAddress: string;
  creationTimestamp: number;
  lastUpdated: number;
}

// Encrypted context for premium content
export interface EncryptedContextData {
  encryptedContent: string;
  iv: string;
  salt: string;
  algorithm: string;
}

// Context upload form data
export interface ContextFormData {
  title: string;
  description: string;
  category: ContextCategory;
  modelCompatibility: ModelType[];
  tags: string[];
  systemPrompt?: string;
  examples: Example[];
  parameters?: ModelParameters;
  tools: ToolDefinition[];
  datasets: DatasetReference[];
  licenseType: LicenseType;
  price: number;
  duration?: number;
  usageLimit?: number;
  commercialUse: boolean;
  terms: string;
}

// Search and filter types
export interface ContextFilters {
  category?: ContextCategory;
  modelType?: ModelType;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  tags?: string[];
  author?: string;
  sortBy?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'rating' | 'popularity';
}

export interface SearchResult {
  contexts: ContextWithStats[];
  totalCount: number;
  hasMore: boolean;
}

// License purchase types
export interface LicensePurchase {
  contextId: string;
  licenseTypeId: string;
  userAddress: string;
  purchaseTimestamp: number;
  expiryTimestamp: number;
  usageCount: number;
  usageLimit: number;
  isActive: boolean;
  paymentAmount: number;
}

// User profile types
export interface UserProfile {
  address: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  joinedDate?: Date;
  totalContexts?: number;
  totalSales?: number;
  totalEarnings?: number;
  reputation?: number;
  badges?: string[];
  socialLinks?: {
    twitter?: string;
    github?: string;
    website?: string;
  };
  createdContexts?: string[];
  purchasedLicenses?: string[];
  totalSpent?: number;
  joinDate?: number;
}

// Analytics types
export interface ContextAnalytics {
  contextId: string;
  views: number;
  purchases: number;
  revenue: number;
  ratings: number[];
  popularityScore: number;
  conversionRate: number;
}

export interface PlatformAnalytics {
  totalContexts: number;
  totalUsers: number;
  totalRevenue: number;
  averageRating: number;
  topCategories: Array<{
    category: ContextCategory;
    count: number;
  }>;
  recentActivity: Array<{
    type: 'context_created' | 'license_purchased' | 'context_rated';
    timestamp: number;
    data: any;
  }>;
}
