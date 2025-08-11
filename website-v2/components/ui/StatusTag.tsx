'use client';

import { motion } from 'framer-motion';

interface StatusTagProps {
  status: 'online' | 'offline' | 'warning' | 'error' | 'maintenance';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusTag({ status, size = 'md', className = '' }: StatusTagProps) {
  const statusConfig = {
    online: {
      color: 'text-ok',
      bg: 'bg-ok/20',
      border: 'border-ok/30',
      icon: '●'
    },
    offline: {
      color: 'text-muted',
      bg: 'bg-muted/20',
      border: 'border-muted/30',
      icon: '○'
    },
    warning: {
      color: 'text-warn',
      bg: 'bg-warn/20',
      border: 'border-warn/30',
      icon: '⚠'
    },
    error: {
      color: 'text-red-400',
      bg: 'bg-red-400/20',
      border: 'border-red-400/30',
      icon: '✗'
    },
    maintenance: {
      color: 'text-accent',
      bg: 'bg-accent/20',
      border: 'border-accent/30',
      icon: '⚙'
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const config = statusConfig[status];

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center space-x-2 ${sizeClasses[size]} rounded-full border ${config.bg} ${config.border} ${config.color} font-medium ${className}`}
    >
      <span className="animate-pulse">{config.icon}</span>
      <span className="capitalize">{status}</span>
    </motion.span>
  );
}
