import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ContextWithStats, UserProfile, LicenseType } from '../types/context.types';
import { useAlgorand } from '../hooks/useAlgorand';
import { formatMicroAlgosToAlgo } from '../utils/formatBalance';
import ContextCard from '../components/context/ContextCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PurchasedContexts from '../components/buyer/PurchasedContexts';

// Real user data will be loaded from blockchain
const loadUserProfileFromBlockchain = async (address: string): Promise<UserProfile | null> => {
  // TODO: Implement real blockchain data loading
  // This will fetch user profile from smart contracts and IPFS
  return null;
};

const loadUserContextsFromBlockchain = async (address: string): Promise<ContextWithStats[]> => {
  // TODO: Implement real blockchain data loading
  // This will fetch user's contexts from the deployed ContextRegistry smart contract
  return [];
};

const Profile: React.FC = () => {
  const { account } = useAlgorand();
  const [activeTab, setActiveTab] = useState<'overview' | 'contexts' | 'purchases' | 'settings'>('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userContexts, setUserContexts] = useState<ContextWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load user profile and data
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const profile = await loadUserProfileFromBlockchain(account!.address);
        const contexts = await loadUserContextsFromBlockchain(account!.address);
        setUserProfile(profile);
        setUserContexts(contexts);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (account?.address) {
      loadUserData();
    } else {
      // Make sure loading is false if no account
      setIsLoading(false);
    }
  }, [account]);

  const handleUpdateProfile = useCallback(async (updatedProfile: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      // TODO: Implement real profile update to blockchain/IPFS
      const currentProfile = userProfile || {
        address: account?.address || '',
        displayName: 'Anonymous User',
        bio: 'No bio yet. Edit your profile to add one.',
        avatar: '',
        joinedDate: new Date(),
        totalContexts: 0,
        totalSales: 0,
        totalEarnings: 0,
        reputation: 0,
        badges: [],
        socialLinks: {},
        createdContexts: [],
        purchasedLicenses: [],
        totalSpent: 0
      };
      setUserProfile({ ...currentProfile, ...updatedProfile });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, account]);

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          User Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Please connect your wallet to view your profile and manage your AI contexts.
        </p>
        <Link to="/" className="btn btn-primary">
          Connect Wallet
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Create default profile if none exists
  const displayProfile: UserProfile = userProfile || {
    address: account.address,
    displayName: 'Anonymous User',
    bio: 'No bio yet. Edit your profile to add one.',
    avatar: '',
    joinedDate: new Date(),
    totalContexts: 0,
    totalSales: 0,
    totalEarnings: 0,
    reputation: 0,
    badges: [],
    socialLinks: {},
    createdContexts: [],
    purchasedLicenses: [],
    totalSpent: 0
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {displayProfile.displayName?.charAt(0) || account.address.charAt(0)}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {displayProfile.displayName || 'Anonymous User'}
              </h1>
              {displayProfile.badges?.map((badge, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                >
                  {badge}
                </span>
              ))}
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              {displayProfile.bio || 'No bio available'}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <span>Joined {displayProfile.joinedDate?.toLocaleDateString() || 'Recently'}</span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {displayProfile.reputation?.toFixed(1) || '0.0'} reputation
              </span>
              <span>{account.address.slice(0, 8)}...{account.address.slice(-8)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
            <Link to="/create-context" className="btn btn-primary btn-sm">
              Create Context
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {displayProfile.totalContexts || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Contexts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {displayProfile.totalSales || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {displayProfile.totalEarnings?.toFixed(1) || '0.0'} ALGO
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Earnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {account.balance ? formatMicroAlgosToAlgo(account.balance) : '0'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">ALGO Balance</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'contexts', label: 'My Contexts' },
              { key: 'purchases', label: 'Purchases' },
              { key: 'settings', label: 'Settings' }
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          Context "Advanced ChatBot Prompt" was purchased
                        </p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          New 5-star rating received
                        </p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          Profile viewed 15 times this week
                        </p>
                        <p className="text-xs text-gray-500">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Performance This Month
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
                      <span className="text-sm font-medium">1,234</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Purchases</span>
                      <span className="text-sm font-medium">45</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
                      <span className="text-sm font-medium">3.6%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                      <span className="text-sm font-medium">45.2 ALGO</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Performing Contexts */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Performing Contexts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userContexts.slice(0, 3).map((context) => (
                    <ContextCard key={context.id} context={context} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* My Contexts Tab */}
          {activeTab === 'contexts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  My AI Contexts ({userContexts.length})
                </h3>
                <Link to="/create-context" className="btn btn-primary btn-sm">
                  Create New Context
                </Link>
              </div>

              {userContexts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userContexts.map((context) => (
                    <div key={context.id} className="relative">
                      <ContextCard context={context} />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button className="btn btn-xs btn-ghost bg-white/90 hover:bg-white">
                          Edit
                        </button>
                        <button className="btn btn-xs btn-ghost bg-white/90 hover:bg-white text-red-600">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No contexts yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start creating AI contexts to share with the community and earn ALGO.
                  </p>
                  <Link to="/create-context" className="btn btn-primary">
                    Create Your First Context
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Purchases Tab */}
          {activeTab === 'purchases' && (
            <PurchasedContexts />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Account Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full max-w-md"
                    value={displayProfile.displayName || ''}
                    onChange={(e) => userProfile && setUserProfile({ ...userProfile, displayName: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full max-w-md h-24"
                    value={displayProfile.bio || ''}
                    onChange={(e) => userProfile && setUserProfile({ ...userProfile, bio: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    className="input input-bordered w-full max-w-md"
                    value={displayProfile.socialLinks?.website || ''}
                    onChange={(e) => setUserProfile({
                      ...displayProfile,
                      socialLinks: { ...displayProfile.socialLinks, website: e.target.value }
                    })}
                  />
                </div>

                <div className="pt-4">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleUpdateProfile(displayProfile)}
                    disabled={isLoading}
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Profile
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={displayProfile.displayName || ''}
                  onChange={(e) => setUserProfile({ ...displayProfile, displayName: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-24"
                  value={displayProfile.bio || ''}
                  onChange={(e) => setUserProfile({ ...displayProfile, bio: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="btn btn-outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleUpdateProfile(userProfile || {})}
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
