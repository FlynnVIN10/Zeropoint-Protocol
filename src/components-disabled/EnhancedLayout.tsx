import React from 'react';
import Layout from '@theme/Layout';
import EnhancedNavigation from './EnhancedNavigation';

interface EnhancedLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  noFooter?: boolean;
  noNav?: boolean;
}

export default function EnhancedLayout({
  title,
  description,
  children,
  className = '',
  noFooter = false,
  noNav = false
}: EnhancedLayoutProps): JSX.Element {
  return (
    <Layout
      title={title}
      description={description}
      noFooter={noFooter}
      className={className}
    >
      {/* Enhanced Navigation - Visible on all pages using this layout */}
      {!noNav && <EnhancedNavigation variant="header" />}
      
      {children}
    </Layout>
  );
}
