import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoleProvider, useRole } from '../RoleContext';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component to use the context
const TestComponent: React.FC = () => {
  const { currentRole, setRole, isLoading, error } = useRole();
  
  return (
    <div>
      <div data-testid="current-role">{currentRole}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button onClick={() => setRole('sentient-consensus')}>Change Role</button>
    </div>
  );
};

describe('RoleContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides default role when no localStorage value', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(
      <RoleProvider>
        <TestComponent />
      </RoleProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-role')).toHaveTextContent('human-consensus');
    });
  });

  it('loads role from localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('sentient-consensus');

    render(
      <RoleProvider>
        <TestComponent />
      </RoleProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-role')).toHaveTextContent('sentient-consensus');
    });
  });

  it('fetches role from backend when localStorage is invalid', async () => {
    localStorageMock.getItem.mockReturnValue('invalid-role');
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ role: 'agent-view' }),
    });

    render(
      <RoleProvider>
        <TestComponent />
      </RoleProvider>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/v1/users/me/role', {
        headers: {
          'Authorization': 'Bearer null',
        },
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('current-role')).toHaveTextContent('agent-view');
    });
  });

  it('handles backend fetch error gracefully', async () => {
    localStorageMock.getItem.mockReturnValue('invalid-role');
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <RoleProvider>
        <TestComponent />
      </RoleProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-role')).toHaveTextContent('human-consensus');
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load user role');
    });
  });

  it('updates role successfully', async () => {
    localStorageMock.getItem.mockReturnValue('human-consensus');
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      statusText: 'OK',
    });

    render(
      <RoleProvider>
        <TestComponent />
      </RoleProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-role')).toHaveTextContent('human-consensus');
    });

    const changeButton = screen.getByText('Change Role');
    fireEvent.click(changeButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userRole', 'sentient-consensus');
      expect(screen.getByTestId('current-role')).toHaveTextContent('sentient-consensus');
    });
  });

  it('handles role update API error', async () => {
    localStorageMock.getItem.mockReturnValue('human-consensus');
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
    });

    render(
      <RoleProvider>
        <TestComponent />
      </RoleProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-role')).toHaveTextContent('human-consensus');
    });

    const changeButton = screen.getByText('Change Role');
    fireEvent.click(changeButton);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to update role');
      expect(screen.getByTestId('current-role')).toHaveTextContent('human-consensus');
    });
  });

  it('logs telemetry on role change', async () => {
    localStorageMock.getItem.mockReturnValue('human-consensus');
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        statusText: 'OK',
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    render(
      <RoleProvider>
        <TestComponent />
      </RoleProvider>
    );

    const changeButton = screen.getByText('Change Role');
    fireEvent.click(changeButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/v1/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('role_change'),
      });
    });
  });

  it('reverts localStorage on API error', async () => {
    localStorageMock.getItem.mockReturnValue('human-consensus');
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <RoleProvider>
        <TestComponent />
      </RoleProvider>
    );

    const changeButton = screen.getByText('Change Role');
    fireEvent.click(changeButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userRole', 'human-consensus');
    });
  });

  it('shows loading state during initialization', () => {
    localStorageMock.getItem.mockReturnValue(null);
    (fetch as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <RoleProvider>
        <TestComponent />
      </RoleProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });

  it('shows loading state during role update', async () => {
    localStorageMock.getItem.mockReturnValue('human-consensus');
    (fetch as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <RoleProvider>
        <TestComponent />
      </RoleProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const changeButton = screen.getByText('Change Role');
    fireEvent.click(changeButton);

    // Note: The current implementation doesn't show loading during role updates
    // This test documents the current behavior
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('validates role values from localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('invalid-role');
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(
      <RoleProvider>
        <TestComponent />
      </RoleProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-role')).toHaveTextContent('human-consensus');
    });
  });

  it('accepts valid role values from localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('agent-view');

    render(
      <RoleProvider>
        <TestComponent />
      </RoleProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-role')).toHaveTextContent('agent-view');
    });
  });

  it('throws error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useRole must be used within a RoleProvider');

    consoleSpy.mockRestore();
  });

  it('handles multiple role changes', async () => {
    localStorageMock.getItem.mockReturnValue('human-consensus');
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      statusText: 'OK',
    });

    render(
      <RoleProvider>
        <TestComponent />
      </RoleProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-role')).toHaveTextContent('human-consensus');
    });

    const changeButton = screen.getByText('Change Role');
    
    // First change
    fireEvent.click(changeButton);
    await waitFor(() => {
      expect(screen.getByTestId('current-role')).toHaveTextContent('sentient-consensus');
    });

    // Second change (simulate by updating localStorage and re-rendering)
    localStorageMock.getItem.mockReturnValue('agent-view');
    fireEvent.click(changeButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
}); 