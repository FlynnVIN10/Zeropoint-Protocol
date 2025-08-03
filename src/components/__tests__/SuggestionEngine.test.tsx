import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SuggestionEngine, { Suggestion, ConversationMessage } from '../SuggestionEngine';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock EventSource for SSE
global.EventSource = jest.fn().mockImplementation(() => ({
  onmessage: jest.fn(),
  onerror: jest.fn(),
  close: jest.fn(),
}));

const mockConversationHistory: ConversationMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    content: 'Tell me about Zeropoint Protocol',
    timestamp: Date.now() - 60000,
    metadata: {
      intent: 'information_request',
      entities: ['Zeropoint Protocol'],
      sentiment: 'neutral',
    },
  },
  {
    id: 'msg-2',
    sender: 'assistant',
    content: 'Zeropoint Protocol is an advanced AI system...',
    timestamp: Date.now() - 30000,
    metadata: {
      intent: 'inform',
      entities: ['AI system', 'consensus'],
      sentiment: 'positive',
    },
  },
];

const mockSuggestions: Suggestion[] = [
  {
    id: 'suggestion-1',
    text: 'How does the consensus system work?',
    type: 'question',
    confidence: 0.85,
    context: ['consensus', 'system'],
    metadata: {
      relevance: 0.8,
      category: 'technical',
      tags: ['consensus', 'system', 'how'],
    },
  },
  {
    id: 'suggestion-2',
    text: 'Show me code examples',
    type: 'action',
    confidence: 0.72,
    context: ['code', 'examples'],
    metadata: {
      relevance: 0.7,
      category: 'development',
      tags: ['code', 'examples', 'implementation'],
    },
  },
];

describe('SuggestionEngine Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    (EventSource as jest.Mock).mockClear();
  });

  it('renders without crashing', () => {
    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
      />
    );
    
    expect(screen.getByText('💡 Suggestions')).toBeInTheDocument();
  });

  it('does not render when no suggestions and not loading', () => {
    const { container } = render(
      <SuggestionEngine
        conversationHistory={[]}
        onSuggestionSelect={jest.fn()}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('calls API to generate suggestions when conversation history changes', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/v1/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationHistory: mockConversationHistory.slice(-5),
          maxSuggestions: 4,
          userContext: {
            sessionId: 'default',
            timestamp: expect.any(Number),
          },
        }),
      });
    });
  });

  it('displays suggestions when API call succeeds', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('How does the consensus system work?')).toBeInTheDocument();
      expect(screen.getByText('Show me code examples')).toBeInTheDocument();
    });
  });

  it('shows loading state while generating suggestions', async () => {
    (fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
      />
    );

    expect(screen.getByText('Generating suggestions...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // loading spinner
  });

  it('shows error state when API call fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('⚠️')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('shows fallback suggestions when API fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Tell me more about Zeropoint Protocol')).toBeInTheDocument();
      expect(screen.getByText('How does the consensus system work?')).toBeInTheDocument();
      expect(screen.getByText('Show me some code examples')).toBeInTheDocument();
    });
  });

  it('calls onSuggestionSelect when suggestion is clicked', async () => {
    const handleSuggestionSelect = jest.fn();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={handleSuggestionSelect}
      />
    );

    await waitFor(() => {
      const suggestionButton = screen.getByText('How does the consensus system work?');
      fireEvent.click(suggestionButton);
    });

    expect(handleSuggestionSelect).toHaveBeenCalledWith(mockSuggestions[0]);
  });

  it('sends telemetry when suggestion is selected', async () => {
    const handleSuggestionSelect = jest.fn();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={handleSuggestionSelect}
      />
    );

    await waitFor(() => {
      const suggestionButton = screen.getByText('How does the consensus system work?');
      fireEvent.click(suggestionButton);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/v1/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'ux_interaction',
          type: 'suggestion_selected',
          timestamp: expect.any(Number),
          data: {
            suggestionId: 'suggestion-1',
            suggestionType: 'question',
            confidence: 0.85,
            relevance: 0.8,
          },
        }),
      });
    });
  });

  it('displays suggestion type icons correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('❓')).toBeInTheDocument(); // question type
      expect(screen.getByText('⚡')).toBeInTheDocument(); // action type
    });
  });

  it('displays confidence and relevance metadata', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('80% relevant')).toBeInTheDocument();
      expect(screen.getByText('72%')).toBeInTheDocument();
      expect(screen.getByText('70% relevant')).toBeInTheDocument();
    });
  });

  it('handles refresh button click', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ suggestions: mockSuggestions }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ suggestions: mockSuggestions }),
      });

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('disables refresh button while loading', async () => {
    (fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
      />
    );

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeDisabled();
  });

  it('shows suggestion count in footer', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('2 suggestions')).toBeInTheDocument();
    });
  });

  it('respects maxSuggestions prop', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
        maxSuggestions={1}
      />
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/v1/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationHistory: mockConversationHistory.slice(-5),
          maxSuggestions: 1,
          userContext: {
            sessionId: 'default',
            timestamp: expect.any(Number),
          },
        }),
      });
    });
  });

  it('handles keyboard navigation', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    const handleSuggestionSelect = jest.fn();

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={handleSuggestionSelect}
      />
    );

    await waitFor(() => {
      const suggestionButton = screen.getByText('How does the consensus system work?');
      fireEvent.keyDown(suggestionButton, { key: 'Enter' });
    });

    expect(handleSuggestionSelect).toHaveBeenCalledWith(mockSuggestions[0]);
  });

  it('has correct accessibility attributes', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      const suggestionButton = screen.getByRole('button', { 
        name: /select suggestion: how does the consensus system work\?/i 
      });
      expect(suggestionButton).toHaveAttribute('title', 'Confidence: 85%');
    });
  });

  it('handles SSE updates when autoRefresh is enabled', async () => {
    const mockEventSource = {
      onmessage: jest.fn(),
      onerror: jest.fn(),
      close: jest.fn(),
    };
    (EventSource as jest.Mock).mockReturnValue(mockEventSource);

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
        autoRefresh={true}
      />
    );

    expect(EventSource).toHaveBeenCalledWith('/v1/suggestions/stream');

    // Simulate SSE message
    const sseMessage = {
      data: JSON.stringify({
        type: 'suggestion_update',
        suggestions: mockSuggestions,
      }),
    };

    mockEventSource.onmessage(sseMessage);

    await waitFor(() => {
      expect(screen.getByText('How does the consensus system work?')).toBeInTheDocument();
    });
  });

  it('does not setup SSE when autoRefresh is disabled', () => {
    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
        autoRefresh={false}
      />
    );

    expect(EventSource).not.toHaveBeenCalled();
  });

  it('handles SSE errors gracefully', () => {
    const mockEventSource = {
      onmessage: jest.fn(),
      onerror: jest.fn(),
      close: jest.fn(),
    };
    (EventSource as jest.Mock).mockReturnValue(mockEventSource);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
        autoRefresh={true}
      />
    );

    // Simulate SSE error
    mockEventSource.onerror(new Error('SSE connection failed'));

    expect(mockEventSource.close).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('debounces suggestion generation', async () => {
    jest.useFakeTimers();

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    const { rerender } = render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
      />
    );

    // Change conversation history multiple times quickly
    rerender(
      <SuggestionEngine
        conversationHistory={[...mockConversationHistory, {
          id: 'msg-3',
          sender: 'user',
          content: 'Another message',
          timestamp: Date.now(),
        }]}
        onSuggestionSelect={jest.fn()}
      />
    );

    rerender(
      <SuggestionEngine
        conversationHistory={[...mockConversationHistory, {
          id: 'msg-4',
          sender: 'user',
          content: 'Yet another message',
          timestamp: Date.now(),
        }]}
        onSuggestionSelect={jest.fn()}
      />
    );

    // Should not have called fetch yet due to debouncing
    expect(fetch).not.toHaveBeenCalled();

    // Fast-forward time to trigger debounced call
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    jest.useRealTimers();
  });

  it('applies custom className correctly', () => {
    const { container } = render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
        className="custom-suggestion-engine"
      />
    );

    expect(container.firstChild).toHaveClass('custom-suggestion-engine');
  });

  it('handles empty conversation history gracefully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: [] }),
    });

    render(
      <SuggestionEngine
        conversationHistory={[]}
        onSuggestionSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/v1/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationHistory: [],
          maxSuggestions: 4,
          userContext: {
            sessionId: 'default',
            timestamp: expect.any(Number),
          },
        }),
      });
    });
  });

  it('handles HTTP error responses', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    render(
      <SuggestionEngine
        conversationHistory={mockConversationHistory}
        onSuggestionSelect={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('HTTP 500: Internal Server Error')).toBeInTheDocument();
    });
  });
}); 