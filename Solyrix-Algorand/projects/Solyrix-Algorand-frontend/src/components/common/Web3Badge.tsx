import React from 'react';
import { SparklesIcon, CubeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface Web3BadgeProps {
  type: 'onchain' | 'ipfs' | 'decentralized' | 'testnet' | 'mainnet';
  className?: string;
  animated?: boolean;
}

const Web3Badge: React.FC<Web3BadgeProps> = ({ type, className = '', animated = false }) => {
  const getBadgeContent = () => {
    switch (type) {
      case 'onchain':
        return {
          icon: <CubeIcon className="w-3 h-3" />,
          text: 'On-Chain',
          color: 'bg-gradient-to-r from-blue-500 to-purple-500',
        };
      case 'ipfs':
        return {
          icon: <ShieldCheckIcon className="w-3 h-3" />,
          text: 'IPFS',
          color: 'bg-gradient-to-r from-teal-500 to-cyan-500',
        };
      case 'decentralized':
        return {
          icon: <SparklesIcon className="w-3 h-3" />,
          text: 'Decentralized',
          color: 'bg-gradient-to-r from-purple-500 to-pink-500',
        };
      case 'testnet':
        return {
          icon: <CubeIcon className="w-3 h-3" />,
          text: 'TestNet',
          color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        };
      case 'mainnet':
        return {
          icon: <CubeIcon className="w-3 h-3" />,
          text: 'MainNet',
          color: 'bg-gradient-to-r from-green-500 to-emerald-500',
        };
    }
  };

  const badge = getBadgeContent();

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white
        ${badge.color} ${className}
        ${animated ? 'animate-pulse' : ''}
      `}
    >
      {badge.icon}
      <span>{badge.text}</span>
    </span>
  );
};

export default Web3Badge;
