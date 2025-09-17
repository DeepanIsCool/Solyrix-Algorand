import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAlgorand } from '../hooks/useAlgorand';
import { formatMicroAlgosToAlgo } from '../utils/formatBalance';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  created: Date;
  votingEnds: Date;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorumRequired: number;
  category: 'platform' | 'fee' | 'feature' | 'governance';
  actions?: {
    type: string;
    target: string;
    data: string;
  }[];
}

// Mock proposals data
const mockProposals: Proposal[] = [
  {
    id: "proposal_1",
    title: "Reduce Platform Fee to 2%",
    description: "Proposal to reduce the platform fee from 2.5% to 2% to make the marketplace more competitive and attract more creators.",
    proposer: "ABCD1234EFGH5678IJKL9012MNOP3456QRST7890UVWX1234YZAB5678CDEF",
    created: new Date('2024-02-01'),
    votingEnds: new Date('2024-02-15'),
    status: 'active',
    votesFor: 1250000,
    votesAgainst: 350000,
    totalVotes: 1600000,
    quorumRequired: 1000000,
    category: 'fee'
  },
  {
    id: "proposal_2",
    title: "Add AI Model Verification System",
    description: "Implement a verification system for AI models to ensure quality and authenticity of contexts in the marketplace.",
    proposer: "EFGH5678IJKL9012MNOP3456QRST7890UVWX1234YZAB5678CDEF9012ABCD",
    created: new Date('2024-01-20'),
    votingEnds: new Date('2024-02-05'),
    status: 'passed',
    votesFor: 2100000,
    votesAgainst: 450000,
    totalVotes: 2550000,
    quorumRequired: 1000000,
    category: 'feature'
  },
  {
    id: "proposal_3",
    title: "Governance Token Staking Rewards",
    description: "Introduce staking rewards for governance token holders to incentivize long-term participation in platform governance.",
    proposer: "IJKL9012MNOP3456QRST7890UVWX1234YZAB5678CDEF9012ABCD3456EFGH",
    created: new Date('2024-01-15'),
    votingEnds: new Date('2024-01-30'),
    status: 'executed',
    votesFor: 1800000,
    votesAgainst: 200000,
    totalVotes: 2000000,
    quorumRequired: 1000000,
    category: 'governance'
  }
];

const Governance: React.FC = () => {
  const { 
    account, 
    governanceTokenBalance, 
    createProposal, 
    voteOnProposal, 
    stakeTokens, 
    unstakeTokens,
    isLoading: algorandLoading 
  } = useAlgorand();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'proposals' | 'create' | 'stake'>('proposals');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, 'for' | 'against'>>({});
  const [stakedAmount, setStakedAmount] = useState(0);

  // New proposal form
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    category: 'platform' as Proposal['category']
  });

  // Staking form
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

  // Load proposals and user data
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProposals(mockProposals);
      setStakedAmount(500000); // 500 tokens staked
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleVote = useCallback(async (proposalId: string, vote: 'for' | 'against') => {
    if (!account || !governanceTokenBalance) return;

    setIsLoading(true);
    try {
      await voteOnProposal(proposalId, vote, governanceTokenBalance);
      setUserVotes(prev => ({ ...prev, [proposalId]: vote }));
      
      // Update proposal vote counts (in real app, this would come from blockchain)
      setProposals(prev => prev.map(p => {
        if (p.id === proposalId) {
          const voteAmount = governanceTokenBalance;
          return {
            ...p,
            votesFor: vote === 'for' ? p.votesFor + voteAmount : p.votesFor,
            votesAgainst: vote === 'against' ? p.votesAgainst + voteAmount : p.votesAgainst,
            totalVotes: p.totalVotes + voteAmount
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsLoading(false);
    }
  }, [account, governanceTokenBalance, voteOnProposal]);

  const handleCreateProposal = useCallback(async () => {
    if (!account || !newProposal.title.trim() || !newProposal.description.trim()) return;

    setIsLoading(true);
    try {
      await createProposal(
        newProposal.title,
        newProposal.description,
        newProposal.category
      );
      
      // Reset form
      setNewProposal({
        title: '',
        description: '',
        category: 'platform'
      });
      
      setActiveTab('proposals');
    } catch (error) {
      console.error('Failed to create proposal:', error);
    } finally {
      setIsLoading(false);
    }
  }, [account, newProposal, createProposal]);

  const handleStake = useCallback(async () => {
    if (!account || !stakeAmount) return;

    setIsLoading(true);
    try {
      const amount = Math.round(parseFloat(stakeAmount) * 1_000_000); // Convert to microAlgos
      await stakeTokens(amount);
      setStakedAmount(prev => prev + amount);
      setStakeAmount('');
    } catch (error) {
      console.error('Failed to stake tokens:', error);
    } finally {
      setIsLoading(false);
    }
  }, [account, stakeAmount, stakeTokens]);

  const handleUnstake = useCallback(async () => {
    if (!account || !unstakeAmount) return;

    setIsLoading(true);
    try {
      const amount = Math.round(parseFloat(unstakeAmount) * 1_000_000);
      await unstakeTokens(amount);
      setStakedAmount(prev => Math.max(0, prev - amount));
      setUnstakeAmount('');
    } catch (error) {
      console.error('Failed to unstake tokens:', error);
    } finally {
      setIsLoading(false);
    }
  }, [account, unstakeAmount, unstakeTokens]);

  const getStatusColor = (status: Proposal['status']) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'passed': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'executed': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: Proposal['category']) => {
    switch (category) {
      case 'platform': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'fee': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'feature': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'governance': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Platform Governance
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Connect your wallet to participate in DecentralAI governance and vote on proposals.
        </p>
        <Link to="/" className="btn btn-primary">
          Connect Wallet
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Platform Governance
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Participate in DecentralAI governance by voting on proposals and staking your governance tokens.
        </p>
      </div>

      {/* Governance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {governanceTokenBalance ? formatMicroAlgosToAlgo(governanceTokenBalance) : '0'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Your Tokens</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatMicroAlgosToAlgo(stakedAmount)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Staked Tokens</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {proposals.filter(p => p.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Proposals</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {Object.keys(userVotes).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Your Votes</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'proposals', label: 'Proposals' },
              { key: 'create', label: 'Create Proposal' },
              { key: 'stake', label: 'Staking' }
            ].map((tab) => (
              <button
                key={tab.key}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab(tab.key as any)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Proposals Tab */}
          {activeTab === 'proposals' && (
            <div className="space-y-6">
              {isLoading && !proposals.length ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {proposal.title}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(proposal.category)}`}>
                              {proposal.category.charAt(0).toUpperCase() + proposal.category.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {proposal.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>By {proposal.proposer.slice(0, 8)}...{proposal.proposer.slice(-8)}</span>
                            <span>Created {proposal.created.toLocaleDateString()}</span>
                            <span>Ends {proposal.votingEnds.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Voting Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-green-600">For: {formatMicroAlgosToAlgo(proposal.votesFor)} tokens</span>
                          <span className="text-red-600">Against: {formatMicroAlgosToAlgo(proposal.votesAgainst)} tokens</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="flex h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-green-500"
                              style={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                            />
                            <div
                              className="bg-red-500"
                              style={{ width: `${(proposal.votesAgainst / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>Total: {formatMicroAlgosToAlgo(proposal.totalVotes)} tokens</span>
                          <span>Quorum: {formatMicroAlgosToAlgo(proposal.quorumRequired)} tokens</span>
                        </div>
                      </div>

                      {/* Voting Buttons */}
                      {proposal.status === 'active' && governanceTokenBalance && governanceTokenBalance > 0 && (
                        <div className="flex space-x-3">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleVote(proposal.id, 'for')}
                            disabled={isLoading || userVotes[proposal.id] === 'for'}
                          >
                            {userVotes[proposal.id] === 'for' ? 'Voted For' : 'Vote For'}
                          </button>
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => handleVote(proposal.id, 'against')}
                            disabled={isLoading || userVotes[proposal.id] === 'against'}
                          >
                            {userVotes[proposal.id] === 'against' ? 'Voted Against' : 'Vote Against'}
                          </button>
                        </div>
                      )}

                      {proposal.status === 'active' && (!governanceTokenBalance || governanceTokenBalance === 0) && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          You need governance tokens to vote on this proposal.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create Proposal Tab */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Create New Proposal
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Submit a proposal for the community to vote on. You need at least 1,000 governance tokens to create a proposal.
                </p>
              </div>

              {(!governanceTokenBalance || governanceTokenBalance < 1_000_000) ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Insufficient Tokens
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <p>You need at least 1,000 governance tokens to create a proposal. You currently have {governanceTokenBalance ? formatMicroAlgosToAlgo(governanceTokenBalance) : '0'} tokens.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="Enter proposal title"
                      value={newProposal.title}
                      onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={newProposal.category}
                      onChange={(e) => setNewProposal(prev => ({ ...prev, category: e.target.value as Proposal['category'] }))}
                    >
                      <option value="platform">Platform</option>
                      <option value="fee">Fee Structure</option>
                      <option value="feature">New Feature</option>
                      <option value="governance">Governance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      className="textarea textarea-bordered w-full h-32"
                      placeholder="Describe your proposal in detail..."
                      value={newProposal.description}
                      onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleCreateProposal}
                    disabled={isLoading || !newProposal.title.trim() || !newProposal.description.trim()}
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Create Proposal'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Staking Tab */}
          {activeTab === 'stake' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Token Staking
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Stake your governance tokens to earn rewards and increase your voting power in governance decisions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stake Tokens */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-green-800 dark:text-green-200 mb-4">
                    Stake Tokens
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                        Amount to Stake
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="input input-bordered w-full"
                        placeholder="0"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                      />
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Available: {governanceTokenBalance ? formatMicroAlgosToAlgo(governanceTokenBalance) : '0'} tokens
                      </p>
                    </div>
                    <button
                      className="btn btn-success w-full"
                      onClick={handleStake}
                      disabled={isLoading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                    >
                      {isLoading ? <LoadingSpinner size="sm" /> : 'Stake Tokens'}
                    </button>
                  </div>
                </div>

                {/* Unstake Tokens */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-red-800 dark:text-red-200 mb-4">
                    Unstake Tokens
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                        Amount to Unstake
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="input input-bordered w-full"
                        placeholder="0"
                        value={unstakeAmount}
                        onChange={(e) => setUnstakeAmount(e.target.value)}
                      />
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Staked: {formatMicroAlgosToAlgo(stakedAmount)} tokens
                      </p>
                    </div>
                    <button
                      className="btn btn-error w-full"
                      onClick={handleUnstake}
                      disabled={isLoading || !unstakeAmount || parseFloat(unstakeAmount) <= 0 || parseFloat(unstakeAmount) > stakedAmount / 1_000_000}
                    >
                      {isLoading ? <LoadingSpinner size="sm" /> : 'Unstake Tokens'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Staking Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Staking Benefits
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Earn 5% APY on staked tokens</li>
                  <li>• Increased voting power in governance</li>
                  <li>• Access to exclusive features and proposals</li>
                  <li>• Unstaking has a 7-day cooldown period</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Governance;
