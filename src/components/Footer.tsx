'use client';
import React, { useState, useEffect } from 'react';

const Footer: React.FC = () => {
  const [versionInfo, setVersionInfo] = useState<{
    commit?: string;
    buildTime?: string;
    phase?: string;
  }>({});

  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        const response = await fetch(`/status/version.json?cb=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          setVersionInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch version info:', error);
      }
    };

    fetchVersionInfo();
    // Refresh every 30 seconds
    const interval = setInterval(fetchVersionInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      padding: '8px 16px',
      fontSize: '12px',
      borderTop: '1px solid #333',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <strong>Zeropoint Protocol</strong> - {versionInfo.phase || 'stage2'}
      </div>
      <div>
        {versionInfo.commit && (
          <span>Commit: {versionInfo.commit}</span>
        )}
        {versionInfo.buildTime && (
          <span style={{ marginLeft: '16px' }}>
            Build: {new Date(versionInfo.buildTime).toLocaleString()}
          </span>
        )}
      </div>
    </footer>
  );
};

export default Footer;
