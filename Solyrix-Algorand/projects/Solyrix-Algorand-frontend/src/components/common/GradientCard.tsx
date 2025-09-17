import React from 'react';

interface GradientCardProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  hover?: boolean;
  className?: string;
}

const GradientCard: React.FC<GradientCardProps> = ({
  children,
  variant = 'primary',
  hover = true,
  className = '',
}) => {
  const getGradient = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10';
      case 'secondary':
        return 'bg-gradient-to-br from-gray-500/10 via-gray-600/10 to-gray-700/10';
      case 'success':
        return 'bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10';
      case 'warning':
        return 'bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-amber-500/10';
      case 'danger':
        return 'bg-gradient-to-br from-red-500/10 via-rose-500/10 to-pink-500/10';
    }
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl 
        ${getGradient()}
        backdrop-blur-sm
        border border-gray-200/20 dark:border-gray-700/20
        ${hover ? 'transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-gray-300/40 dark:hover:border-gray-600/40' : ''}
        ${className}
      `}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      {/* Glowing effect */}
      <div className="absolute -inset-px bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl opacity-0 hover:opacity-100 blur-xl transition-opacity duration-500" />
      
      <div className="relative">{children}</div>
    </div>
  );
};

export default GradientCard;
