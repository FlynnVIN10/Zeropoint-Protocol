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
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/rag/performance');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    }
  };

  const fetchHistoricalData = async () => {
    // Mock historical data for demonstration
    const mockData: PerformanceData[] = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000).toLocaleTimeString(),
      responseTime: Math.random() * 100 + 100,
      throughput: Math.random() * 50 + 100,
      errorRate: Math.random() * 2,
      cpuUsage: Math.random() * 30 + 40,
      memoryUsage: Math.random() * 20 + 60
    }));
    setHistoricalData(mockData);
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
    if (accuracy >= 90) return 'success';
    if (accuracy >= 80) return 'warning';
    return 'error';
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / 24);
    const hours = Math.floor(uptime % 24);
    const minutes = Math.floor((uptime % 1) * 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatThroughput = (throughput: number) => {
    if (throughput >= 1000) return `${(throughput / 1000).toFixed(1)}k QPS`;
    return `${Math.round(throughput)} QPS`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Performance Metrics
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          Refresh
        </Button>
      </Box>

      {/* Key Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Speed color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {metrics.averageResponseTime}ms
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Response Time
              </Typography>
              <Chip
                label={metrics.averageResponseTime < 200 ? 'Target Met' : 'Above Target'}
                color={getResponseTimeColor(metrics.averageResponseTime) as any}
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="secondary">
                {metrics.relevanceAccuracy}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Relevance Accuracy
              </Typography>
              <Chip
                label={metrics.relevanceAccuracy >= 90 ? 'Excellent' : 'Good'}
                color={getAccuracyColor(metrics.relevanceAccuracy) as any}
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success">
                {metrics.uptime}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                System Uptime
              </Typography>
              <Chip
                label="High Availability"
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assessment color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info">
                {formatThroughput(metrics.averageThroughput)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Throughput
              </Typography>
              <Chip
                label="Optimal Performance"
                color="info"
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Health and Performance Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Response Time Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Health
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Status</Typography>
                  <Chip
                    label={metrics.systemHealth.status}
                    color={getStatusColor(metrics.systemHealth.status) as any}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {metrics.systemHealth.message}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Uptime: {formatUptime(metrics.systemHealth.uptime)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={metrics.systemHealth.uptime}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Active Connections: {metrics.systemHealth.activeConnections}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(metrics.systemHealth.activeConnections / 100) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Typography variant="caption" color="text.secondary">
                Last checked: {new Date(metrics.systemHealth.lastCheck).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Throughput and Error Rate */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Throughput Performance
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={historicalData.slice(-12)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="throughput" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Peak Throughput: {formatThroughput(metrics.peakThroughput)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Throughput: {formatThroughput(metrics.averageThroughput)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Error Rate & System Resources
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Error Rate: {metrics.errorRate.toFixed(2)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(metrics.errorRate * 50, 100)}
                  color={metrics.errorRate < 1 ? 'success' : metrics.errorRate < 2 ? 'warning' : 'error'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  CPU Usage: {Math.round(metrics.systemHealth.cpuUsage || 0)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={metrics.systemHealth.cpuUsage || 0}
                  color={metrics.systemHealth.cpuUsage < 70 ? 'success' : metrics.systemHealth.cpuUsage < 90 ? 'warning' : 'error'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Memory Usage: {Math.round(metrics.systemHealth.memoryUsage || 0)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={metrics.systemHealth.memoryUsage || 0}
                  color={metrics.systemHealth.memoryUsage < 70 ? 'success' : metrics.systemHealth.memoryUsage < 90 ? 'warning' : 'error'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Targets Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance Targets & Status
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Current</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Response Time</TableCell>
                  <TableCell>&lt;200ms</TableCell>
                  <TableCell>{metrics.averageResponseTime}ms</TableCell>
                  <TableCell>
                    <Chip
                      label={metrics.averageResponseTime < 200 ? 'Target Met' : 'Above Target'}
                      color={getResponseTimeColor(metrics.averageResponseTime) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TrendingUp color="success" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Relevance Accuracy</TableCell>
                  <TableCell>&gt;90%</TableCell>
                  <TableCell>{metrics.relevanceAccuracy}%</TableCell>
                  <TableCell>
                    <Chip
                      label={metrics.relevanceAccuracy >= 90 ? 'Target Met' : 'Below Target'}
                      color={getAccuracyColor(metrics.relevanceAccuracy) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TrendingUp color="success" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Uptime</TableCell>
                  <TableCell>&gt;99.9%</TableCell>
                  <TableCell>{metrics.uptime}%</TableCell>
                  <TableCell>
                    <Chip
                      label="Target Met"
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <CheckCircle color="success" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Error Rate</TableCell>
                  <TableCell>&lt;1%</TableCell>
                  <TableCell>{metrics.errorRate.toFixed(2)}%</TableCell>
                  <TableCell>
                    <Chip
                      label={metrics.errorRate < 1 ? 'Target Met' : 'Above Target'}
                      color={metrics.errorRate < 1 ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {metrics.errorRate < 1 ? <CheckCircle color="success" /> : <Warning color="warning" />}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Detailed Metrics Dialog */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Detailed Performance Metrics
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Detailed performance analysis and historical data will be displayed here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PerformanceMetrics;
