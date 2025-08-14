import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  title: string;
  children: React.ReactNode;
  cta?: React.ReactNode;
  className?: string;
  id?: string;
}

export function Card({ title, children, cta, className, id }: CardProps) {
  return (
    <section id={id} className={cn("rounded-xl border border-border bg-panel shadow-brand", className)}>
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-base font-semibold">{title}</h3>
        {cta}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
