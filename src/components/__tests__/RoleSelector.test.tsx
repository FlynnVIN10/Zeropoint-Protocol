import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoleSelector from '../RoleSelector';

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

describe('RoleSelector', () => {
  const mockOnRoleChange = jest.fn();
  const defaultProps = {
    onRoleChange: mockOnRoleChange,
    currentRole: 'human-consensus' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('human-consensus');
  });

  it('renders with current role', () => {
    render(<RoleSelector {...defaultProps} />);
    
    expect(screen.getByText('Human Consensus')).toBeInTheDocument();
    expect(screen.getByLabelText(/Current role: Human Consensus/)).toBeInTheDocument();
  });

  it('displays role icon', () => {
    render(<RoleSelector {...defaultProps} />);
    
    expect(screen.getByText('👤')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Sentient Consensus')).toBeInTheDocument();
    expect(screen.getByText('Agent View')).toBeInTheDocument();
  });

  it('shows all role options in dropdown', () => {
    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Human Consensus')).toBeInTheDocument();
    expect(screen.getByText('Override authority with veto power')).toBeInTheDocument();
    
    expect(screen.getByText('Sentient Consensus')).toBeInTheDocument();
    expect(screen.getByText('Collective AI decision making')).toBeInTheDocument();
    
    expect(screen.getByText('Agent View')).toBeInTheDocument();
    expect(screen.getByText('Individual agent perspective')).toBeInTheDocument();
  });

  it('displays role icons in dropdown', () => {
    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('👤')).toBeInTheDocument();
    expect(screen.getByText('🧠')).toBeInTheDocument();
    expect(screen.getByText('🤖')).toBeInTheDocument();
  });

  it('shows checkmark for current role', () => {
    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const checkmarks = screen.getAllByText('✓');
    expect(checkmarks).toHaveLength(1);
  });

  it('handles role selection', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      statusText: 'OK',
    });

    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const sentientOption = screen.getByText('Sentient Consensus');
    fireEvent.click(sentientOption);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userRole', 'sentient-consensus');
      expect(mockOnRoleChange).toHaveBeenCalledWith('sentient-consensus');
    });
  });

  it('calls API to update role', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      statusText: 'OK',
    });

    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const sentientOption = screen.getByText('Sentient Consensus');
    fireEvent.click(sentientOption);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/v1/users/me/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer null',
        },
        body: JSON.stringify({ role: 'sentient-consensus' }),
      });
    });
  });

  it('logs telemetry on role change', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        statusText: 'OK',
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const sentientOption = screen.getByText('Sentient Consensus');
    fireEvent.click(sentientOption);
    
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

  it('handles API error gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const sentientOption = screen.getByText('Sentient Consensus');
    fireEvent.click(sentientOption);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userRole', 'human-consensus');
    });
  });

  it('handles non-OK API response', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
    });

    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const sentientOption = screen.getByText('Sentient Consensus');
    fireEvent.click(sentientOption);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userRole', 'human-consensus');
    });
  });

  it('supports keyboard navigation', () => {
    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const sentientOption = screen.getByText('Sentient Consensus');
    fireEvent.keyDown(sentientOption, { key: 'Enter' });
    
    expect(mockOnRoleChange).toHaveBeenCalledWith('sentient-consensus');
  });

  it('supports space key for selection', () => {
    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const sentientOption = screen.getByText('Sentient Consensus');
    fireEvent.keyDown(sentientOption, { key: ' ' });
    
    expect(mockOnRoleChange).toHaveBeenCalledWith('sentient-consensus');
  });

  it('prevents default on keyboard events', () => {
    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const sentientOption = screen.getByText('Sentient Consensus');
    const event = { key: 'Enter', preventDefault: jest.fn() };
    fireEvent.keyDown(sentientOption, event);
    
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('closes dropdown when same role is selected', () => {
    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const humanOption = screen.getByText('Human Consensus');
    fireEvent.click(humanOption);
    
    expect(mockOnRoleChange).not.toHaveBeenCalled();
  });

  it('shows loading state during role change', async () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const sentientOption = screen.getByText('Sentient Consensus');
    fireEvent.click(sentientOption);
    
    expect(screen.getByText('⏳')).toBeInTheDocument();
  });

  it('disables button during loading', async () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const sentientOption = screen.getByText('Sentient Consensus');
    fireEvent.click(sentientOption);
    
    expect(button).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<RoleSelector {...defaultProps} className="custom-class" />);
    
    const container = screen.getByRole('button').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('has proper ARIA attributes', () => {
    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('updates ARIA expanded attribute when opened', () => {
    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('has proper role attributes for dropdown options', () => {
    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    
    options.forEach(option => {
      expect(option).toHaveAttribute('aria-selected');
    });
  });

  it('marks current role as selected in ARIA', () => {
    render(<RoleSelector {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const humanOption = screen.getByText('Human Consensus').closest('[role="option"]');
    expect(humanOption).toHaveAttribute('aria-selected', 'true');
  });
}); 