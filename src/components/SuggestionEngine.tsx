import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './SuggestionEngine.module.css';

export interface Suggestion {
  id: string;
  text: string;
  type: 'question' | 'action' | 'exploration' | 'clarification';
  confidence: number;
  context: string[];
  metadata?: {
    relevance: number;
    category: string;
    tags: string[];
  };
}

export interface ConversationMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    intent?: string;
    entities?: string[];
    sentiment?: 'positive' | 'negative' | 'neutral';
  };
}

interface SuggestionEngineProps {
  conversationHistory: ConversationMessage[];
  onSuggestionSelect: (suggestion: Suggestion) => void;
  maxSuggestions?: number;
  autoRefresh?: boolean;
  className?: string;
}

export const SuggestionEngine: React.FC<SuggestionEngineProps> = ({
  conversationHistory,
  onSuggestionSelect,
  maxSuggestions = 4,
  autoRefresh = true,
  className = '',
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const eventSourceRef = useRef<EventSource | null>(null);

  // Generate suggestions based on conversation history
  const generateSuggestions = useCallback(async () => {
    if (conversationHistory.length === 0) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare conversation context
      const recentMessages = conversationHistory.slice(-5); // Last 5 messages
      const context = recentMessages.map(msg => ({
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp,
        metadata: msg.metadata,
      }));

      // Call backend suggestions endpoint
      const response = await fetch('/v1/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationHistory: context,
          maxSuggestions,
          userContext: {
            sessionId: sessionStorage.getItem('sessionId') || 'default',
            timestamp: Date.now(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setLastUpdate(Date.now());

      // Log telemetry
      if (typeof window !== 'undefined') {
        fetch('/v1/telemetry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'ux_interaction',
            type: 'suggestions_generated',
            timestamp: Date.now(),
            data: {
              suggestionCount: data.suggestions?.length || 0,
              conversationLength: conversationHistory.length,
              maxSuggestions,
            },
          }),
        }).catch(console.error);
      }
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
      
      // Fallback to basic suggestions
      setSuggestions(generateFallbackSuggestions(conversationHistory));
    } finally {
      setIsLoading(false);
    }
  }, [conversationHistory, maxSuggestions]);

  // Generate fallback suggestions when backend is unavailable
  const generateFallbackSuggestions = useCallback((history: ConversationMessage[]): Suggestion[] => {
    const lastMessage = history[history.length - 1];
    if (!lastMessage) return [];

    const fallbackSuggestions: Suggestion[] = [
      {
        id: 'fallback-1',
        text: 'Tell me more about Zeropoint Protocol',
        type: 'exploration',
        confidence: 0.8,
        context: ['general', 'information'],
        metadata: {
          relevance: 0.8,
          category: 'general',
          tags: ['zeropoint', 'protocol', 'information'],
        },
      },
      {
        id: 'fallback-2',
        text: 'How does the consensus system work?',
        type: 'question',
        confidence: 0.7,
        context: ['consensus', 'system'],
        metadata: {
          relevance: 0.7,
          category: 'technical',
          tags: ['consensus', 'system', 'how'],
        },
      },
      {
        id: 'fallback-3',
        text: 'Show me some code examples',
        type: 'action',
        confidence: 0.6,
        context: ['code', 'examples'],
        metadata: {
          relevance: 0.6,
          category: 'development',
          tags: ['code', 'examples', 'implementation'],
        },
      },
    ];

    return fallbackSuggestions.slice(0, maxSuggestions);
  }, [maxSuggestions]);

  // Setup SSE for real-time suggestions
  useEffect(() => {
    if (!autoRefresh) return;

    const setupSSE = () => {
      try {
        eventSourceRef.current = new EventSource('/v1/suggestions/stream');
        
        eventSourceRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'suggestion_update') {
              setSuggestions(data.suggestions || []);
              setLastUpdate(Date.now());
            }
          } catch (err) {
            console.error('Error parsing SSE data:', err);
          }
        };

        eventSourceRef.current.onerror = (error) => {
          console.error('SSE error:', error);
          eventSourceRef.current?.close();
          eventSourceRef.current = null;
        };
      } catch (err) {
        console.error('Error setting up SSE:', err);
      }
    };

    setupSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [autoRefresh]);

  // Generate suggestions when conversation history changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateSuggestions();
    }, 500); // Debounce to avoid too frequent requests

    return () => clearTimeout(timeoutId);
  }, [generateSuggestions]);

  // Handle suggestion selection
  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    onSuggestionSelect(suggestion);
    
    // Log telemetry
    if (typeof window !== 'undefined') {
      fetch('/v1/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'ux_interaction',
          type: 'suggestion_selected',
          timestamp: Date.now(),
          data: {
            suggestionId: suggestion.id,
            suggestionType: suggestion.type,
            confidence: suggestion.confidence,
            relevance: suggestion.metadata?.relevance,
          },
        }),
      }).catch(console.error);
    }
  }, [onSuggestionSelect]);

  // Get suggestion type icon
  const getSuggestionIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'question':
        return '❓';
      case 'action':
        return '⚡';
      case 'exploration':
        return '🔍';
      case 'clarification':
        return '💡';
      default:
        return '💬';
    }
  };

  // Get suggestion type color class
  const getSuggestionTypeClass = (type: Suggestion['type']) => {
    switch (type) {
      case 'question':
        return styles.typeQuestion;
      case 'action':
        return styles.typeAction;
      case 'exploration':
        return styles.typeExploration;
      case 'clarification':
        return styles.typeClarification;
      default:
        return styles.typeDefault;
    }
  };

  if (suggestions.length === 0 && !isLoading && !error) {
    return null; // Don't render if no suggestions and not loading
  }

  return (
    <div className={`${styles.suggestionEngine} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          💡 Suggestions
          {isLoading && <span className={styles.loadingIndicator}>...</span>}
        </h3>
        {lastUpdate && (
          <span className={styles.lastUpdate}>
            Updated {Math.round((Date.now() - lastUpdate) / 1000)}s ago
          </span>
        )}
      </div>

      {error && (
        <div className={styles.error} role="alert">
          <span className={styles.errorIcon}>⚠️</span>
          <span className={styles.errorText}>{error}</span>
          <button
            className={styles.retryButton}
            onClick={generateSuggestions}
            aria-label="Retry generating suggestions"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading && suggestions.length === 0 && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} aria-hidden="true" />
          <span className={styles.loadingText}>Generating suggestions...</span>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className={styles.suggestionsContainer}>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              className={`${styles.suggestion} ${getSuggestionTypeClass(suggestion.type)}`}
              onClick={() => handleSuggestionClick(suggestion)}
              aria-label={`Select suggestion: ${suggestion.text}`}
              title={`Confidence: ${Math.round(suggestion.confidence * 100)}%`}
            >
              <div className={styles.suggestionContent}>
                <span className={styles.suggestionIcon} aria-hidden="true">
                  {getSuggestionIcon(suggestion.type)}
                </span>
                <span className={styles.suggestionText}>{suggestion.text}</span>
              </div>
              
              {suggestion.metadata && (
                <div className={styles.suggestionMetadata}>
                  <span className={styles.confidence}>
                    {Math.round(suggestion.confidence * 100)}%
                  </span>
                  {suggestion.metadata.relevance && (
                    <span className={styles.relevance}>
                      {Math.round(suggestion.metadata.relevance * 100)}% relevant
                    </span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className={styles.footer}>
          <button
            className={styles.refreshButton}
            onClick={generateSuggestions}
            disabled={isLoading}
            aria-label="Refresh suggestions"
          >
            🔄 Refresh
          </button>
          <span className={styles.suggestionCount}>
            {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default SuggestionEngine; 