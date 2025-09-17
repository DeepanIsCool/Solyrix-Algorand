import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AIContext,
  AIContextMetadata,
  AIContextContent,
  AIContextLicensing,
  ContextCategory,
  ModelType,
  LicenseType
} from '../types/context.types';
import { useAlgorand } from '../hooks/useAlgorand';
import { useIPFS } from '../hooks/useIPFS';
import { formatMicroAlgosToAlgo } from '../utils/formatBalance';
import LoadingSpinner from '../components/common/LoadingSpinner';
import GradientCard from '../components/common/GradientCard';
import Web3Badge from '../components/common/Web3Badge';
import {
  DocumentTextIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  CurrencyDollarIcon,
  TagIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

const CreateContext: React.FC = () => {
  const navigate = useNavigate();
  const { account, createContext, isLoading: algorandLoading } = useAlgorand();
  const { uploadFile, isLoading: ipfsLoading } = useIPFS();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [metadata, setMetadata] = useState<AIContextMetadata>({
    title: '',
    description: '',
    tags: [],
    modelCompatibility: [],
    category: ContextCategory.PROMPT,
    version: 1,
    author: account?.address || '',
    created: new Date(),
    updated: new Date()
  });

  const [content, setContent] = useState<Partial<AIContextContent>>({
    systemPrompt: '',
    examples: [],
    parameters: { temperature: 0.7, maxTokens: 2048 }
  });

  const [licensing, setLicensing] = useState<Partial<AIContextLicensing>>({
    type: LicenseType.ONE_TIME,
    terms: '',
    commercialUse: true,
    price: 1000000 // 1 ALGO in microAlgos
  });

  const [encryptContent, setEncryptContent] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState('');

  // Handle tag input
  const [tagInput, setTagInput] = useState('');
  const addTag = useCallback(() => {
    if (tagInput.trim() && !metadata.tags?.includes(tagInput.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  }, [tagInput, metadata.tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  }, []);

  // Handle model compatibility
  const toggleModelCompatibility = useCallback((modelType: string | ModelType) => {
    const type = modelType as ModelType;
    setMetadata(prev => ({
      ...prev,
      modelCompatibility: prev.modelCompatibility?.includes(type)
        ? prev.modelCompatibility.filter(t => t !== type)
        : [...(prev.modelCompatibility || []), type]
    }));
  }, []);

  // Add example
  const addExample = useCallback(() => {
    setContent(prev => ({
      ...prev,
      examples: [
        ...(prev.examples || []),
        { input: '', output: '', explanation: '' }
      ]
    }));
  }, []);

  const updateExample = useCallback((index: number, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      examples: prev.examples?.map((example, i) => 
        i === index ? { ...example, [field]: value } : example
      ) || []
    }));
  }, []);

  const removeExample = useCallback((index: number) => {
    setContent(prev => ({
      ...prev,
      examples: prev.examples?.filter((_, i) => i !== index) || []
    }));
  }, []);

  // Validation
  const validateStep = useCallback((stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(
          metadata.title?.trim() &&
          metadata.description?.trim() &&
          metadata.tags?.length &&
          metadata.modelCompatibility?.length
        );
      case 2:
        if (metadata.category === ContextCategory.PROMPT) {
          return !!content.systemPrompt?.trim();
        }
        if (metadata.category === ContextCategory.DATASET) {
          return !!(content.datasets?.length);
        }
        if (metadata.category === ContextCategory.MODEL_CONFIG) {
          return !!(content.parameters || content.tools?.length);
        }
        return true;
      case 3:
        return !!(
          licensing.terms?.trim() &&
          licensing.price &&
          licensing.price > 0
        );
      default:
        return true;
    }
  }, [metadata, content, licensing]);

  // Submit form
  const handleSubmit = useCallback(async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare content for upload
      let contentToUpload = { ...content };
      
      // Encrypt content if requested
      if (encryptContent && encryptionPassword) {
        // Import encryption function
        const { encryptData } = await import('../utils/encryption');
        const contentString = JSON.stringify(contentToUpload);
        const encryptedData = await encryptData(contentString, encryptionPassword);
        contentToUpload = encryptedData as any;
      }

      // Upload to IPFS
      const ipfsHash = await uploadFile(contentToUpload);

      // Prepare metadata with current timestamp
      const finalMetadata: AIContextMetadata = {
        ...metadata,
        author: account?.address || '',
        created: new Date(),
        updated: new Date()
      };

      // Create context on blockchain
      await createContext(
        ipfsHash,
        finalMetadata,
        licensing as AIContextLicensing
      );

      // Navigate to marketplace or success page
      navigate('/marketplace', { 
        state: { message: 'Context created successfully!' }
      });

    } catch (err) {
      console.error('Failed to create context:', err);
      setError(err instanceof Error ? err.message : 'Failed to create context');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    account,
    content,
    encryptContent,
    encryptionPassword,
    metadata,
    licensing,
    createContext,
    navigate,
    uploadFile
  ]);

  const isLoading = algorandLoading || ipfsLoading || isSubmitting;

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Create AI Context
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Please connect your wallet to create and upload AI contexts to the marketplace.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header with Web3 Badges */}
      <div className="mb-8 text-center">
        <div className="flex justify-center gap-2 mb-4">
          <Web3Badge type="onchain" animated />
          <Web3Badge type="ipfs" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Create AI Context
          </span>
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Upload your AI prompts, datasets, or model configurations to the decentralized marketplace
        </p>
      </div>

      {/* Enhanced Progress Steps */}
      <div className="mb-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[
            { num: 1, label: 'Metadata', icon: DocumentTextIcon },
            { num: 2, label: 'Content', icon: CpuChipIcon },
            { num: 3, label: 'Licensing', icon: ShieldCheckIcon }
          ].map((s, index) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={`
                  flex items-center justify-center w-16 h-16 rounded-full
                  transition-all duration-300 transform
                  ${
                    step >= s.num
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110 shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }
                `}>
                  {step > s.num ? (
                    <CheckCircleIcon className="w-8 h-8" />
                  ) : (
                    <s.icon className="w-8 h-8" />
                  )}
                </div>
                <span className={`
                  mt-2 text-sm font-medium transition-colors
                  ${step >= s.num ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}
                `}>
                  {s.label}
                </span>
              </div>
              {index < 2 && (
                <div className={`
                  flex-1 h-1 mx-4 rounded-full transition-all duration-500
                  ${
                    step > s.num
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }
                `} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error mb-6">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <GradientCard variant="primary" hover={false}>
        <div className="p-8">
          {/* Step 1: Metadata */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Context Metadata
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Basic information about your AI context
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <SparklesIcon className="inline w-4 h-4 mr-1" />
                    Title *
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="E.g., Advanced ChatBot Personality Framework"
                    value={metadata.title || ''}
                  onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <DocumentTextIcon className="inline w-4 h-4 mr-1" />
                    Description *
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full h-32 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Describe your AI context, its purpose, and how to use it"
                    value={metadata.description || ''}
                    onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <TagIcon className="inline w-4 h-4 mr-1" />
                    Category *
                  </label>
                  <select
                    className="select select-bordered w-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 transition-all"
                    value={metadata.category}
                    onChange={(e) => setMetadata(prev => ({ 
                      ...prev, 
                      category: parseInt(e.target.value) as ContextCategory 
                    }))}
                  >
                    <option value={ContextCategory.PROMPT}>🎯 Prompt</option>
                    <option value={ContextCategory.DATASET}>📊 Dataset</option>
                    <option value={ContextCategory.MODEL_CONFIG}>⚙️ Model Config</option>
                    <option value={ContextCategory.FINE_TUNE}>🔧 Fine-tune</option>
                  </select>
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Version
                </label>
                <input
                  type="number"
                  min="1"
                  className="input input-bordered w-full"
                  value={metadata.version || 1}
                  onChange={(e) => setMetadata(prev => ({ 
                    ...prev, 
                    version: parseInt(e.target.value) || 1 
                  }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags *
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {metadata.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                        onClick={() => removeTag(tag)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={addTag}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model Compatibility *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(ModelType).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={metadata.modelCompatibility?.includes(value as ModelType) || false}
                        onChange={() => toggleModelCompatibility(value as ModelType)}
                      />
                      <span className="text-sm">{key.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Step 2: Content */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <CpuChipIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Context Content
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Define your AI context configuration
                  </p>
                </div>
              </div>

            {metadata.category === ContextCategory.PROMPT && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    System Prompt *
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full h-32"
                    placeholder="Enter your system prompt..."
                    value={content.systemPrompt || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Examples (Optional)
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={addExample}
                    >
                      Add Example
                    </button>
                  </div>
                  
                  {content.examples?.map((example, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Example {index + 1}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost text-red-500"
                          onClick={() => removeExample(index)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          placeholder="Input"
                          value={example.input}
                          onChange={(e) => updateExample(index, 'input', e.target.value)}
                        />
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          placeholder="Expected Output"
                          value={example.output}
                          onChange={(e) => updateExample(index, 'output', e.target.value)}
                        />
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          placeholder="Explanation (Optional)"
                          value={example.explanation || ''}
                          onChange={(e) => updateExample(index, 'explanation', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parameters
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Temperature</label>
                      <input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        className="input input-bordered w-full"
                        value={content.parameters?.temperature || 0.7}
                        onChange={(e) => setContent(prev => ({
                          ...prev,
                          parameters: {
                            ...prev.parameters,
                            temperature: parseFloat(e.target.value) || 0.7
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Max Tokens</label>
                      <input
                        type="number"
                        min="1"
                        className="input input-bordered w-full"
                        value={content.parameters?.maxTokens || 2048}
                        onChange={(e) => setContent(prev => ({
                          ...prev,
                          parameters: {
                            ...prev.parameters,
                            maxTokens: parseInt(e.target.value) || 2048
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Top P</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        className="input input-bordered w-full"
                        value={content.parameters?.topP || 1}
                        onChange={(e) => setContent(prev => ({
                          ...prev,
                          parameters: {
                            ...prev.parameters,
                            topP: parseFloat(e.target.value) || 1
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Encryption Options */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={encryptContent}
                  onChange={(e) => setEncryptContent(e.target.checked)}
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Encrypt content before uploading to IPFS
                </label>
              </div>
              
              {encryptContent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Encryption Password
                  </label>
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    placeholder="Enter encryption password"
                    value={encryptionPassword}
                    onChange={(e) => setEncryptionPassword(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This password will be required to decrypt and use the content.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

          {/* Step 3: Licensing */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Licensing & Pricing
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Set your pricing and licensing terms
                  </p>
                </div>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  License Type *
                </label>
                <select
                  className="select select-bordered w-full"
                  value={licensing.type}
                  onChange={(e) => setLicensing(prev => ({ 
                    ...prev, 
                    type: parseInt(e.target.value) as LicenseType 
                  }))}
                >
                  <option value={LicenseType.ONE_TIME}>One-time Purchase</option>
                  <option value={LicenseType.SUBSCRIPTION}>Subscription</option>
                  <option value={LicenseType.USAGE_BASED}>Usage-based</option>
                  <option value={LicenseType.COMMERCIAL}>Commercial License</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (ALGO) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="input input-bordered w-full"
                  placeholder="0.0"
                  value={(licensing.price || 0) / 1_000_000}
                  onChange={(e) => setLicensing(prev => ({ 
                    ...prev, 
                    price: Math.round((parseFloat(e.target.value) || 0) * 1_000_000)
                  }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  License Terms *
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Describe the terms and conditions for using this context"
                  value={licensing.terms || ''}
                  onChange={(e) => setLicensing(prev => ({ ...prev, terms: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={licensing.commercialUse || false}
                    onChange={(e) => setLicensing(prev => ({ 
                      ...prev, 
                      commercialUse: e.target.checked 
                    }))}
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Allow commercial use
                  </label>
                </div>
              </div>

              {licensing.type === LicenseType.SUBSCRIPTION && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="input input-bordered w-full"
                    placeholder="30"
                    value={(licensing.duration || 2592000) / 86400}
                    onChange={(e) => setLicensing(prev => ({ 
                      ...prev, 
                      duration: (parseInt(e.target.value) || 30) * 86400
                    }))}
                  />
                </div>
              )}

              {licensing.type === LicenseType.USAGE_BASED && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="input input-bordered w-full"
                    placeholder="100"
                    value={licensing.usageLimit || 100}
                    onChange={(e) => setLicensing(prev => ({ 
                      ...prev, 
                      usageLimit: parseInt(e.target.value) || 100
                    }))}
                  />
                </div>
              )}
            </div>

            {/* Fee Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Platform Fees
              </h3>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p>• Platform fee: 2.5% of each sale</p>
                <p>• You receive: 97.5% of the sale price</p>
                <p>• Your earnings per sale: {formatMicroAlgosToAlgo((licensing.price || 0) * 0.975)} ALGO</p>
              </div>
            </div>
          </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              className="group inline-flex items-center px-6 py-3 text-base font-medium rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-all"
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/marketplace')}
            >
              <ArrowLeftIcon className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              {step > 1 ? 'Previous' : 'Cancel'}
            </button>

            {step < 3 ? (
              <button
                type="button"
                className="group inline-flex items-center px-8 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all shadow-lg"
                onClick={() => setStep(step + 1)}
                disabled={!validateStep(step)}
              >
                Next Step
                <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                className="group inline-flex items-center px-8 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={!validateStep(step) || isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <CloudArrowUpIcon className="mr-2 w-5 h-5" />
                    Create Context
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </GradientCard>
    </div>
  );
};

export default CreateContext;
