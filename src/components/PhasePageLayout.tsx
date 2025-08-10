import React from 'react';
import EnhancedNavigation from './EnhancedNavigation';

interface PhasePageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PhasePageLayout({
  children,
  className = ''
}: PhasePageLayoutProps): JSX.Element {
  return (
    <div className={`phase-page-layout ${className}`}>
      {/* Enhanced Navigation for Phase Pages */}
      <EnhancedNavigation variant="header" />
      
      {/* Page Content */}
      <div className="phase-page-content">
        {children}
      </div>
    </div>
  );
}
