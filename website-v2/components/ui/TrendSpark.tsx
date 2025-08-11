'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendSparkProps {
  value: number;
  change: number;
  period: string;
  className?: string;
}

export function TrendSpark({ value, change, period, className = '' }: TrendSparkProps) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  const getTrendIcon = () => {
    if (isPositive) return <TrendingUp className="w-4 h-4 text-ok" />;
    if (isNegative) return <TrendingDown className="w-4 h-4 text-warn" />;
    return <Minus className="w-4 h-4 text-muted" />;
  };

  const getTrendColor = () => {
    if (isPositive) return 'text-ok';
    if (isNegative) return 'text-warn';
    return 'text-muted';
  };

  const getChangeText = () => {
    if (isPositive) return `+${change}%`;
    if (isNegative) return `${change}%`;
    return '0%';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`blackops-card p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted">{period}</span>
        {getTrendIcon()}
      </div>
      
      <div className="text-2xl font-bold text-fg mb-2">
        {value.toLocaleString()}
      </div>
      
      <div className={`flex items-center space-x-2 text-sm ${getTrendColor()}`}>
        <span className="font-medium">{getChangeText()}</span>
        <span>from last period</span>
      </div>

      {/* Spark Line Visualization */}
      <div className="mt-4 h-12 flex items-end space-x-1">
        {Array.from({ length: 12 }, (_, i) => {
          const height = Math.random() * 100;
          const opacity = 0.3 + (i / 12) * 0.7;
          
          return (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className={`w-1 bg-accent rounded-sm`}
              style={{ opacity }}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
