import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper
} from '@mui/material';
import {
  Search,
  Send,
  Article,
  CheckCircle,
  Warning,
  Info,
  ExpandMore,
  Speed,
  TrendingUp,
  Security
} from '@mui/icons-material';

interface RAGResponse {
  answer: string;
  sources: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    relevance: number;
    source: string;
    lastUpdated: string;
  }>;
  confidence: number;
  responseTime: number;
  query: string;
}

interface RAGInterfaceProps {
  domain: 'legal' | 'manufacturing';
}

const RAGInterface: React.FC<RAGInterfaceProps> = ({ domain }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<RAGResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    averageResponseTime: 0,
    totalQueries: 0,
    relevanceAccuracy: 0,
    uptime: 0
  });

  useEffect(() => {
    fetchPerformanceMetrics();
  }, []);

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch('/api/rag/performance');
      if (response.ok) {
        const data = await response.json();
        setPerformanceMetrics(data.data);
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const endpoint = domain === 'legal' ? '/api/rag/legal/query' : '/api/rag/manufacturing/query';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setResponse(data.data);
        // Update performance metrics
        fetchPerformanceMetrics();
      } else {
        throw new Error(`Query failed: ${response.statusText}`);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getDomainInfo = () => {
    switch (domain) {
      case 'legal':
        return {
          title: 'Legal Domain Knowledge',
          description: 'Query legal documents, compliance frameworks, and regulatory information',
          color: 'primary',
          icon: <Security />
        };
      case 'manufacturing':
        return {
          title: 'Manufacturing Domain Knowledge',
          description: 'Access manufacturing processes, quality control, and optimization data',
          color: 'secondary',
          icon: <TrendingUp />
        };
      default:
        return {
          title: 'Domain Knowledge',
          description: 'Query domain-specific information',
          color: 'default',
          icon: <Info />
        };
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const formatResponseTime = (time: number) => {
    if (time < 100) return `${time}ms ⚡`;
    if (time < 200) return `${time}ms ✅`;
    return `${time}ms ⚠️`;
  };

  const domainInfo = getDomainInfo();

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {domainInfo.icon}
            <Typography variant="h5" sx={{ ml: 1 }}>
              {domainInfo.title}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {domainInfo.description}
          </Typography>

          {/* Performance Metrics */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Speed color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">{performanceMetrics.averageResponseTime}ms</Typography>
                  <Typography variant="caption">Avg Response Time</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <TrendingUp color="secondary" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">{performanceMetrics.relevanceAccuracy}%</Typography>
                  <Typography variant="caption">Relevance Accuracy</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Search color="info" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">{performanceMetrics.totalQueries}</Typography>
                  <Typography variant="caption">Total Queries</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <CheckCircle color="success" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">{performanceMetrics.uptime}%</Typography>
                  <Typography variant="caption">Uptime</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Query Interface */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Enter your query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Ask about ${domain} topics...`}
              multiline
              rows={2}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleQuery()}
            />
            <Button
              variant="contained"
              onClick={handleQuery}
              disabled={!query.trim() || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <Send />}
              sx={{ minWidth: 120 }}
            >
              {isLoading ? 'Querying...' : 'Query'}
            </Button>
          </Box>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Response Display */}
          {response && (
            <Card sx={{ backgroundColor: 'grey.50' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Response</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      icon={<Speed />}
                      label={formatResponseTime(response.responseTime)}
                      color={response.responseTime < 200 ? 'success' : 'warning'}
                      size="small"
                    />
                    <Chip
                      icon={<CheckCircle />}
                      label={`${getConfidenceLabel(response.confidence)} Confidence`}
                      color={getConfidenceColor(response.confidence) as any}
                      size="small"
                    />
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                  {response.answer}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Sources ({response.sources.length})
                </Typography>
                <List>
                  {response.sources.map((source, index) => (
                    <ListItem key={source.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Article color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {source.title}
                              <Chip
                                label={`${Math.round(source.relevance * 100)}% relevant`}
                                color={source.relevance > 0.8 ? 'success' : source.relevance > 0.6 ? 'warning' : 'error'}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={`Category: ${source.category} | Source: ${source.source}`}
                        />
                      </Box>
                      <Accordion sx={{ width: '100%' }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="body2">View Content</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2" color="text.secondary">
                            {source.content}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Last updated: {new Date(source.lastUpdated).toLocaleDateString()}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Query Examples */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Example Queries
            </Typography>
            <Grid container spacing={2}>
              {domain === 'legal' ? (
                <>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => setQuery('What are the AI safety compliance requirements?')}
                      sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    >
                      AI safety compliance requirements
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => setQuery('Explain the consensus mechanism legal framework')}
                      sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    >
                      Consensus mechanism framework
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => setQuery('Data privacy and security regulations')}
                      sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    >
                      Data privacy regulations
                    </Button>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => setQuery('How does AI optimize manufacturing processes?')}
                      sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    >
                      AI manufacturing optimization
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => setQuery('Quality control automation systems')}
                      sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    >
                      Quality control automation
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => setQuery('Supply chain intelligence platform features')}
                      sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    >
                      Supply chain intelligence
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RAGInterface;
