'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className = '' }: AppShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen bg-bg text-fg ${className}`}
    >
      {children}
    </motion.div>
  );
}
