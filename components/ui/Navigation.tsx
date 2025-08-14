'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Terminal, 
  Bot, 
  Database, 
  Play, 
  CheckCircle, 
  Activity, 
  BarChart3, 
  FileText, 
  BookOpen, 
  Settings 
} from 'lucide-react';

const navItems = [
  { href: '/console', label: 'Console', icon: Terminal },
  { href: '/synthients', label: 'Synthients', icon: Bot },
  { href: '/models', label: 'Models', icon: Database },
  { href: '/runs', label: 'Runs', icon: Play },
  { href: '/consensus', label: 'Consensus', icon: CheckCircle },
  { href: '/status', label: 'Status', icon: Activity },
  { href: '/metrics', label: 'Metrics', icon: BarChart3 },
  { href: '/audits', label: 'Audits', icon: FileText },
  { href: '/library', label: 'Library', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="w-64 border-r border-border bg-panel p-4 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              "hover:bg-muted focus:outline-none focus:outline-2 focus:outline-[var(--ring)]",
              isActive && "bg-muted text-text border-l-2 border-l-link"
            )}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
