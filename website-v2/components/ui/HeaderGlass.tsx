'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface HeaderGlassProps {
  children: ReactNode;
  className?: string;
}

export function HeaderGlass({ children, className = '' }: HeaderGlassProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`sticky top-0 z-50 backdrop-blur-md bg-panel/80 border-b border-muted/50 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        {children}
      </div>
    </motion.header>
  );
}
