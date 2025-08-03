import React, { useState, useCallback } from 'react';
import SuggestionEngine, { Suggestion, ConversationMessage } from './SuggestionEngine';
import styles from './SuggestionEngineDemo.module.css';

const demoConversationHistory: ConversationMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    content: 'Hello, I\'m interested in learning about Zeropoint Protocol',
    timestamp: Date.now() - 300000,
    metadata: {
      intent: 'greeting',
      entities: ['Zeropoint Protocol'],
      sentiment: 'positive',
    },
  },
  {
    id: 'msg-2',
    sender: 'assistant',
    content: 'Welcome! Zeropoint Protocol is an advanced AI system that combines distributed machine learning, ethical AI governance, and decentralized identity management.',
    timestamp: Date.now() - 240000,
    metadata: {
      intent: 'inform',
      entities: ['AI system', 'machine learning', 'governance'],
      sentiment: 'positive',
    },
  },
  {
    id: 'msg-3',
    sender: 'user',
    content: 'That sounds interesting. How does the consensus system work?',
    timestamp: Date.now() - 180000,
    metadata: {
      intent: 'question',
      entities: ['consensus system'],
      sentiment: 'neutral',
    },
  },
  {
    id: 'msg-4',
    sender: 'assistant',
    content: 'The consensus system uses a dual-architecture approach with Python backend for AI model inference and NestJS API gateway for orchestration and security.',
    timestamp: Date.now() - 120000,
    metadata: {
      intent: 'inform',
      entities: ['consensus', 'Python', 'NestJS', 'API'],
      sentiment: 'positive',
    },
  },
  {
    id: 'msg-5',
    sender: 'user',
    content: 'Can you show me some code examples?',
    timestamp: Date.now() - 60000,
    metadata: {
      intent: 'request',
      entities: ['code examples'],
      sentiment: 'positive',
    },
  },
];

const demoSuggestions: Suggestion[] = [
  {
    id: 'demo-1',
    text: 'How does the ethical AI governance work?',
    type: 'question',
    confidence: 0.92,
    context: ['ethical', 'governance', 'AI'],
    metadata: {
      relevance: 0.88,
      category: 'technical',
      tags: ['ethics', 'governance', 'AI', 'how'],
    },
  },
  {
    id: 'demo-2',
    text: 'Show me the API endpoints documentation',
    type: 'action',
    confidence: 0.85,
    context: ['API', 'endpoints', 'documentation'],
    metadata: {
      relevance: 0.82,
      category: 'development',
      tags: ['API', 'endpoints', 'docs', 'implementation'],
    },
  },
  {
    id: 'demo-3',
    text: 'What are the security features?',
    type: 'question',
    confidence: 0.78,
    context: ['security', 'features'],
    metadata: {
      relevance: 0.75,
      category: 'security',
      tags: ['security', 'features', 'protection'],
    },
  },
  {
    id: 'demo-4',
    text: 'Tell me about the distributed learning capabilities',
    type: 'exploration',
    confidence: 0.73,
    context: ['distributed', 'learning', 'capabilities'],
    metadata: {
      relevance: 0.70,
      category: 'technical',
      tags: ['distributed', 'learning', 'AI', 'capabilities'],
    },
  },
];

export const SuggestionEngineDemo: React.FC = () => {
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>(demoConversationHistory);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [maxSuggestions, setMaxSuggestions] = useState(4);
  const [demoMode, setDemoMode] = useState<'api' | 'fallback'>('api');

  const handleSuggestionSelect = useCallback((suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    
    // Add the selected suggestion as a user message to the conversation
    const newMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: suggestion.text,
      timestamp: Date.now(),
      metadata: {
        intent: suggestion.type,
        entities: suggestion.context,
        sentiment: 'neutral',
      },
    };
    
    setConversationHistory(prev => [...prev, newMessage]);
    
    // Log telemetry for demo interaction
    if (typeof window !== 'undefined') {
      fetch('/v1/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'ux_interaction',
          type: 'suggestion_demo_select',
          timestamp: Date.now(),
          data: {
            suggestionId: suggestion.id,
            suggestionType: suggestion.type,
            confidence: suggestion.confidence,
            relevance: suggestion.metadata?.relevance,
            demoMode,
          },
        }),
      }).catch(console.error);
    }
  }, [demoMode]);

  const addDemoMessage = useCallback((content: string, sender: 'user' | 'assistant' = 'user') => {
    const newMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      sender,
      content,
      timestamp: Date.now(),
      metadata: {
        intent: sender === 'user' ? 'demo_input' : 'demo_response',
        entities: [],
        sentiment: 'neutral',
      },
    };
    
    setConversationHistory(prev => [...prev, newMessage]);
  }, []);

  const clearConversation = useCallback(() => {
    setConversationHistory([]);
    setSelectedSuggestion(null);
  }, []);

  const resetToDemo = useCallback(() => {
    setConversationHistory(demoConversationHistory);
    setSelectedSuggestion(null);
  }, []);

  return (
    <div className={styles.demoContainer}>
      <div className={styles.header}>
        <h2>SuggestionEngine Component Demo</h2>
        <p>Interactive demonstration of context-aware suggestions with conversation history integration</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label className={styles.control}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto Refresh
          </label>
          
          <label className={styles.control}>
            <span>Max Suggestions:</span>
            <select
              value={maxSuggestions}
              onChange={(e) => setMaxSuggestions(Number(e.target.value))}
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={6}>6</option>
              <option value={8}>8</option>
            </select>
          </label>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.control}>
            <span>Demo Mode:</span>
            <select
              value={demoMode}
              onChange={(e) => setDemoMode(e.target.value as 'api' | 'fallback')}
            >
              <option value="api">API Mode</option>
              <option value="fallback">Fallback Mode</option>
            </select>
          </label>
        </div>

        <div className={styles.controlGroup}>
          <button
            className={styles.actionButton}
            onClick={() => addDemoMessage('What are the main features?')}
          >
            Add Demo Question
          </button>
          <button
            className={styles.actionButton}
            onClick={() => addDemoMessage('How do I get started?')}
          >
            Add Start Question
          </button>
          <button
            className={styles.actionButton}
            onClick={clearConversation}
          >
            Clear Chat
          </button>
          <button
            className={styles.actionButton}
            onClick={resetToDemo}
          >
            Reset to Demo
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.conversationPanel}>
          <h3>Conversation History</h3>
          <div className={styles.conversationContainer}>
            {conversationHistory.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No conversation history. Add some messages to see suggestions!</p>
                <button
                  className={styles.actionButton}
                  onClick={() => addDemoMessage('Hello, tell me about Zeropoint Protocol')}
                >
                  Start Conversation
                </button>
              </div>
            ) : (
              <div className={styles.messagesList}>
                {conversationHistory.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.message} ${styles[message.sender]}`}
                  >
                    <div className={styles.messageHeader}>
                      <span className={styles.sender}>
                        {message.sender === 'user' ? '👤 You' : '🤖 Assistant'}
                      </span>
                      <span className={styles.timestamp}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className={styles.messageContent}>
                      {message.content}
                    </div>
                    {message.metadata && (
                      <div className={styles.messageMetadata}>
                        <span className={styles.intent}>Intent: {message.metadata.intent}</span>
                        {message.metadata.entities && message.metadata.entities.length > 0 && (
                          <span className={styles.entities}>
                            Entities: {message.metadata.entities.join(', ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.suggestionsPanel}>
          <h3>Context-Aware Suggestions</h3>
          <div className={styles.suggestionsContainer}>
            <SuggestionEngine
              conversationHistory={conversationHistory}
              onSuggestionSelect={handleSuggestionSelect}
              maxSuggestions={maxSuggestions}
              autoRefresh={autoRefresh}
              className={styles.suggestionEngine}
            />
          </div>
        </div>
      </div>

      {selectedSuggestion && (
        <div className={styles.selectionPanel}>
          <h3>Selected Suggestion</h3>
          <div className={styles.selectedSuggestion}>
            <div className={styles.suggestionDetails}>
              <h4>{selectedSuggestion.text}</h4>
              <div className={styles.suggestionInfo}>
                <span className={styles.type}>Type: {selectedSuggestion.type}</span>
                <span className={styles.confidence}>
                  Confidence: {Math.round(selectedSuggestion.confidence * 100)}%
                </span>
                {selectedSuggestion.metadata?.relevance && (
                  <span className={styles.relevance}>
                    Relevance: {Math.round(selectedSuggestion.metadata.relevance * 100)}%
                  </span>
                )}
              </div>
              <div className={styles.context}>
                <strong>Context:</strong> {selectedSuggestion.context.join(', ')}
              </div>
              {selectedSuggestion.metadata?.tags && (
                <div className={styles.tags}>
                  <strong>Tags:</strong>
                  {selectedSuggestion.metadata.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={styles.featuresPanel}>
        <h3>Features Demonstrated</h3>
        <div className={styles.featuresGrid}>
          <div className={styles.feature}>
            <h4>🎯 Context Awareness</h4>
            <p>Suggestions are generated based on conversation history and user intent</p>
          </div>
          <div className={styles.feature}>
            <h4>⚡ Real-time Updates</h4>
            <p>SSE integration for live suggestion updates as conversation evolves</p>
          </div>
          <div className={styles.feature}>
            <h4>🔄 Fallback Mode</h4>
            <p>Graceful degradation with intelligent fallback suggestions when API is unavailable</p>
          </div>
          <div className={styles.feature}>
            <h4>📊 Confidence Scoring</h4>
            <p>Each suggestion includes confidence and relevance scores for transparency</p>
          </div>
          <div className={styles.feature}>
            <h4>♿ Accessibility</h4>
            <p>WCAG 2.1 AA compliant with keyboard navigation and screen reader support</p>
          </div>
          <div className={styles.feature}>
            <h4>📱 Responsive Design</h4>
            <p>Optimized for all screen sizes with mobile-first approach</p>
          </div>
        </div>
      </div>

      <div className={styles.technicalPanel}>
        <h3>Technical Implementation</h3>
        <div className={styles.technicalDetails}>
          <div className={styles.techItem}>
            <h4>API Integration</h4>
            <ul>
              <li>POST /v1/suggestions for generating context-aware suggestions</li>
              <li>SSE /v1/suggestions/stream for real-time updates</li>
              <li>Telemetry logging for UX analytics</li>
              <li>Error handling with graceful fallbacks</li>
            </ul>
          </div>
          <div className={styles.techItem}>
            <h4>Performance Features</h4>
            <ul>
              <li>Debounced API calls to prevent excessive requests</li>
              <li>Conversation history slicing (last 5 messages)</li>
              <li>Configurable max suggestions limit</li>
              <li>Memory-efficient state management</li>
            </ul>
          </div>
          <div className={styles.techItem}>
            <h4>User Experience</h4>
            <ul>
              <li>Loading states with visual feedback</li>
              <li>Error states with retry functionality</li>
              <li>Confidence and relevance indicators</li>
              <li>Type-based visual categorization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionEngineDemo; 