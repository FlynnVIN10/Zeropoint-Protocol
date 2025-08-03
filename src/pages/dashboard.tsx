import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '@theme/Layout';
import styles from './dashboard.module.css';

// API Configuration
const API_BASE_URL = 'http://localhost:3000/v1';

// Types
interface AgentData {
  id: string;
  xp: number;
  level: string;
  trust: number;
  ethical: number;
  status: 'active' | 'idle';
  lastSeen: string;
}

interface SystemHealth {
  service: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  responseTime: number;
  lastCheck: string;
}

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  sender: string;
  type: 'user' | 'agent' | 'system';
  metadata?: {
    confidence?: number;
    tokens?: number;
    model?: string;
  };
}

interface TelemetryEvent {
  event: string;
  type: string;
  timestamp: number;
  userAgent: string;
  data?: any;
}

// Enhanced Components
const PauseAutoRefreshToggle: React.FC<{ isPaused: boolean; onToggle: () => void }> = ({ isPaused, onToggle }) => (
  <button 
    onClick={onToggle}
    className={styles.pauseToggle}
    aria-label={isPaused ? 'Resume auto-refresh' : 'Pause auto-refresh'}
    title={isPaused ? 'Resume real-time updates' : 'Pause real-time updates'}
  >
    {isPaused ? '▶️ Resume' : '⏸️ Pause'} Auto-Refresh
  </button>
);

const TypingIndicator: React.FC = () => (
  <div className={styles.typingIndicator} aria-label="Typing indicator">
    <span></span>
    <span></span>
    <span></span>
  </div>
);

const UptimeBadge: React.FC<{ uptime: number }> = ({ uptime }) => {
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  
  return (
    <div className={styles.uptimeBadge}>
      <span className={styles.uptimeLabel}>Uptime</span>
      <span className={styles.uptimeValue}>
        {hours}h {minutes}m {seconds}s
      </span>
    </div>
  );
};

const HealthTable: React.FC<{ health: SystemHealth[] }> = ({ health }) => (
  <div className={styles.healthTable}>
    <h3>System Health</h3>
    <table>
      <thead>
        <tr>
          <th>Service</th>
          <th>Status</th>
          <th>Response Time</th>
          <th>Uptime</th>
        </tr>
      </thead>
      <tbody>
        {health.map((item, index) => (
          <tr key={index} className={styles[item.status]}>
            <td>{item.service}</td>
            <td>
              <span className={styles.statusBadge}>{item.status}</span>
            </td>
            <td>{item.responseTime}ms</td>
            <td>
              <UptimeBadge uptime={item.uptime} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const AgentCardGrid: React.FC<{ agents: AgentData[] }> = ({ agents }) => (
  <div className={styles.agentGrid}>
    <h3>Agent Status</h3>
    <div className={styles.agentCards}>
      {agents.map((agent) => (
        <div key={agent.id} className={styles.agentCard}>
          <h4>{agent.id}</h4>
          <div className={styles.agentStats}>
            <div className={styles.stat}>
              <label>XP:</label>
              <span className={styles.xpValue}>{Math.max(0, agent.xp)}</span>
            </div>
            <div className={styles.stat}>
              <label>Level:</label>
              <span>{agent.level}</span>
            </div>
            <div className={styles.stat}>
              <label>Trust:</label>
              <span>{agent.trust}%</span>
            </div>
            <div className={styles.stat}>
              <label>Ethical:</label>
              <span>{agent.ethical}%</span>
            </div>
          </div>
          <div className={`${styles.statusIndicator} ${styles[agent.status]}`}>
            {agent.status}
          </div>
          <div className={styles.lastSeen}>
            Last seen: {new Date(agent.lastSeen).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StatusWheel: React.FC<{ agents: AgentData[] }> = ({ agents }) => {
  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const avgTrust = agents.reduce((sum, a) => sum + a.trust, 0) / totalAgents;
  const avgEthical = agents.reduce((sum, a) => sum + a.ethical, 0) / totalAgents;
  const avgXP = agents.reduce((sum, a) => sum + Math.max(0, a.xp), 0) / totalAgents;

  return (
    <div className={styles.statusWheel}>
      <h3>System Overview</h3>
      <div className={styles.wheelContainer}>
        <div className={styles.wheel}>
          <div className={styles.segment} title={`${activeAgents} out of ${totalAgents} agents are active`}>
            <div className={styles.segmentLabel}>Active Agents</div>
            <div className={styles.segmentValue}>{activeAgents}/{totalAgents}</div>
            <div className={styles.segmentGauge}>
              <div 
                className={styles.gaugeFill} 
                style={{ width: `${(activeAgents / totalAgents) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className={styles.segment} title={`Average trust score: ${avgTrust.toFixed(1)}%`}>
            <div className={styles.segmentLabel}>Avg Trust</div>
            <div className={styles.segmentValue}>{avgTrust.toFixed(1)}%</div>
            <div className={styles.segmentGauge}>
              <div 
                className={styles.gaugeFill} 
                style={{ width: `${avgTrust}%` }}
              ></div>
            </div>
          </div>
          <div className={styles.segment} title={`Average ethical score: ${avgEthical.toFixed(1)}%`}>
            <div className={styles.segmentLabel}>Avg Ethical</div>
            <div className={styles.segmentValue}>{avgEthical.toFixed(1)}%</div>
            <div className={styles.segmentGauge}>
              <div 
                className={styles.gaugeFill} 
                style={{ width: `${avgEthical}%` }}
              ></div>
            </div>
          </div>
          <div className={styles.segment} title={`Average XP: ${avgXP.toFixed(0)}`}>
            <div className={styles.segmentLabel}>Avg XP</div>
            <div className={styles.segmentValue}>{avgXP.toFixed(0)}</div>
            <div className={styles.segmentGauge}>
              <div 
                className={styles.gaugeFill} 
                style={{ width: `${Math.min((avgXP / 200) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatWindow: React.FC<{ messages: ChatMessage[]; isTyping: boolean }> = ({ messages, isTyping }) => {
  const chatRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const handleScroll = useCallback(() => {
    if (chatRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setAutoScroll(isAtBottom);
    }
  }, []);

  useEffect(() => {
    const chatElement = chatRef.current;
    if (chatElement) {
      chatElement.addEventListener('scroll', handleScroll);
      return () => chatElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    if (autoScroll && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  return (
    <div className={styles.chatWindow}>
      <h3>Live Chat</h3>
      <div ref={chatRef} className={styles.chatMessages}>
        {messages.map((message) => (
          <div key={message.id} className={`${styles.message} ${styles[message.type]}`}>
            <div className={styles.messageHeader}>
              <span className={styles.sender}>{message.sender}</span>
              <span className={styles.timestamp}>{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className={styles.messageContent}>{message.content}</div>
            {message.metadata && (
              <div className={styles.messageMetadata}>
                {message.metadata.confidence && (
                  <span>Confidence: {message.metadata.confidence.toFixed(2)}%</span>
                )}
                {message.metadata.tokens && (
                  <span>Tokens: {message.metadata.tokens}</span>
                )}
                {message.metadata.model && (
                  <span>Model: {message.metadata.model}</span>
                )}
              </div>
            )}
          </div>
        ))}
        {isTyping && <TypingIndicator />}
      </div>
    </div>
  );
};

const JsonViewer: React.FC<{ data: any; isVisible: boolean; onToggle: () => void }> = ({ data, isVisible, onToggle }) => (
  <div className={styles.jsonViewer}>
    <button onClick={onToggle} className={styles.jsonToggle}>
      {isVisible ? '▼' : '▶'} Debug JSON
    </button>
    {isVisible && (
      <pre className={styles.jsonContent}>
        {JSON.stringify(data, null, 2)}
      </pre>
    )}
  </div>
);

// Main Dashboard Component
export default function Dashboard(): JSX.Element {
  const [isPaused, setIsPaused] = useState(false);
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [health, setHealth] = useState<SystemHealth[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Enhanced telemetry logging
  const logTelemetry = useCallback(async (event: string, type: string, data?: any) => {
    const telemetryEvent: TelemetryEvent = {
      event: 'ux_interaction',
      type,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      data
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
  }, []);

  // Save scroll position to localStorage with enhanced persistence
  useEffect(() => {
    const savedPosition = localStorage.getItem('dashboardScrollPosition');
    if (savedPosition) {
      setScrollPosition(parseInt(savedPosition));
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition));
      }, 100);
    }

    const handleScroll = () => {
      const currentPosition = window.scrollY;
      localStorage.setItem('dashboardScrollPosition', currentPosition.toString());
      setScrollPosition(currentPosition);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Enhanced SSE Connections with error handling and reconnection
  useEffect(() => {
    if (isPaused) return;

    let dashboardStream: EventSource | null = null;
    let chatStream: EventSource | null = null;
    let agentStream: EventSource | null = null;

    const connectStreams = () => {
      // Dashboard stream
      dashboardStream = new EventSource(`${API_BASE_URL}/dashboard/stream`);
      dashboardStream.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'health') {
            setHealth(data.health);
            setLastUpdate(new Date());
          }
        } catch (error) {
          console.error('Error parsing dashboard stream:', error);
        }
      };
      dashboardStream.onerror = (error) => {
        console.error('Dashboard stream error:', error);
        setTimeout(connectStreams, 5000); // Reconnect after 5 seconds
      };

      // Chat stream
      chatStream = new EventSource(`${API_BASE_URL}/chat/stream`);
      chatStream.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'message') {
            setMessages(prev => [...prev, data.message]);
            logTelemetry('chat_message', 'received', { messageId: data.message.id });
          } else if (data.type === 'typing') {
            setIsTyping(data.isTyping);
          }
        } catch (error) {
          console.error('Error parsing chat stream:', error);
        }
      };
      chatStream.onerror = (error) => {
        console.error('Chat stream error:', error);
        setTimeout(connectStreams, 5000);
      };

      // Agent XP stream
      agentStream = new EventSource(`${API_BASE_URL}/agents/xp`);
      agentStream.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setAgents(data.agents);
          setLastUpdate(new Date());
        } catch (error) {
          console.error('Error parsing agent stream:', error);
        }
      };
      agentStream.onerror = (error) => {
        console.error('Agent stream error:', error);
        setTimeout(connectStreams, 5000);
      };
    };

    connectStreams();

    // Log dashboard view
    logTelemetry('dashboard_view', 'page_load');

    return () => {
      dashboardStream?.close();
      chatStream?.close();
      agentStream?.close();
    };
  }, [isPaused, logTelemetry]);

  // Handle pause toggle with telemetry
  const handlePauseToggle = useCallback(() => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    logTelemetry('refresh_toggle', newPausedState ? 'paused' : 'resumed');
  }, [isPaused, logTelemetry]);

  // Mock data for development with enhanced realism
  useEffect(() => {
    if (agents.length === 0) {
      setAgents([
        { 
          id: 'agent-alpha', 
          xp: 150, 
          level: 'Initiate', 
          trust: 85, 
          ethical: 92, 
          status: 'active',
          lastSeen: new Date().toISOString()
        },
        { 
          id: 'agent-beta', 
          xp: 120, 
          level: 'Initiate', 
          trust: 78, 
          ethical: 88, 
          status: 'active',
          lastSeen: new Date().toISOString()
        },
        { 
          id: 'agent-gamma', 
          xp: 90, 
          level: 'Initiate', 
          trust: 82, 
          ethical: 85, 
          status: 'idle',
          lastSeen: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
        }
      ]);
    }

    if (health.length === 0) {
      setHealth([
        { 
          service: 'API Gateway', 
          status: 'healthy', 
          uptime: 305, 
          responseTime: 45,
          lastCheck: new Date().toISOString()
        },
        { 
          service: 'Database', 
          status: 'healthy', 
          uptime: 305, 
          responseTime: 12,
          lastCheck: new Date().toISOString()
        },
        { 
          service: 'IPFS', 
          status: 'healthy', 
          uptime: 305, 
          responseTime: 89,
          lastCheck: new Date().toISOString()
        },
        { 
          service: 'Python Backend', 
          status: 'warning', 
          uptime: 180, 
          responseTime: 234,
          lastCheck: new Date().toISOString()
        }
      ]);
    }

    if (messages.length === 0) {
      setMessages([
        { 
          id: '1', 
          content: 'System initialized successfully', 
          timestamp: new Date().toISOString(), 
          sender: 'System', 
          type: 'system' 
        },
        { 
          id: '2', 
          content: 'Agent alpha is online and ready for tasks', 
          timestamp: new Date().toISOString(), 
          sender: 'agent-alpha', 
          type: 'agent',
          metadata: { confidence: 0.95, tokens: 12, model: 'Zeropoint-LLM' }
        }
      ]);
    }
  }, []);

  return (
    <Layout title="Dashboard" description="Zeropoint Protocol Dashboard">
      <main className={styles.dashboard}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>Zeropoint Protocol Dashboard</h1>
            <div className={styles.lastUpdate}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
          <PauseAutoRefreshToggle isPaused={isPaused} onToggle={handlePauseToggle} />
        </div>

        <div className={styles.content}>
          <div className={styles.leftPanel}>
            <StatusWheel agents={agents} />
            <HealthTable health={health} />
            <JsonViewer 
              data={{ agents, health, messages, lastUpdate }} 
              isVisible={showJson} 
              onToggle={() => setShowJson(!showJson)} 
            />
          </div>

          <div className={styles.rightPanel}>
            <AgentCardGrid agents={agents} />
            <ChatWindow messages={messages} isTyping={isTyping} />
          </div>
        </div>
      </main>
    </Layout>
  );
} 