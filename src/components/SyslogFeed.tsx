'use client';

import { useState, useEffect, useRef } from 'react';

interface LogEntry {
  type: string;
  message: string;
  timestamp: string;
  level: string;
  source?: string;
}

export default function SyslogFeed() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
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

        eventSourceRef.current = new EventSource('/api/syslog/feed');
        
        eventSourceRef.current.onopen = () => {
          setConnected(true);
          setError(null);
          reconnectAttempts = 0;
        };

        eventSourceRef.current.onmessage = (event) => {
          try {
            const logEntry: LogEntry = JSON.parse(event.data);
            setLogs(prev => {
              const newLogs = [...prev, logEntry];
              // Keep only last 100 logs to prevent memory issues
              return newLogs.slice(-100);
            });
          } catch (err) {
            console.error('Failed to parse log entry:', err);
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

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-zinc-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system': return '🖥️';
      case 'application': return '⚙️';
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

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.35)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="text-zinc-400 text-[0.75rem] tracking-wide uppercase flex items-center space-x-2">
          <span>📋</span>
          <span>Platform Syslog</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-zinc-500">
              {connected ? 'Live' : 'Disconnected'}
            </span>
          </div>
          <button
            onClick={clearLogs}
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
        {logs.length === 0 ? (
          <div className="text-zinc-500 text-center py-8">
            {connected ? 'Waiting for logs...' : 'Connecting to syslog feed...'}
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex items-start space-x-2 py-1 hover:bg-zinc-800/30 rounded px-1">
              <span className="text-zinc-600 shrink-0">
                {getTypeIcon(log.type)}
              </span>
              <span className="text-zinc-500 shrink-0">
                {formatTimestamp(log.timestamp)}
              </span>
              <span className={`shrink-0 ${getLevelColor(log.level)}`}>
                [{log.level.toUpperCase()}]
              </span>
              <span className="text-zinc-300 flex-1 break-words">
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      <div className="mt-2 pt-2 border-t border-zinc-800 text-xs text-zinc-500">
        Showing {logs.length} entries • Filtered for platform relevance
      </div>
    </div>
  );
}
