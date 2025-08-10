import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Speed,
  TrendingUp,
  CheckCircle,
  Warning,
  Error,
  Info,
  Refresh,
  Timeline,
  Assessment,
  Memory,
  Storage,
  NetworkCheck,
  Security,
  Visibility,
  Download,
  Upload
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Enhanced custom styling for corporate dark mode and futuristic aesthetic
const darkThemeStyles = {
  // Card styles
  card: {
    background: 'linear-gradient(135deg, #0a0a0a, #111111)',
    border: '1px solid #2a2a2a',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0, 212, 255, 0.12)',
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 32px rgba(0, 212, 255, 0.16)',
      borderColor: '#00d4ff'
    }
  },
  
  // Button styles
  primaryButton: {
    background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
    color: '#000000',
    border: '2px solid #00d4ff',
    borderRadius: '12px',
    padding: '12px 24px',
    fontWeight: 700,
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 32px rgba(0, 212, 255, 0.25)',
      background: 'linear-gradient(135deg, #33ddff, #00b3e6)'
    }
  },
  
  secondaryButton: {
    background: 'transparent',
    color: '#00d4ff',
    border: '2px solid #00d4ff',
    borderRadius: '12px',
    padding: '12px 24px',
    fontWeight: 600,
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    '&:hover': {
      background: '#00d4ff',
      color: '#000000',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 32px rgba(0, 212, 255, 0.25)'
    }
  },
  
  tertiaryButton: {
    background: '#1a1a1a',
    color: '#d0d0d0',
    border: '2px solid #3a3a3a',
    borderRadius: '12px',
    padding: '12px 24px',
    fontWeight: 600,
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    '&:hover': {
      background: '#222222',
      color: '#ffffff',
      borderColor: '#00d4ff',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 16px rgba(0, 212, 255, 0.12)'
    }
  },
  
  // Chip styles
  chip: {
    background: 'linear-gradient(135deg, #111111, #1a1a1a)',
    color: '#ffffff',
    border: '1px solid #3a3a3a',
    borderRadius: '20px',
    fontWeight: 600,
    '&.MuiChip-colorSuccess': {
      background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
      color: '#000000',
      borderColor: '#00ff88',
    },
    '&.MuiChip-colorWarning': {
      background: 'linear-gradient(135deg, #ffaa00, #ff8800)',
      color: '#000000',
      borderColor: '#ffaa00',
    },
    '&.MuiChip-colorError': {
      background: 'linear-gradient(135deg, #ff3366, #ff0044)',
      color: '#ffffff',
      borderColor: '#ff3366',
    },
    '&.MuiChip-colorInfo': {
      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      color: '#ffffff',
      borderColor: '#6366f1',
    },
  },
  
  // Progress bar styles
  progressBar: {
    height: '8px',
    borderRadius: '4px',
    backgroundColor: '#1a1a1a',
    '& .MuiLinearProgress-bar': {
      borderRadius: '4px',
      background: 'linear-gradient(90deg, #00d4ff, #0099cc)',
    },
  },
  
  // Paper styles
  paper: {
    background: 'linear-gradient(135deg, #0a0a0a, #111111)',
    border: '1px solid #2a2a2a',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0, 212, 255, 0.12)',
  },
  
  // Table styles
  table: {
    '& .MuiTableHead-root .MuiTableCell-root': {
      background: 'linear-gradient(135deg, #111111, #1a1a1a)',
      color: '#00d4ff',
      fontWeight: 700,
      borderBottom: '2px solid #2a2a2a',
    },
    '& .MuiTableBody-root .MuiTableCell-root': {
      color: '#ffffff',
      borderBottom: '1px solid #2a2a2a',
    },
    '& .MuiTableRow-root:hover': {
      background: 'rgba(0, 212, 255, 0.05)',
    },
  },
  
  // Dialog styles
  dialog: {
    '& .MuiDialog-paper': {
      background: 'linear-gradient(135deg, #0a0a0a, #111111)',
      border: '1px solid #2a2a2a',
      borderRadius: '20px',
      boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)',
    },
  },
  
  // Chart container styles
  chartContainer: {
    background: 'linear-gradient(135deg, #0a0a0a, #111111)',
    border: '1px solid #2a2a2a',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 16px rgba(0, 212, 255, 0.12)',
  },
};

interface PerformanceData {
  timestamp: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  lastCheck: string;
  uptime: number;
  activeConnections: number;
}

interface PerformanceMetrics {
  averageResponseTime: number;
  totalQueries: number;
  relevanceAccuracy: number;
  uptime: number;
  peakThroughput: number;
  averageThroughput: number;
  errorRate: number;
  systemHealth: SystemHealth;
}

const PerformanceMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    averageResponseTime: 0,
    totalQueries: 0,
    relevanceAccuracy: 0,
    uptime: 0,
    peakThroughput: 0,
    averageThroughput: 0,
    errorRate: 0,
    systemHealth: {
      status: 'healthy',
      message: 'All systems operational',
      lastCheck: new Date().toISOString(),
      uptime: 99.9,
      activeConnections: 0
    }
  });
  const [historicalData, setHistoricalData] = useState<PerformanceData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchMetrics();
    fetchHistoricalData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchMetrics();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      // Simulate API call
      const mockMetrics: PerformanceMetrics = {
        averageResponseTime: Math.random() * 200 + 50,
        totalQueries: Math.floor(Math.random() * 10000) + 50000,
        relevanceAccuracy: Math.random() * 20 + 80,
        uptime: 99.9,
        peakThroughput: Math.random() * 1000 + 2000,
        averageThroughput: Math.random() * 500 + 1000,
        errorRate: Math.random() * 2,
        systemHealth: {
          status: Math.random() > 0.1 ? 'healthy' : 'warning',
          message: Math.random() > 0.1 ? 'All systems operational' : 'Minor performance degradation detected',
          lastCheck: new Date().toISOString(),
          uptime: 99.9,
          activeConnections: Math.floor(Math.random() * 100) + 50
        }
      };
      
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      // Generate mock historical data
      const mockData: PerformanceData[] = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        responseTime: Math.random() * 200 + 50,
        throughput: Math.random() * 1000 + 1000,
        errorRate: Math.random() * 2,
        cpuUsage: Math.random() * 30 + 40,
        memoryUsage: Math.random() * 20 + 60
      }));
      
      setHistoricalData(mockData);
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchMetrics(), fetchHistoricalData()]);
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getResponseTimeColor = (time: number) => {
    if (time < 100) return 'success';
    if (time < 200) return 'warning';
    return 'error';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy > 90) return 'success';
    if (accuracy > 80) return 'warning';
    return 'error';
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime);
    const hours = Math.floor((uptime - days) * 24);
    const minutes = Math.floor(((uptime - days) * 24 - hours) * 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatThroughput = (throughput: number) => {
    if (throughput >= 1000) return `${(throughput / 1000).toFixed(1)}k`;
    return Math.floor(throughput).toString();
  };

  return (
    <Box sx={{ p: 3, background: '#000000', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ 
          color: '#00d4ff', 
          fontWeight: 700,
          textShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
        }}>
          Performance Metrics
        </Typography>
        <Button
          variant="contained"
          onClick={handleRefresh}
          disabled={isRefreshing}
          sx={darkThemeStyles.primaryButton}
        >
          <Refresh sx={{ mr: 1, animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </Button>
      </Box>

      {/* System Health Overview */}
      <Card sx={{ ...darkThemeStyles.card, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#ffffff' }}>
              System Health
            </Typography>
            <Chip
              label={metrics.systemHealth.status}
              color={getStatusColor(metrics.systemHealth.status) as any}
              sx={darkThemeStyles.chip}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2 }}>
            {metrics.systemHealth.message}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" sx={{ color: '#808080' }}>Uptime</Typography>
              <Typography variant="h6" sx={{ color: '#00d4ff' }}>
                {metrics.systemHealth.uptime.toFixed(2)}%
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" sx={{ color: '#808080' }}>Active Connections</Typography>
              <Typography variant="h6" sx={{ color: '#00d4ff' }}>
                {metrics.systemHealth.activeConnections}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" sx={{ color: '#808080' }}>Last Check</Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                {new Date(metrics.systemHealth.lastCheck).toLocaleTimeString()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" sx={{ color: '#808080' }}>Status</Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                {metrics.systemHealth.status === 'healthy' ? '✅ Operational' : '⚠️ Attention Required'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={darkThemeStyles.card}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Speed sx={{ fontSize: 40, color: '#00d4ff', mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#ffffff', mb: 1 }}>
                {metrics.averageResponseTime.toFixed(0)}ms
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                Avg Response Time
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min((metrics.averageResponseTime / 300) * 100, 100)}
                sx={{ ...darkThemeStyles.progressBar, mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={darkThemeStyles.card}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: '#00ff88', mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#ffffff', mb: 1 }}>
                {formatThroughput(metrics.averageThroughput)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                Avg Throughput (req/s)
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(metrics.averageThroughput / 3000) * 100}
                sx={{ ...darkThemeStyles.progressBar, mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={darkThemeStyles.card}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: '#00ff88', mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#ffffff', mb: 1 }}>
                {metrics.relevanceAccuracy.toFixed(1)}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                Relevance Accuracy
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.relevanceAccuracy}
                sx={{ ...darkThemeStyles.progressBar, mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={darkThemeStyles.card}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assessment sx={{ fontSize: 40, color: '#ffaa00', mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#ffffff', mb: 1 }}>
                {metrics.totalQueries.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                Total Queries
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(metrics.totalQueries / 100000) * 100}
                sx={{ ...darkThemeStyles.progressBar, mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card sx={darkThemeStyles.card}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                Response Time & Throughput (24h)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#b0b0b0"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis stroke="#b0b0b0" />
                  <RechartsTooltip 
                    contentStyle={{
                      background: '#0a0a0a',
                      border: '1px solid #333333',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#00d4ff" 
                    strokeWidth={2}
                    dot={{ fill: '#00d4ff', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="throughput" 
                    stroke="#00ff88" 
                    strokeWidth={2}
                    dot={{ fill: '#00ff88', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={darkThemeStyles.card}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                System Resources
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>CPU Usage</Typography>
                  <Typography variant="body2" sx={{ color: '#00d4ff' }}>
                    {historicalData[historicalData.length - 1]?.cpuUsage.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={historicalData[historicalData.length - 1]?.cpuUsage || 0}
                  sx={darkThemeStyles.progressBar}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Memory Usage</Typography>
                  <Typography variant="body2" sx={{ color: '#00d4ff' }}>
                    {historicalData[historicalData.length - 1]?.memoryUsage.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={historicalData[historicalData.length - 1]?.memoryUsage || 0}
                  sx={darkThemeStyles.progressBar}
                />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Error Rate</Typography>
                  <Typography variant="body2" sx={{ color: '#ff3366' }}>
                    {metrics.errorRate.toFixed(2)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={metrics.errorRate}
                  sx={{
                    ...darkThemeStyles.progressBar,
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #ff3366, #ff6b8a)'
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Metrics Table */}
      <Card sx={darkThemeStyles.card}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#ffffff' }}>
              Detailed Performance Metrics
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setShowDetails(!showDetails)}
              sx={darkThemeStyles.secondaryButton}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </Box>
          
          {showDetails && (
            <TableContainer component={Paper} sx={darkThemeStyles.paper}>
              <Table sx={darkThemeStyles.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Average Response Time</TableCell>
                    <TableCell>{metrics.averageResponseTime.toFixed(1)}ms</TableCell>
                    <TableCell>
                      <Chip
                        label={getResponseTimeColor(metrics.averageResponseTime) === 'success' ? 'Good' : 
                               getResponseTimeColor(metrics.averageResponseTime) === 'warning' ? 'Fair' : 'Poor'}
                        color={getResponseTimeColor(metrics.averageResponseTime) as any}
                        size="small"
                        sx={darkThemeStyles.chip}
                      />
                    </TableCell>
                    <TableCell>
                      <TrendingUp sx={{ color: '#00ff88' }} />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Relevance Accuracy</TableCell>
                    <TableCell>{metrics.relevanceAccuracy.toFixed(1)}%</TableCell>
                    <TableCell>
                      <Chip
                        label={getAccuracyColor(metrics.relevanceAccuracy) === 'success' ? 'Excellent' : 
                               getAccuracyColor(metrics.relevanceAccuracy) === 'warning' ? 'Good' : 'Needs Improvement'}
                        color={getAccuracyColor(metrics.relevanceAccuracy) as any}
                        size="small"
                        sx={darkThemeStyles.chip}
                      />
                    </TableCell>
                    <TableCell>
                      <TrendingUp sx={{ color: '#00ff88' }} />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Peak Throughput</TableCell>
                    <TableCell>{formatThroughput(metrics.peakThroughput)} req/s</TableCell>
                    <TableCell>
                      <Chip
                        label="Peak"
                        color="primary"
                        size="small"
                        sx={darkThemeStyles.chip}
                      />
                    </TableCell>
                    <TableCell>
                      <Speed sx={{ color: '#00d4ff' }} />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* CSS Animation for refresh icon */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
};

export default PerformanceMetrics;
