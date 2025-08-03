import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '../components/RoleSelector';

interface RoleContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  isLoading: boolean;
  error: string | null;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
}

const DEFAULT_ROLE: UserRole = 'human-consensus';

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(DEFAULT_ROLE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize role from localStorage or fetch from backend
  useEffect(() => {
    const initializeRole = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First try to get from localStorage
        const storedRole = localStorage.getItem('userRole') as UserRole;
        
        if (storedRole && ['human-consensus', 'sentient-consensus', 'agent-view'].includes(storedRole)) {
          setCurrentRole(storedRole);
        } else {
          // If no valid role in localStorage, fetch from backend
          const backendRole = await fetchUserRole();
          if (backendRole) {
            setCurrentRole(backendRole);
            localStorage.setItem('userRole', backendRole);
          }
        }
      } catch (err) {
        console.error('Failed to initialize role:', err);
        setError('Failed to load user role');
        // Fallback to default role
        setCurrentRole(DEFAULT_ROLE);
      } finally {
        setIsLoading(false);
      }
    };

    initializeRole();
  }, []);

  const fetchUserRole = async (): Promise<UserRole | null> => {
    try {
      const response = await fetch('/v1/users/me/role', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.role as UserRole;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to fetch user role from backend:', error);
      return null;
    }
  };

  const setRole = async (role: UserRole) => {
    try {
      setError(null);
      
      // Update localStorage immediately for responsive UI
      localStorage.setItem('userRole', role);
      setCurrentRole(role);

      // Sync with backend
      await updateUserRole(role);
      
      // Log telemetry
      logRoleChange(role);
      
    } catch (err) {
      console.error('Failed to update role:', err);
      setError('Failed to update role');
      
      // Revert localStorage change on error
      localStorage.setItem('userRole', currentRole);
      setCurrentRole(currentRole);
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
        source: 'role_context'
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

  const value: RoleContextType = {
    currentRole,
    setRole,
    isLoading,
    error
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export default RoleContext; 