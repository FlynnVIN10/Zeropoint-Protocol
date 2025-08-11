'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Home, 
  FileText, 
  Layers, 
  Activity, 
  Users, 
  BarChart3, 
  Shield,
  Settings,
  Menu,
  X
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home, description: 'Platform overview' },
  { href: '/docs', label: 'Documentation', icon: FileText, description: 'MDX docs with Nextra' },
  { href: '/phases', label: 'Development Phases', icon: Layers, description: 'Track our progress' },
  { href: '/control/overview', label: 'Control Overview', icon: Activity, description: 'KPIs and system status' },
  { href: '/control/synthiants', label: 'Synthiants', icon: Users, description: 'Live chat and presence' },
  { href: '/control/metrics', label: 'Performance Metrics', icon: BarChart3, description: 'Real-time metrics' },
  { href: '/control/audit', label: 'Audit Log', icon: Shield, description: 'Append-only timeline' },
  { href: '/control/settings', label: 'Settings', icon: Settings, description: 'Configuration' }
];

interface SideNavProps {
  className?: string;
}

export function SideNav({ className = '' }: SideNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-panel border border-muted rounded-md hover:border-accent transition-colors"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <motion.nav
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`fixed left-0 top-0 h-full w-80 bg-panel border-r border-muted z-40 lg:translate-x-0 lg:static lg:z-auto ${className}`}
      >
        <div className="p-6">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-accent">ZEROPOINT</h1>
            <p className="text-sm text-muted">PROTOCOL</p>
          </div>

          {/* Navigation Items */}
          <div className="space-y-2">
            {navItems.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 hover:border-accent/30 border border-transparent transition-all duration-200 group"
              >
                <item.icon className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
                <div className="flex-1">
                  <span className="font-medium text-fg group-hover:text-accent transition-colors">
                    {item.label}
                  </span>
                  {item.description && (
                    <p className="text-xs text-muted">{item.description}</p>
                  )}
                </div>
              </motion.a>
            ))}
          </div>

          {/* Footer */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="text-center text-xs text-muted">
              <p>© 2025 Zeropoint Protocol</p>
              <p className="mt-1">BlackOps Control Center</p>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}
    </>
  );
}
