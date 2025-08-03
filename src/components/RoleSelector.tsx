import React, { useState, useEffect } from 'react';
import styles from './RoleSelector.module.css';

// Types
export type UserRole = 'human-consensus' | 'sentient-consensus' | 'agent-view';

interface RoleSelectorProps {
  onRoleChange: (role: UserRole) => void;
  currentRole: UserRole;
  className?: string;
}

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  icon: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'human-consensus',
    label: 'Human Consensus',
    description: 'Override authority with veto power',
    icon: '👤'
  },
  {
    value: 'sentient-consensus',
    label: 'Sentient Consensus',
    description: 'Collective AI decision making',
    icon: '🧠'
  },
  {
    value: 'agent-view',
    label: 'Agent View',
    description: 'Individual agent perspective',
    icon: '🤖'
  }
];

const RoleSelector: React.FC<RoleSelectorProps> = ({ 
  onRoleChange, 
  currentRole, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentOption = ROLE_OPTIONS.find(option => option.value === currentRole);

  const handleRoleSelect = async (role: UserRole) => {
    if (role === currentRole) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      // Update role in localStorage
      localStorage.setItem('userRole', role);
      
      // Sync with backend
      await updateUserRole(role);
      
      // Trigger role change
      onRoleChange(role);
      
      // Log telemetry
      logRoleChange(role);
      
    } catch (error) {
      console.error('Failed to update role:', error);
      // Revert localStorage change on error
      localStorage.setItem('userRole', currentRole);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const updateUserRole = async (role: UserRole): Promise<void> => {
    const response = await fetch('/v1/users/me/role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ role })
    });

    if (!response.ok) {
      throw new Error(`Failed to update role: ${response.statusText}`);
    }
  };

  const logRoleChange = (role: UserRole): void => {
    const telemetryEvent = {
      event: 'role_change',
      type: 'user_interaction',
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      data: {
        previousRole: currentRole,
        newRole: role,
        source: 'role_selector'
      }
    };

    // Send telemetry
    fetch('/v1/telemetry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(telemetryEvent)
    }).catch(error => {
      console.warn('Failed to log telemetry:', error);
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent, role: UserRole) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRoleSelect(role);
    }
  };

  return (
    <div className={`${styles.roleSelector} ${className}`}>
      <button
        className={styles.roleButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current role: ${currentOption?.label}. Click to change role.`}
        disabled={isLoading}
      >
        <span className={styles.roleIcon}>{currentOption?.icon}</span>
        <span className={styles.roleLabel}>{currentOption?.label}</span>
        <span className={styles.dropdownArrow}>
          {isOpen ? '▲' : '▼'}
        </span>
        {isLoading && <span className={styles.loadingSpinner}>⏳</span>}
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          {ROLE_OPTIONS.map((option) => (
            <div
              key={option.value}
              className={`${styles.roleOption} ${
                option.value === currentRole ? styles.selected : ''
              }`}
              onClick={() => handleRoleSelect(option.value)}
              onKeyDown={(e) => handleKeyDown(e, option.value)}
              role="option"
              aria-selected={option.value === currentRole}
              tabIndex={0}
            >
              <span className={styles.optionIcon}>{option.icon}</span>
              <div className={styles.optionContent}>
                <span className={styles.optionLabel}>{option.label}</span>
                <span className={styles.optionDescription}>
                  {option.description}
                </span>
              </div>
              {option.value === currentRole && (
                <span className={styles.checkmark}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleSelector; 