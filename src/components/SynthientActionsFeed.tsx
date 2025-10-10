'use client';

import { useState, useEffect, useRef } from 'react';

interface ActionEntry {
  type: string;
  message: string;
  timestamp: string;
  level: string;
  source?: string;
  synthientId?: string;
  proposalId?: string;
  runId?: string;
}

export default function SynthientActionsFeed() {
  const [actions, setActions] = useState<ActionEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const actionsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;

    const connect = () => {
      try {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        // Connect to the synthient actions SSE feed
        eventSourceRef.current = new EventSource('/api/synthients/actions/feed');
        
        eventSourceRef.current.onopen = () => {
          setConnected(true);
          setError(null);
          reconnectAttempts = 0;
        };

        eventSourceRef.current.onmessage = (event) => {
          try {
            const actionEntry: ActionEntry = JSON.parse(event.data);
            setActions(prev => {
              const newActions = [...prev, actionEntry];
              // Keep only last 50 actions to prevent memory issues
              return newActions.slice(-50);
            });
          } catch (err) {
            console.error('Failed to parse action entry:', err);
          }
        };

        eventSourceRef.current.onerror = (event) => {
          setConnected(false);
          setError('Connection lost');
          
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s
            reconnectTimeout = setTimeout(connect, delay);
          } else {
            setError('Max reconnection attempts reached');
          }
        };

      } catch (err) {
        setError(`Connection error: ${err}`);
      }
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  // Auto-scroll to bottom when new actions arrive
  useEffect(() => {
    actionsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [actions]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      case 'info': return 'text-blue-400';
      default: return 'text-zinc-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'training': return '🧠';
      case 'consensus': return '🤝';
      case 'proposal': return '📋';
      case 'vote': return '🗳️';
      case 'system': return '⚙️';
      case 'error': return '❌';
      default: return '📝';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch {
      return timestamp;
    }
  };

  const clearActions = () => {
    setActions([]);
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.35)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="text-zinc-400 text-[0.75rem] tracking-wide uppercase flex items-center space-x-2">
          <span>🤖</span>
          <span>Synthient Actions</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-zinc-500">
              {connected ? 'Live' : 'Disconnected'}
            </span>
          </div>
          <button
            onClick={clearActions}
            className="text-xs px-2 py-1 border border-zinc-600 rounded hover:bg-zinc-700 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-2 p-2 bg-red-900/20 rounded">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1">
        {actions.length === 0 ? (
          <div className="text-zinc-500 text-center py-8">
            {connected ? 'Waiting for synthient actions...' : 'Connecting to actions feed...'}
          </div>
        ) : (
          actions.map((action, index) => (
            <div key={index} className="flex items-start space-x-2 py-1 hover:bg-zinc-800/30 rounded px-1">
              <span className="text-zinc-600 shrink-0">
                {getTypeIcon(action.type)}
              </span>
              <span className="text-zinc-500 shrink-0">
                {formatTimestamp(action.timestamp)}
              </span>
              <span className={`shrink-0 ${getLevelColor(action.level)}`}>
                [{action.level.toUpperCase()}]
              </span>
              <span className="text-zinc-300 flex-1 break-words">
                {action.message}
              </span>
            </div>
          ))
        )}
        <div ref={actionsEndRef} />
      </div>

      <div className="mt-2 pt-2 border-t border-zinc-800 text-xs text-zinc-500">
        Showing {actions.length} actions • Real-time synthient activity
      </div>
    </div>
  );
}
