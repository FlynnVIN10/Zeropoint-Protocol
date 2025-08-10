import React from 'react';
import EnhancedNavigation from './EnhancedNavigation';

/**
 * Integration Examples for Enhanced Navigation Component
 * 
 * This component demonstrates various ways to integrate the enhanced navigation
 * into different application layouts and use cases.
 */

// Example 1: Standard Website Layout
export function WebsiteLayout(): JSX.Element {
  return (
    <div className="website-layout">
      <EnhancedNavigation variant="header" />
      <main className="website-content">
        <section className="hero">
          <h1>Welcome to Zeropoint Protocol</h1>
          <p>Advanced AI-powered consensus and orchestration platform</p>
        </section>
        <section className="features">
          <h2>Key Features</h2>
          {/* Feature content */}
        </section>
      </main>
    </div>
  );
}

// Example 2: Dashboard Layout
export function DashboardLayout(): JSX.Element {
  return (
    <div className="dashboard-layout">
      <EnhancedNavigation variant="sidebar" />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="dashboard-actions">
            <button className="btn-primary">New Project</button>
            <button className="btn-secondary">Settings</button>
          </div>
        </header>
        <main className="dashboard-content">
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Active Agents</h3>
              <p className="metric">1,247</p>
            </div>
            <div className="dashboard-card">
              <h3>Consensus Rate</h3>
              <p className="metric">99.8%</p>
            </div>
            <div className="dashboard-card">
              <h3>System Health</h3>
              <p className="metric">Excellent</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Example 3: Mobile-First Layout
export function MobileLayout(): JSX.Element {
  return (
    <div className="mobile-layout">
      <EnhancedNavigation variant="mobile" />
      <main className="mobile-content">
        <div className="mobile-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn">Start Session</button>
            <button className="action-btn">View Status</button>
            <button className="action-btn">Settings</button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Example 4: Hybrid Layout (Header + Sidebar)
export function HybridLayout(): JSX.Element {
  return (
    <div className="hybrid-layout">
      <EnhancedNavigation variant="header" />
      <div className="hybrid-main">
        <EnhancedNavigation variant="sidebar" />
        <div className="hybrid-content">
          <header className="content-header">
            <h1>Advanced Configuration</h1>
            <p>Manage system settings and preferences</p>
          </header>
          <main className="content-body">
            <div className="config-sections">
              <section className="config-section">
                <h3>System Settings</h3>
                {/* Configuration forms */}
              </section>
              <section className="config-section">
                <h3>User Preferences</h3>
                {/* User settings */}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Example 5: Conditional Navigation Based on Screen Size
export function ResponsiveLayout(): JSX.Element {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="responsive-layout">
      {isMobile ? (
        <EnhancedNavigation variant="mobile" />
      ) : (
        <EnhancedNavigation variant="header" />
      )}
      <main className="responsive-content">
        <h1>Responsive Navigation</h1>
        <p>This layout automatically switches between navigation variants based on screen size.</p>
        <div className="screen-info">
          <p>Current view: <strong>{isMobile ? 'Mobile' : 'Desktop'}</strong></p>
          <p>Screen width: <strong>{typeof window !== 'undefined' ? window.innerWidth : 'Unknown'}px</strong></p>
        </div>
      </main>
    </div>
  );
}

// Example 6: Navigation with Custom Styling
export function CustomStyledLayout(): JSX.Element {
  return (
    <div className="custom-styled-layout">
      <EnhancedNavigation 
        variant="header" 
        className="custom-navigation"
      />
      <main className="custom-content">
        <h1>Custom Styled Navigation</h1>
        <p>This example shows how to apply custom styling to the navigation component.</p>
        <div className="style-examples">
          <div className="style-example">
            <h3>Custom Colors</h3>
            <p>Override CSS custom properties for brand-specific theming</p>
          </div>
          <div className="style-example">
            <h3>Custom Animations</h3>
            <p>Modify transition timing and easing functions</p>
          </div>
          <div className="style-example">
            <h3>Custom Layouts</h3>
            <p>Adjust spacing, sizing, and positioning</p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Main Integration Component
export default function IntegrationExamples(): JSX.Element {
  const [activeExample, setActiveExample] = React.useState<'website' | 'dashboard' | 'mobile' | 'hybrid' | 'responsive' | 'custom'>('website');

  const examples = {
    website: { component: WebsiteLayout, title: 'Website Layout', description: 'Standard website with header navigation' },
    dashboard: { component: DashboardLayout, title: 'Dashboard Layout', description: 'Admin dashboard with sidebar navigation' },
    mobile: { component: MobileLayout, title: 'Mobile Layout', description: 'Mobile-first design with mobile navigation' },
    hybrid: { component: HybridLayout, title: 'Hybrid Layout', description: 'Combination of header and sidebar navigation' },
    responsive: { component: ResponsiveLayout, title: 'Responsive Layout', description: 'Automatic navigation switching based on screen size' },
    custom: { component: CustomStyledLayout, title: 'Custom Styled', description: 'Navigation with custom styling and theming' }
  };

  const ActiveComponent = examples[activeExample].component;

  return (
    <div className="integration-examples">
      <div className="examples-header">
        <h1>Integration Examples</h1>
        <p>Explore different ways to integrate the Enhanced Navigation component</p>
      </div>

      <div className="examples-navigation">
        <div className="examples-tabs">
          {Object.entries(examples).map(([key, example]) => (
            <button
              key={key}
              className={`example-tab ${activeExample === key ? 'active' : ''}`}
              onClick={() => setActiveExample(key as keyof typeof examples)}
            >
              <h3>{example.title}</h3>
              <p>{example.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="example-preview">
        <div className="preview-header">
          <h2>{examples[activeExample].title}</h2>
          <p>{examples[activeExample].description}</p>
        </div>
        <div className="preview-content">
          <ActiveComponent />
        </div>
      </div>

      <div className="examples-footer">
        <h3>Get Started</h3>
        <p>Choose the layout that best fits your application needs and customize as required.</p>
        <div className="footer-actions">
          <button className="btn-primary">View Documentation</button>
          <button className="btn-secondary">Download Examples</button>
        </div>
      </div>
    </div>
  );
}
