import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '@theme/Layout';
import styles from './interact.module.css';

// API Configuration
const API_BASE_URL = 'http://localhost:3000/v1';

// Types
interface LLMResponse {
  text: string;
  metadata: {
    confidence: number;
    type: string;
    model: string;
    tokens: number;
    latency: number;
    finishReason?: string;
  };
}

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'assistant';
  metadata?: LLMResponse['metadata'];
  isStreaming?: boolean;
}

interface TelemetryEvent {
  event: string;
  type: string;
  timestamp: number;
  userAgent: string;
  data?: any;
}

// Enhanced Components
const RegenerateButton: React.FC<{ onRegenerate: () => void; isLoading: boolean }> = ({ onRegenerate, isLoading }) => (
  <button 
    onClick={onRegenerate}
    disabled={isLoading}
    className={styles.regenerateButton}
    aria-label="Regenerate response"
    title="Generate a new response to the last question"
  >
    {isLoading ? '🔄 Generating...' : '🔄 Regenerate'}
  </button>
);

const RetryButton: React.FC<{ onRetry: () => void; isLoading: boolean }> = ({ onRetry, isLoading }) => (
  <button 
    onClick={onRetry}
    disabled={isLoading}
    className={styles.retryButton}
    aria-label="Retry request"
    title="Retry the last request"
  >
    {isLoading ? '⏳ Retrying...' : '🔄 Retry'}
  </button>
);

const TypingIndicator: React.FC = () => (
  <div className={styles.typingIndicator} aria-label="AI is typing">
    <span></span>
    <span></span>
    <span></span>
  </div>
);

const ResponseMetadata: React.FC<{ metadata: LLMResponse['metadata'] }> = ({ metadata }) => (
  <div className={styles.metadata}>
    <div className={styles.metadataItem}>
      <label>Confidence:</label>
      <span>{metadata.confidence.toFixed(2)}%</span>
    </div>
    <div className={styles.metadataItem}>
      <label>Type:</label>
      <span>{metadata.type}</span>
    </div>
    <div className={styles.metadataItem}>
      <label>Model:</label>
      <span>{metadata.model}</span>
    </div>
    <div className={styles.metadataItem}>
      <label>Tokens:</label>
      <span>{metadata.tokens}</span>
    </div>
    <div className={styles.metadataItem}>
      <label>Latency:</label>
      <span>{metadata.latency}ms</span>
    </div>
    {metadata.finishReason && (
      <div className={styles.metadataItem}>
        <label>Finish Reason:</label>
        <span>{metadata.finishReason}</span>
      </div>
    )}
  </div>
);

const ChatMessage: React.FC<{ message: ChatMessage }> = ({ message }) => (
  <div className={`${styles.message} ${styles[message.sender]}`}>
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
      {message.isStreaming && <TypingIndicator />}
    </div>
    {message.metadata && !message.isStreaming && <ResponseMetadata metadata={message.metadata} />}
  </div>
);

const LoadingSpinner: React.FC = () => (
  <div className={styles.loadingSpinner} aria-label="Loading">
    <div className={styles.spinner}></div>
    <span>Processing your request...</span>
  </div>
);

// Main Interact Component
export default function Interact(): JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStream, setCurrentStream] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(`session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Enhanced telemetry logging
  const logTelemetry = useCallback(async (event: string, type: string, data?: any) => {
    const telemetryEvent: TelemetryEvent = {
      event: 'ux_interaction',
      type,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      data: {
        ...data,
        sessionId,
        messageCount: messages.length
      }
    };

    try {
      await fetch(`${API_BASE_URL}/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telemetryEvent)
      });
    } catch (error) {
      console.error('Telemetry logging failed:', error);
    }
  }, [sessionId, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStream]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Generate response from LLM with enhanced streaming
  const generateResponse = useCallback(async (prompt: string, isRetry: boolean = false) => {
    setIsLoading(true);
    setError(null);
    setIsStreaming(true);
    setCurrentStream('');

    const startTime = Date.now();

    try {
      // Log interaction
      logTelemetry('llm_request', isRetry ? 'retry' : 'generate', { 
        prompt,
        promptLength: prompt.length,
        timestamp: new Date().toISOString()
      });

      const response = await fetch(`${API_BASE_URL}/generate/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          context: {
            conversation: messages.map(m => ({ role: m.sender, content: m.content })),
            timestamp: new Date().toISOString(),
            sessionId,
            userAgent: navigator.userAgent
          },
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullText = '';
      let metadata: LLMResponse['metadata'] | null = null;
      let tokenCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setCurrentStream(fullText);
                tokenCount++;
              }
              if (parsed.metadata) {
                metadata = parsed.metadata;
              }
            } catch (e) {
              // Continue processing other lines
            }
          }
        }
      }

      const endTime = Date.now();
      const latency = endTime - startTime;

      // Add the complete message
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: fullText,
        timestamp: new Date().toISOString(),
        sender: 'assistant',
        metadata: metadata || {
          confidence: 0.85,
          type: 'text-generation',
          model: 'Zeropoint-LLM',
          tokens: tokenCount,
          latency,
          finishReason: 'stop'
        }
      };

      setMessages(prev => [...prev, newMessage]);
      setCurrentStream('');
      setIsStreaming(false);

      // Log successful response
      logTelemetry('llm_response', 'success', { 
        messageId: newMessage.id,
        tokens: newMessage.metadata?.tokens,
        latency,
        responseLength: fullText.length
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setIsStreaming(false);
      setCurrentStream('');
      
      // Log error
      logTelemetry('llm_error', 'request_failed', { 
        error: errorMessage,
        prompt,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, logTelemetry, sessionId]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      timestamp: new Date().toISOString(),
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Log user message
    logTelemetry('user_message', 'sent', { 
      messageId: userMessage.id,
      contentLength: inputValue.length
    });
    
    // Generate response
    await generateResponse(inputValue);
  }, [inputValue, isLoading, generateResponse, logTelemetry]);

  // Handle regenerate
  const handleRegenerate = useCallback(async () => {
    const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
    if (lastUserMessage) {
      // Remove the last assistant message if it exists
      setMessages(prev => prev.filter((_, index) => index < prev.length - 1));
      logTelemetry('regenerate', 'clicked', { 
        lastUserMessage: lastUserMessage.content 
      });
      await generateResponse(lastUserMessage.content, true);
    }
  }, [messages, generateResponse, logTelemetry]);

  // Handle retry
  const handleRetry = useCallback(async () => {
    const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
    if (lastUserMessage) {
      logTelemetry('retry', 'clicked', { 
        lastUserMessage: lastUserMessage.content 
      });
      await generateResponse(lastUserMessage.content, true);
    }
  }, [messages, generateResponse, logTelemetry]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
          handleSubmit(e as any);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [inputValue, isLoading, handleSubmit]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          content: 'Welcome to Zeropoint Protocol! I\'m here to help you interact with our AI system. What would you like to know?',
          timestamp: new Date().toISOString(),
          sender: 'assistant',
          metadata: {
            confidence: 1.0,
            type: 'greeting',
            model: 'Zeropoint-LLM',
            tokens: 20,
            latency: 0,
            finishReason: 'stop'
          }
        }
      ]);
    }

    // Log page view
    logTelemetry('interact_view', 'page_load');
  }, [logTelemetry]);

  return (
    <Layout title="Interact" description="Interact with Zeropoint Protocol AI">
      <main className={styles.interact}>
        <div className={styles.header}>
          <h1>Interact with Zeropoint Protocol</h1>
          <p>Ask questions, generate content, and explore AI capabilities</p>
        </div>

        <div className={styles.container}>
          <div className={styles.chatContainer}>
            <div className={styles.messages}>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {isStreaming && currentStream && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.messageHeader}>
                    <span className={styles.sender}>🤖 Assistant</span>
                    <span className={styles.timestamp}>Now</span>
                  </div>
                  <div className={styles.messageContent}>
                    {currentStream}
                    <TypingIndicator />
                  </div>
                </div>
              )}

              {error && (
                <div className={styles.error}>
                  <p>❌ Error: {error}</p>
                  <RetryButton onRetry={handleRetry} isLoading={isLoading} />
                </div>
              )}

              {isLoading && !isStreaming && <LoadingSpinner />}

              <div ref={messagesEndRef} />
            </div>

            <div className={styles.controls}>
              {messages.length > 1 && (
                <RegenerateButton onRegenerate={handleRegenerate} isLoading={isLoading} />
              )}
            </div>

            <form onSubmit={handleSubmit} className={styles.inputForm}>
              <div className={styles.inputContainer}>
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about Zeropoint Protocol... (⌘+Enter to send)"
                  disabled={isLoading}
                  className={styles.input}
                  rows={3}
                  aria-label="Enter your message"
                />
                <button 
                  type="submit" 
                  disabled={!inputValue.trim() || isLoading}
                  className={styles.sendButton}
                  aria-label="Send message"
                  title="Send message (⌘+Enter)"
                >
                  {isLoading ? '⏳' : '📤'}
                </button>
              </div>
            </form>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.infoPanel}>
              <h3>💡 Tips</h3>
              <ul>
                <li>Ask about Zeropoint Protocol features</li>
                <li>Request code examples</li>
                <li>Get help with implementation</li>
                <li>Explore AI capabilities</li>
                <li>Use ⌘+Enter to send quickly</li>
              </ul>
            </div>

            <div className={styles.statsPanel}>
              <h3>📊 Session Stats</h3>
              <div className={styles.stat}>
                <label>Messages:</label>
                <span>{messages.length}</span>
              </div>
              <div className={styles.stat}>
                <label>User Messages:</label>
                <span>{messages.filter(m => m.sender === 'user').length}</span>
              </div>
              <div className={styles.stat}>
                <label>AI Responses:</label>
                <span>{messages.filter(m => m.sender === 'assistant').length}</span>
              </div>
              <div className={styles.stat}>
                <label>Session ID:</label>
                <span className={styles.sessionId}>{sessionId}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
} 