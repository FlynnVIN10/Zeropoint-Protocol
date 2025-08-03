import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PersonaBadge, { Persona } from '../PersonaBadge';

// Mock fetch for telemetry
global.fetch = jest.fn();

const mockPersona: Persona = {
  id: 'test-persona-1',
  name: 'Test Agent',
  role: 'AI Assistant',
  avatar: '/img/test-avatar.png',
  intent: 'inform',
  confidence: 85,
  metadata: {
    trustScore: 92,
    ethicalScore: 88,
    expertise: ['AI', 'Machine Learning'],
  },
};

const mockPersonaMinimal: Persona = {
  id: 'test-persona-2',
  name: 'Minimal Agent',
  role: 'Helper',
  avatar: '/img/minimal-avatar.png',
  intent: 'question',
};

describe('PersonaBadge Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders basic persona information correctly', () => {
    render(<PersonaBadge persona={mockPersona} />);
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByAltText('Test Agent avatar')).toBeInTheDocument();
  });

  it('renders with correct intent icon', () => {
    render(<PersonaBadge persona={mockPersona} />);
    
    // Check for inform intent icon (📢)
    expect(screen.getByText('📢')).toBeInTheDocument();
  });

  it('applies correct intent styling class', () => {
    const { container } = render(<PersonaBadge persona={mockPersona} />);
    
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('intentInform');
  });

  it('renders metadata when showDetails is true', () => {
    render(<PersonaBadge persona={mockPersona} showDetails={true} />);
    
    expect(screen.getByText('Trust:')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('Ethical:')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();
    expect(screen.getByText('Confidence:')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('does not render metadata when showDetails is false', () => {
    render(<PersonaBadge persona={mockPersona} showDetails={false} />);
    
    expect(screen.queryByText('Trust:')).not.toBeInTheDocument();
    expect(screen.queryByText('Ethical:')).not.toBeInTheDocument();
    expect(screen.queryByText('Confidence:')).not.toBeInTheDocument();
  });

  it('handles missing metadata gracefully', () => {
    render(<PersonaBadge persona={mockPersonaMinimal} showDetails={true} />);
    
    expect(screen.queryByText('Trust:')).not.toBeInTheDocument();
    expect(screen.queryByText('Ethical:')).not.toBeInTheDocument();
    expect(screen.queryByText('Confidence:')).not.toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { container, rerender } = render(
      <PersonaBadge persona={mockPersona} size="small" />
    );
    
    let badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('sizeSmall');

    rerender(<PersonaBadge persona={mockPersona} size="large" />);
    badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('sizeLarge');

    rerender(<PersonaBadge persona={mockPersona} size="medium" />);
    badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('sizeMedium');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<PersonaBadge persona={mockPersona} onClick={handleClick} />);
    
    const badge = screen.getByRole('button');
    fireEvent.click(badge);
    
    expect(handleClick).toHaveBeenCalledWith(mockPersona);
  });

  it('sends telemetry data when clicked', async () => {
    const handleClick = jest.fn();
    render(<PersonaBadge persona={mockPersona} onClick={handleClick} />);
    
    const badge = screen.getByRole('button');
    fireEvent.click(badge);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/v1/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'ux_interaction',
          type: 'persona_badge_click',
          timestamp: expect.any(Number),
          data: {
            personaId: 'test-persona-1',
            personaRole: 'AI Assistant',
            personaIntent: 'inform',
            size: 'medium',
            showDetails: false,
          },
        }),
      });
    });
  });

  it('handles keyboard navigation correctly', () => {
    const handleClick = jest.fn();
    render(<PersonaBadge persona={mockPersona} onClick={handleClick} />);
    
    const badge = screen.getByRole('button');
    
    // Test Enter key
    fireEvent.keyDown(badge, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledWith(mockPersona);
    
    // Test Space key
    fireEvent.keyDown(badge, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('has correct accessibility attributes', () => {
    render(<PersonaBadge persona={mockPersona} />);
    
    const badge = screen.getByRole('img');
    expect(badge).toHaveAttribute('aria-label', 'Test Agent, AI Assistant - inform intent');
  });

  it('has correct accessibility attributes when clickable', () => {
    const handleClick = jest.fn();
    render(<PersonaBadge persona={mockPersona} onClick={handleClick} />);
    
    const badge = screen.getByRole('button');
    expect(badge).toHaveAttribute('aria-label', 'Test Agent, AI Assistant - inform intent');
    expect(badge).toHaveAttribute('tabIndex', '0');
  });

  it('handles avatar image error gracefully', () => {
    render(<PersonaBadge persona={mockPersona} />);
    
    const avatar = screen.getByAltText('Test Agent avatar');
    fireEvent.error(avatar);
    
    expect(avatar).toHaveAttribute('src', '/img/default-avatar.png');
  });

  it('renders different intent icons correctly', () => {
    const { rerender } = render(<PersonaBadge persona={mockPersona} />);
    expect(screen.getByText('📢')).toBeInTheDocument(); // inform

    rerender(<PersonaBadge persona={{ ...mockPersona, intent: 'question' }} />);
    expect(screen.getByText('❓')).toBeInTheDocument(); // question

    rerender(<PersonaBadge persona={{ ...mockPersona, intent: 'action' }} />);
    expect(screen.getByText('⚡')).toBeInTheDocument(); // action

    rerender(<PersonaBadge persona={{ ...mockPersona, intent: 'consensus' }} />);
    expect(screen.getByText('🤝')).toBeInTheDocument(); // consensus
  });

  it('applies custom className correctly', () => {
    const { container } = render(
      <PersonaBadge persona={mockPersona} className="custom-class" />
    );
    
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('custom-class');
  });

  it('does not render interaction indicator when no onClick provided', () => {
    render(<PersonaBadge persona={mockPersona} />);
    
    expect(screen.queryByText('Click for details')).not.toBeInTheDocument();
  });

  it('renders interaction indicator when onClick is provided', () => {
    const handleClick = jest.fn();
    render(<PersonaBadge persona={mockPersona} onClick={handleClick} />);
    
    expect(screen.getByText('Click for details')).toBeInTheDocument();
  });
}); 