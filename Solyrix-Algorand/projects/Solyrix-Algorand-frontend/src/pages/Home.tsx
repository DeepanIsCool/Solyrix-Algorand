import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@txnlab/use-wallet-react';
import DeploymentStatus from '../components/deployment/DeploymentStatus';
import GradientCard from '../components/common/GradientCard';
import Web3Badge from '../components/common/Web3Badge';
import { 
  SparklesIcon, 
  ShieldCheckIcon, 
  CurrencyDollarIcon,
  ArrowRightIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  CubeTransparentIcon
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const { activeAddress } = useWallet();

  const features = [
    {
      icon: SparklesIcon,
      title: 'AI Context Management',
      description: 'Store, version, and manage AI contexts, prompts, and configurations in a decentralized manner.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Blockchain Security',
      description: 'Built on Algorand blockchain ensuring immutability, transparency, and secure ownership.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Monetization',
      description: 'Earn from your AI contexts with flexible licensing options and automated royalty distribution.'
    },
    {
      icon: CodeBracketIcon,
      title: 'Developer Friendly',
      description: 'Easy-to-use APIs and SDKs for seamless integration with your AI applications.'
    },
    {
      icon: GlobeAltIcon,
      title: 'IPFS Storage',
      description: 'Decentralized storage ensures your contexts are always available and censorship-resistant.'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Governance',
      description: 'Participate in platform governance and help shape the future of decentralized AI.'
    }
  ];

  const stats = [
    { label: 'AI Contexts', value: '0' },
    { label: 'Active Users', value: '0' },
    { label: 'Total Volume', value: '0 ALGO' },
    { label: 'Network', value: 'TestNet' }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 relative">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-3xl" />
        
        <div className="max-w-4xl mx-auto relative">
          {/* Web3 Badges */}
          <div className="flex justify-center gap-2 mb-6">
            <Web3Badge type="onchain" animated />
            <Web3Badge type="ipfs" />
            <Web3Badge type="decentralized" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
              DecentralAI
            </span>
          </h1>
          
          <p className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-4">
            The Future of AI Context Management
          </p>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Store, share, and monetize your AI prompts & datasets on the blockchain. 
            Built on <span className="font-semibold text-blue-500">Algorand</span> with 
            <span className="font-semibold text-teal-500"> IPFS</span> storage for true decentralization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {activeAddress ? (
              <>
                <Link
                  to="/marketplace"
                  className="group inline-flex items-center px-8 py-4 text-base font-medium rounded-full text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <RocketLaunchIcon className="mr-2 w-5 h-5 group-hover:animate-bounce" />
                  Launch Marketplace
                  <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/create-context"
                  className="group inline-flex items-center px-8 py-4 text-base font-medium rounded-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all duration-200"
                >
                  <CubeTransparentIcon className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Create Context
                </Link>
              </>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Connect your wallet to get started
                </p>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  View Marketplace
                  <ArrowRightIcon className="ml-2 w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Deployment Status */}
      <section>
        <DeploymentStatus />
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose DecentralAI?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience the future of AI context management with blockchain security and decentralized storage.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-2xl p-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Get started with DecentralAI in three simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Create & Upload
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create your AI context with prompts, examples, and configurations. Upload to IPFS for decentralized storage.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Set Licensing
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose your licensing model - one-time purchase, subscription, or usage-based. Set your price and terms.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Earn & Share
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Share your context on the marketplace. Earn automatically with smart contract-based royalty distribution.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of AI developers already using DecentralAI to manage and monetize their contexts.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/marketplace"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Browse Contexts
            <ArrowRightIcon className="ml-2 w-4 h-4" />
          </Link>
          <Link
            to="/docs"
            className="inline-flex items-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            View Documentation
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
