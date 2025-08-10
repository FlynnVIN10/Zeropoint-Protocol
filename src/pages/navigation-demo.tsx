import React, { useState } from 'react';
import EnhancedLayout from '../components/EnhancedLayout';
import EnhancedNavigation from '../components/EnhancedNavigation';

export default function NavigationDemo(): JSX.Element {
  const [activeVariant, setActiveVariant] = useState<'header' | 'sidebar' | 'mobile'>('header');

  return (
    <EnhancedLayout 
      title="Enhanced Navigation Demo" 
      description="Showcase of the enhanced corporate navigation component"
      noNav={true}>
      <div className="navigation-demo">
        {/* Header Navigation Variant */}
        {activeVariant === 'header' && (
          <EnhancedNavigation variant="header" />
        )}

        {/* Sidebar Navigation Variant */}
        {activeVariant === 'sidebar' && (
          <div className="navigation-demo__sidebar-layout">
            <EnhancedNavigation variant="sidebar" />
            <div className="navigation-demo__sidebar-content">
              <div className="navigation-demo__content">
                <h1>Sidebar Navigation Demo</h1>
                <p>This demonstrates the sidebar navigation variant with full-height layout.</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Variant */}
        {activeVariant === 'mobile' && (
          <EnhancedNavigation variant="mobile" />
        )}

        {/* Demo Controls */}
        <div className="navigation-demo__controls">
          <div className="navigation-demo__container">
            <h2>Navigation Variants</h2>
            <div className="navigation-demo__variant-buttons">
              <button
                className={`navigation-demo__variant-button ${activeVariant === 'header' ? 'active' : ''}`}
                onClick={() => setActiveVariant('header')}
              >
                Header Navigation
              </button>
              <button
                className={`navigation-demo__variant-button ${activeVariant === 'sidebar' ? 'active' : ''}`}
                onClick={() => setActiveVariant('sidebar')}
              >
                Sidebar Navigation
              </button>
              <button
                className={`navigation-demo__variant-button ${activeVariant === 'mobile' ? 'active' : ''}`}
                onClick={() => setActiveVariant('mobile')}
              >
                Mobile Navigation
              </button>
            </div>
          </div>
        </div>

        {/* Demo Content */}
        <div className="navigation-demo__content-wrapper">
          <div className="navigation-demo__container">
            <div className="navigation-demo__content">
              <h1>Enhanced Corporate Navigation</h1>
              <p className="navigation-demo__subtitle">
                A sophisticated, responsive navigation system designed for modern corporate applications
              </p>

              <div className="navigation-demo__features">
                <div className="navigation-demo__feature">
                  <div className="navigation-demo__feature-icon">🎨</div>
                  <h3>Corporate Aesthetics</h3>
                  <p>Professional design with sophisticated animations and visual effects</p>
                </div>
                <div className="navigation-demo__feature">
                  <div className="navigation-demo__feature-icon">📱</div>
                  <h3>Responsive Design</h3>
                  <p>Adapts seamlessly across all device sizes and orientations</p>
                </div>
                <div className="navigation-demo__feature">
                  <div className="navigation-demo__feature-icon">⚡</div>
                  <h3>Performance Optimized</h3>
                  <p>Efficient animations and smooth transitions for optimal user experience</p>
                </div>
                <div className="navigation-demo__feature">
                  <div className="navigation-demo__feature-icon">🔧</div>
                  <h3>Highly Configurable</h3>
                  <p>Multiple variants and extensive customization options</p>
                </div>
              </div>

              <div className="navigation-demo__code-example">
                <h3>Usage Example</h3>
                <pre className="navigation-demo__code">
{`import EnhancedNavigation from '../components/EnhancedNavigation';

// Header variant (default)
<EnhancedNavigation variant="header" />

// Sidebar variant
<EnhancedNavigation variant="sidebar" />

// Mobile variant
<EnhancedNavigation variant="mobile" />`}
                </pre>
              </div>

              <div className="navigation-demo__specs">
                <h3>Technical Specifications</h3>
                <div className="navigation-demo__specs-grid">
                  <div className="navigation-demo__spec">
                    <strong>Framework:</strong> React 18+ with TypeScript
                  </div>
                  <div className="navigation-demo__spec">
                    <strong>Styling:</strong> CSS Modules with CSS Custom Properties
                  </div>
                  <div className="navigation-demo__spec">
                    <strong>Animations:</strong> CSS Transitions & Keyframes
                  </div>
                  <div className="navigation-demo__spec">
                    <strong>Responsive:</strong> Mobile-first design approach
                  </div>
                  <div className="navigation-demo__spec">
                    <strong>Accessibility:</strong> ARIA compliant with keyboard navigation
                  </div>
                  <div className="navigation-demo__spec">
                    <strong>Performance:</strong> Optimized for 60fps animations
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EnhancedLayout>
  );
}
