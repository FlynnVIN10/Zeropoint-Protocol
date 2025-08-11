'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface KPIDialProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: 'accent' | 'ok' | 'warn' | 'fg';
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}

export function KPIDial({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'accent',
  trend,
  className = '' 
}: KPIDialProps) {
  const colorClasses = {
    accent: 'text-accent',
    ok: 'text-ok',
    warn: 'text-warn',
    fg: 'text-fg'
  };

  const bgColorClasses = {
    accent: 'bg-accent/20',
    ok: 'bg-ok/20',
    warn: 'bg-warn/20',
    fg: 'bg-fg/20'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`blackops-card text-center group hover:border-accent transition-all duration-300 hover:scale-105 ${className}`}
    >
      {icon && (
        <div className={`flex items-center justify-center w-16 h-16 mx-auto mb-4 ${bgColorClasses[color]} rounded-full group-hover:bg-opacity-30 transition-all duration-300`}>
          <div className={colorClasses[color]}>
            {icon}
          </div>
        </div>
      )}
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${colorClasses[color]} mb-2`}>{value}</p>
      
      {subtitle && (
        <p className="text-sm text-muted">{subtitle}</p>
      )}
      
      {trend && (
        <div className="mt-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-ok/20 text-ok' :
            trend === 'down' ? 'bg-warn/20 text-warn' :
            'bg-muted text-fg'
          }`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trend}
          </span>
        </div>
      )}
    </motion.div>
  );
}
