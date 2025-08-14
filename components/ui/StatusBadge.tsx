import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'ok' | 'warn' | 'err' | 'neutral';
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const statusStyles = {
    ok: "bg-[var(--ok)]/15 text-[var(--ok)] border-[var(--ok)]/30",
    warn: "bg-[var(--warn)]/15 text-[var(--warn)] border-[var(--warn)]/30",
    err: "bg-[var(--err)]/15 text-[var(--err)] border-[var(--err)]/30",
    neutral: "bg-muted text-sub border-border"
  };
  
  return (
    <span className={cn(
      "text-xs px-2 py-1 rounded-md border",
      statusStyles[status],
      className
    )}>
      {label}
    </span>
  );
}
