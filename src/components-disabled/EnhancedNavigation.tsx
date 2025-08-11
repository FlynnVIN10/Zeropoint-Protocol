import React, { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

interface NavigationItem {
  label: string;
  to: string;
  description?: string;
  icon?: string;
  badge?: string;
  children?: NavigationItem[];
}

interface EnhancedNavigationProps {
  className?: string;
  variant?: 'header' | 'sidebar' | 'mobile';
}

export default function EnhancedNavigation({ 
  className = '', 
  variant = 'header' 
}: EnhancedNavigationProps): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Navigation items with enhanced structure
  const navigationItems: NavigationItem[] = [
    {
      label: 'Home',
      to: '/',
      description: 'Return to the main platform',
      icon: '🏠'
    },
    {
      label: 'Documentation',
      to: '/docs',
      description: 'Technical documentation and guides',
      icon: '📚',
      children: [
        {
          label: 'API Reference',
          to: '/docs/api',
          description: 'Complete API documentation',
          icon: '🔌'
        },
        {
          label: 'Legal & Compliance',
          to: '/docs/legal',
          description: 'Legal documentation and compliance',
          icon: '⚖️'
        },
        {
          label: 'Brand Guidelines',
          to: '/docs/brand',
          description: 'Brand and design guidelines',
          icon: '🎨'
        }
      ]
    },
    {
      label: 'Status',
      to: '/status',
      description: 'Platform status and monitoring',
      icon: '📊',
      badge: 'Live'
    },
    {
      label: 'Phases',
      to: '/phases',
      description: 'Development phases and roadmap',
      icon: '🚀',
      children: [
        {
          label: 'Phase 13',
          to: '/phases/13',
          description: 'Current development phase',
          icon: '🎯',
          badge: 'Active'
        },
        {
          label: 'Phase 12',
          to: '/phases/12',
          description: 'Previous phase completed',
          icon: '✅'
        },
        {
          label: 'Phase 11',
          to: '/phases/11',
          description: 'Core infrastructure phase',
          icon: '🏗️'
        }
      ]
    }
  ];

  // Scroll effect for header variant
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle dropdown interactions
  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.enhanced-navigation')) {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Header Navigation Variant
  if (variant === 'header') {
    return (
      <nav className={`enhanced-navigation enhanced-navigation--header ${className} ${isScrolled ? 'enhanced-navigation--scrolled' : ''}`}>
        <div className="container">
          <div className="enhanced-navigation__content">
            {/* Logo and Brand */}
            <div className="enhanced-navigation__brand">
              <Link to="/" className="enhanced-navigation__logo">
                <span className="enhanced-navigation__logo-icon">⚡</span>
                <span className="enhanced-navigation__logo-text">{siteConfig.title}</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="enhanced-navigation__desktop">
              <ul className="enhanced-navigation__list">
                {navigationItems.map((item) => (
                  <li key={item.label} className="enhanced-navigation__item">
                    {item.children ? (
                      <div className="enhanced-navigation__dropdown">
                        <button
                          className={`enhanced-navigation__link enhanced-navigation__link--dropdown ${activeDropdown === item.label ? 'active' : ''}`}
                          onClick={() => handleDropdownToggle(item.label)}
                          aria-expanded={activeDropdown === item.label}
                        >
                          <span className="enhanced-navigation__link-icon">{item.icon}</span>
                          <span className="enhanced-navigation__link-text">{item.label}</span>
                          <span className="enhanced-navigation__dropdown-arrow">▼</span>
                        </button>
                        
                        {activeDropdown === item.label && (
                          <div className="enhanced-navigation__dropdown-menu">
                            {item.children.map((child) => (
                              <Link
                                key={child.label}
                                to={child.to}
                                className="enhanced-navigation__dropdown-item"
                                onClick={() => setActiveDropdown(null)}
                              >
                                <span className="enhanced-navigation__dropdown-item-icon">{child.icon}</span>
                                <div className="enhanced-navigation__dropdown-item-content">
                                  <span className="enhanced-navigation__dropdown-item-label">{child.label}</span>
                                  {child.description && (
                                    <span className="enhanced-navigation__dropdown-item-description">{child.description}</span>
                                  )}
                                </div>
                                {child.badge && (
                                  <span className="enhanced-navigation__badge enhanced-navigation__badge--small">{child.badge}</span>
                                )}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.to}
                        className="enhanced-navigation__link"
                        title={item.description}
                      >
                        <span className="enhanced-navigation__link-icon">{item.icon}</span>
                        <span className="enhanced-navigation__link-text">{item.label}</span>
                        {item.badge && (
                          <span className="enhanced-navigation__badge">{item.badge}</span>
                        )}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Side Actions */}
            <div className="enhanced-navigation__actions">
              <Link
                href="https://github.com/FlynnVIN10/Zeropoint-Protocol"
                className="enhanced-navigation__action enhanced-navigation__action--github"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="enhanced-navigation__action-icon">📦</span>
                <span className="enhanced-navigation__action-text">GitHub</span>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="enhanced-navigation__mobile-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className={`enhanced-navigation__mobile-toggle-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
              <span className={`enhanced-navigation__mobile-toggle-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
              <span className={`enhanced-navigation__mobile-toggle-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="enhanced-navigation__mobile">
              <ul className="enhanced-navigation__mobile-list">
                {navigationItems.map((item) => (
                  <li key={item.label} className="enhanced-navigation__mobile-item">
                    {item.children ? (
                      <div className="enhanced-navigation__mobile-dropdown">
                        <button
                          className="enhanced-navigation__mobile-dropdown-toggle"
                          onClick={() => handleDropdownToggle(item.label)}
                          aria-expanded={activeDropdown === item.label}
                        >
                          <span className="enhanced-navigation__mobile-dropdown-icon">{item.icon}</span>
                          <span className="enhanced-navigation__mobile-dropdown-text">{item.label}</span>
                          <span className="enhanced-navigation__mobile-dropdown-arrow">
                            {activeDropdown === item.label ? '▲' : '▼'}
                          </span>
                        </button>
                        
                        {activeDropdown === item.label && (
                          <ul className="enhanced-navigation__mobile-dropdown-menu">
                            {item.children.map((child) => (
                              <li key={child.label} className="enhanced-navigation__mobile-dropdown-item">
                                <Link
                                  to={child.to}
                                  className="enhanced-navigation__mobile-dropdown-link"
                                  onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setActiveDropdown(null);
                                  }}
                                >
                                  <span className="enhanced-navigation__mobile-dropdown-link-icon">{child.icon}</span>
                                  <span className="enhanced-navigation__mobile-dropdown-link-text">{child.label}</span>
                                  {child.badge && (
                                    <span className="enhanced-navigation__badge enhanced-navigation__badge--mobile">{child.badge}</span>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.to}
                        className="enhanced-navigation__mobile-link"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="enhanced-navigation__mobile-link-icon">{item.icon}</span>
                        <span className="enhanced-navigation__mobile-link-text">{item.label}</span>
                        {item.badge && (
                          <span className="enhanced-navigation__badge enhanced-navigation__badge--mobile">{item.badge}</span>
                        )}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              
              {/* Mobile Actions */}
              <div className="enhanced-navigation__mobile-actions">
                <Link
                  href="https://github.com/FlynnVIN10/Zeropoint-Protocol"
                  className="enhanced-navigation__mobile-action"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="enhanced-navigation__mobile-action-icon">📦</span>
                  <span className="enhanced-navigation__mobile-action-text">GitHub</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // Sidebar Navigation Variant
  if (variant === 'sidebar') {
    return (
      <nav className={`enhanced-navigation enhanced-navigation--sidebar ${className}`}>
        <div className="enhanced-navigation__sidebar-header">
          <Link to="/" className="enhanced-navigation__sidebar-logo">
            <span className="enhanced-navigation__sidebar-logo-icon">⚡</span>
            <span className="enhanced-navigation__sidebar-logo-text">{siteConfig.title}</span>
          </Link>
        </div>
        
        <div className="enhanced-navigation__sidebar-content">
          <ul className="enhanced-navigation__sidebar-list">
            {navigationItems.map((item) => (
              <li key={item.label} className="enhanced-navigation__sidebar-item">
                {item.children ? (
                  <div className="enhanced-navigation__sidebar-dropdown">
                    <button
                      className={`enhanced-navigation__sidebar-dropdown-toggle ${activeDropdown === item.label ? 'active' : ''}`}
                      onClick={() => handleDropdownToggle(item.label)}
                      aria-expanded={activeDropdown === item.label}
                    >
                      <span className="enhanced-navigation__sidebar-dropdown-icon">{item.icon}</span>
                      <span className="enhanced-navigation__sidebar-dropdown-text">{item.label}</span>
                      <span className="enhanced-navigation__sidebar-dropdown-arrow">
                        {activeDropdown === item.label ? '▲' : '▼'}
                      </span>
                    </button>
                    
                    {activeDropdown === item.label && (
                      <ul className="enhanced-navigation__sidebar-dropdown-menu">
                        {item.children.map((child) => (
                          <li key={child.label} className="enhanced-navigation__sidebar-dropdown-item">
                            <Link
                              to={child.to}
                              className="enhanced-navigation__sidebar-dropdown-link"
                            >
                              <span className="enhanced-navigation__sidebar-dropdown-link-icon">{child.icon}</span>
                              <span className="enhanced-navigation__sidebar-dropdown-link-text">{child.label}</span>
                              {child.badge && (
                                <span className="enhanced-navigation__badge enhanced-navigation__badge--sidebar">{child.badge}</span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.to}
                    className="enhanced-navigation__sidebar-link"
                    title={item.description}
                  >
                    <span className="enhanced-navigation__sidebar-link-icon">{item.icon}</span>
                    <span className="enhanced-navigation__sidebar-link-text">{item.label}</span>
                    {item.badge && (
                      <span className="enhanced-navigation__badge enhanced-navigation__badge--sidebar">{item.badge}</span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="enhanced-navigation__sidebar-footer">
          <Link
            href="https://github.com/FlynnVIN10/Zeropoint-Protocol"
            className="enhanced-navigation__sidebar-action"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="enhanced-navigation__sidebar-action-icon">📦</span>
            <span className="enhanced-navigation__sidebar-action-text">GitHub</span>
          </Link>
        </div>
      </nav>
    );
  }

  // Mobile Navigation Variant (standalone)
  return (
    <nav className={`enhanced-navigation enhanced-navigation--mobile ${className}`}>
      <div className="enhanced-navigation__mobile-header">
        <Link to="/" className="enhanced-navigation__mobile-logo">
          <span className="enhanced-navigation__mobile-logo-icon">⚡</span>
          <span className="enhanced-navigation__mobile-logo-text">{siteConfig.title}</span>
        </Link>
        <button
          className="enhanced-navigation__mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className={`enhanced-navigation__mobile-toggle-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
          <span className={`enhanced-navigation__mobile-toggle-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
          <span className={`enhanced-navigation__mobile-toggle-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
        </button>
      </div>
      
      {isMobileMenuOpen && (
        <div className="enhanced-navigation__mobile-content">
          <ul className="enhanced-navigation__mobile-list">
            {navigationItems.map((item) => (
              <li key={item.label} className="enhanced-navigation__mobile-item">
                {item.children ? (
                  <div className="enhanced-navigation__mobile-dropdown">
                    <button
                      className="enhanced-navigation__mobile-dropdown-toggle"
                      onClick={() => handleDropdownToggle(item.label)}
                      aria-expanded={activeDropdown === item.label}
                    >
                      <span className="enhanced-navigation__mobile-dropdown-icon">{item.icon}</span>
                      <span className="enhanced-navigation__mobile-dropdown-text">{item.label}</span>
                      <span className="enhanced-navigation__mobile-dropdown-arrow">
                        {activeDropdown === item.label ? '▲' : '▼'}
                      </span>
                    </button>
                    
                    {activeDropdown === item.label && (
                      <ul className="enhanced-navigation__mobile-dropdown-menu">
                        {item.children.map((child) => (
                          <li key={child.label} className="enhanced-navigation__mobile-dropdown-item">
                            <Link
                              to={child.to}
                              className="enhanced-navigation__mobile-dropdown-link"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setActiveDropdown(null);
                              }}
                            >
                              <span className="enhanced-navigation__mobile-dropdown-link-icon">{child.icon}</span>
                              <span className="enhanced-navigation__mobile-dropdown-link-text">{child.label}</span>
                              {child.badge && (
                                <span className="enhanced-navigation__badge enhanced-navigation__badge--mobile">{child.badge}</span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.to}
                    className="enhanced-navigation__mobile-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="enhanced-navigation__mobile-link-icon">{item.icon}</span>
                    <span className="enhanced-navigation__mobile-link-text">{item.label}</span>
                    {item.badge && (
                      <span className="enhanced-navigation__badge enhanced-navigation__badge--mobile">{child.badge}</span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          
          <div className="enhanced-navigation__mobile-actions">
            <Link
              href="https://github.com/FlynnVIN10/Zeropoint-Protocol"
              className="enhanced-navigation__mobile-action"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="enhanced-navigation__mobile-action-icon">📦</span>
              <span className="enhanced-navigation__mobile-action-text">GitHub</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
