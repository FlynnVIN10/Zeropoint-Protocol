'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Users, Circle, Clock, Activity } from 'lucide-react';

interface PresenceUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: Date;
  activity?: string;
}

interface PresenceBarProps {
  users?: PresenceUser[];
  className?: string;
  showActivity?: boolean;
}

export function PresenceBar({ 
  users = [], 
  className = '', 
  showActivity = true 
}: PresenceBarProps) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Simulate real-time presence updates
  useEffect(() => {
    const mockUsers: PresenceUser[] = [
      {
        id: '1',
        name: 'Alice Chen',
        status: 'online',
        activity: 'Reviewing PR #1201',
        lastSeen: new Date()
      },
      {
        id: '2',
        name: 'Bob Rodriguez',
        status: 'away',
        activity: 'In meeting',
        lastSeen: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: '3',
        name: 'Carol Kim',
        status: 'busy',
        activity: 'Debugging SSE',
        lastSeen: new Date()
      },
      {
        id: '4',
        name: 'David Thompson',
        status: 'online',
        activity: 'Writing tests',
        lastSeen: new Date()
      },
      {
        id: '5',
        name: 'Eva Martinez',
        status: 'offline',
        lastSeen: new Date(Date.now() - 30 * 60 * 1000)
      }
    ];

    setOnlineUsers(mockUsers);

    // Simulate status changes
    const interval = setInterval(() => {
      setOnlineUsers(prev => prev.map(user => {
        if (Math.random() > 0.95) {
          const statuses: PresenceUser['status'][] = ['online', 'away', 'busy', 'offline'];
          return { ...user, status: statuses[Math.floor(Math.random() * statuses.length)] };
        }
        return user;
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: PresenceUser['status']) => {
    switch (status) {
      case 'online':
        return 'text-ok';
      case 'away':
        return 'text-warn';
      case 'busy':
        return 'text-red-400';
      case 'offline':
        return 'text-muted';
      default:
        return 'text-muted';
    }
  };

  const getStatusIcon = (status: PresenceUser['status']) => {
    switch (status) {
      case 'online':
        return <Circle className="w-2 h-2 fill-current" />;
      case 'away':
        return <Clock className="w-2 h-2" />;
      case 'busy':
        return <Activity className="w-2 h-2" />;
      case 'offline':
        return <Circle className="w-2 h-2" />;
      default:
        return <Circle className="w-2 h-2" />;
    }
  };

  const onlineCount = onlineUsers.filter(u => u.status === 'online').length;
  const totalCount = onlineUsers.length;

  return (
    <div className={`relative ${className}`}>
      {/* Compact View */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 px-3 py-2 bg-muted/50 border border-muted rounded-lg text-fg hover:border-accent transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Users className="w-4 h-4 text-accent" />
        <span className="text-sm font-medium">{onlineCount}/{totalCount}</span>
        <div className="flex -space-x-1">
          {onlineUsers.slice(0, 3).map((user) => (
            <div
              key={user.id}
              className={`w-5 h-5 rounded-full border-2 border-panel flex items-center justify-center ${getStatusColor(user.status)}`}
              title={`${user.name} (${user.status})`}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
              ) : (
                <span className="text-xs font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          ))}
          {onlineUsers.length > 3 && (
            <div className="w-5 h-5 rounded-full bg-muted border-2 border-panel flex items-center justify-center">
              <span className="text-xs text-muted">+{onlineUsers.length - 3}</span>
            </div>
          )}
        </div>
      </motion.button>

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-2 w-80 bg-panel border border-muted rounded-lg shadow-2xl z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-muted bg-muted/20">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-fg">Team Presence</h3>
                <span className="text-sm text-muted">{onlineCount} online</span>
              </div>
            </div>

            {/* User List */}
            <div className="max-h-64 overflow-y-auto">
              {onlineUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-3 p-3 hover:bg-muted/20 transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full border-2 border-panel flex items-center justify-center ${getStatusColor(user.status)}`}>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                      ) : (
                        <span className="text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-panel flex items-center justify-center ${getStatusColor(user.status)}`}>
                      {getStatusIcon(user.status)}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-fg truncate">{user.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(user.status)} bg-opacity-20`}>
                        {user.status}
                      </span>
                    </div>
                    {showActivity && user.activity && (
                      <p className="text-sm text-muted truncate">{user.activity}</p>
                    )}
                    {user.lastSeen && (
                      <p className="text-xs text-muted">
                        Last seen: {user.lastSeen.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-muted bg-muted/20">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Real-time updates</span>
                <span>Updated just now</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
