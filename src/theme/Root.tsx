import React, { useEffect } from 'react';

export default function Root({ children }: { children: React.ReactNode }): JSX.Element {
  useEffect(() => {
    // Set data-theme attribute to dark
    document.documentElement.setAttribute('data-theme', 'dark');
    
    // Override any light theme styles
    const style = document.createElement('style');
    style.textContent = `
      html, body {
        background: #1A1A1A !important;
        color: #F5F5F0 !important;
      }
      
      [data-theme='light'] {
        --ifm-background-color: #1A1A1A !important;
        --ifm-background-surface-color: #1A1A1A !important;
        --ifm-color-content: #F5F5F0 !important;
        --ifm-color-content-secondary: #F5F5F0 !important;
        --ifm-navbar-background-color: transparent !important;
        --ifm-footer-background-color: #1A1A1A !important;
        --ifm-card-background-color: rgba(26, 26, 26, 0.8) !important;
        --ifm-code-background: #333333 !important;
        --ifm-code-color: #00C4FF !important;
      }
      
      [data-theme='dark'] {
        --ifm-background-color: #1A1A1A !important;
        --ifm-background-surface-color: #1A1A1A !important;
        --ifm-color-content: #F5F5F0 !important;
        --ifm-color-content-secondary: #F5F5F0 !important;
        --ifm-navbar-background-color: transparent !important;
        --ifm-footer-background-color: #1A1A1A !important;
        --ifm-card-background-color: rgba(26, 26, 26, 0.8) !important;
        --ifm-code-background: #333333 !important;
        --ifm-code-color: #00C4FF !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return <>{children}</>;
} 