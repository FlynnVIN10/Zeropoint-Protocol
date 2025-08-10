import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Grid, 
  Chip, 
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  CheckCircle,
  Warning,
  Error,
  Info,
  Timeline,
  Assignment,
  Group,
  Security
} from '@mui/icons-material';

interface Mission {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'executing' | 'paused' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  consensus: {
    aiVotes: number;
    humanApproval: boolean;
    requiredVotes: number;
  };
  tasks: Task[];
  createdAt: string;
  estimatedDuration: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  dependencies: string[];
  assignedTo: string;
  estimatedTime: string;
}

const MissionPlanner: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    priority: 'medium' as const
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockMissions: Mission[] = [
      {
        id: '1',
        title: 'AI Safety Protocol Implementation',
        description: 'Implement comprehensive AI safety protocols across all Zeropoint systems',
        status: 'executing',
        priority: 'critical',
        progress: 65,
        consensus: {
          aiVotes: 8,
          humanApproval: true,
          requiredVotes: 10
        },
        tasks: [
          {
            id: '1-1',
            title: 'Ethical Alignment Framework',
            description: 'Deploy real-time ethical alignment monitoring',
            status: 'completed',
            dependencies: [],
            assignedTo: 'AI Safety Team',
            estimatedTime: '2 hours'
          },
          {
            id: '1-2',
            title: 'Human Oversight Integration',
            description: 'Integrate human oversight mechanisms',
            status: 'in-progress',
            dependencies: ['1-1'],
            assignedTo: 'Human Oversight Team',
            estimatedTime: '4 hours'
          }
        ],
        createdAt: '2025-01-08T10:00:00Z',
        estimatedDuration: '8 hours'
      },
      {
        id: '2',
        title: 'RAG System Optimization',
        description: 'Optimize RAG system for sub-200ms response times',
        status: 'planning',
        priority: 'high',
        progress: 25,
        consensus: {
          aiVotes: 6,
          humanApproval: false,
          requiredVotes: 8
        },
        tasks: [
          {
            id: '2-1',
            title: 'Performance Benchmarking',
            description: 'Establish baseline performance metrics',
            status: 'completed',
            dependencies: [],
            assignedTo: 'Performance Team',
            estimatedTime: '1 hour'
          },
          {
            id: '2-2',
            title: 'Algorithm Optimization',
            description: 'Optimize relevance scoring algorithms',
            status: 'pending',
            dependencies: ['2-1'],
            assignedTo: 'AI Research Team',
            estimatedTime: '6 hours'
          }
        ],
        createdAt: '2025-01-08T11:00:00Z',
        estimatedDuration: '12 hours'
      }
    ];
    setMissions(mockMissions);
  }, []);

  const handleCreateMission = () => {
    if (newMission.title && newMission.description) {
      const mission: Mission = {
        id: Date.now().toString(),
        title: newMission.title,
        description: newMission.description,
        status: 'planning',
        priority: newMission.priority,
        progress: 0,
        consensus: {
          aiVotes: 0,
          humanApproval: false,
          requiredVotes: 8
        },
        tasks: [],
        createdAt: new Date().toISOString(),
        estimatedDuration: 'TBD'
      };
      
      setMissions([...missions, mission]);
      setNewMission({ title: '', description: '', priority: 'medium' });
      setIsCreating(false);
    }
  };

  const handleMissionAction = (missionId: string, action: 'start' | 'pause' | 'stop') => {
    setMissions(missions.map(mission => {
      if (mission.id === missionId) {
        switch (action) {
          case 'start':
            return { ...mission, status: 'executing' };
          case 'pause':
            return { ...mission, status: 'paused' };
          case 'stop':
            return { ...mission, status: 'failed' };
          default:
            return mission;
        }
      }
      return mission;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'executing': return 'primary';
      case 'paused': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getConsensusStatus = (consensus: Mission['consensus']) => {
    if (consensus.humanApproval && consensus.aiVotes >= consensus.requiredVotes) {
      return { status: 'approved', color: 'success', icon: <CheckCircle /> };
    } else if (consensus.aiVotes >= consensus.requiredVotes) {
      return { status: 'ai-approved', color: 'warning', icon: <Warning /> };
    } else {
      return { status: 'pending', color: 'info', icon: <Info /> };
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mission Planner
      </Typography>
      
      {/* Mission Creation */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Create New Mission
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Mission Title"
                value={newMission.title}
                onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                placeholder="Enter mission title"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Description"
                value={newMission.description}
                onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                placeholder="Enter mission description"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                label="Priority"
                value={newMission.priority}
                onChange={(e) => setNewMission({ ...newMission, priority: e.target.value as any })}
                SelectProps={{ native: true }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                onClick={handleCreateMission}
                disabled={!newMission.title || !newMission.description}
                fullWidth
              >
                Create Mission
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Mission List */}
      <Grid container spacing={3}>
        {missions.map((mission) => (
          <Grid item xs={12} md={6} key={mission.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {mission.title}
                  </Typography>
                  <Box>
                    <Chip
                      label={mission.status}
                      color={getStatusColor(mission.status) as any}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={mission.priority}
                      color={getPriorityColor(mission.priority) as any}
                      size="small"
                    />
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {mission.description}
                </Typography>

                {/* Progress */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Progress</Typography>
                    <Typography variant="body2">{mission.progress}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={mission.progress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Consensus Status */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Security sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Consensus:
                    </Typography>
                    {(() => {
                      const consensus = getConsensusStatus(mission.consensus);
                      return (
                        <Chip
                          icon={consensus.icon}
                          label={consensus.status}
                          color={consensus.color as any}
                          size="small"
                        />
                      );
                    })()}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    AI Votes: {mission.consensus.aiVotes}/{mission.consensus.requiredVotes} | 
                    Human Approval: {mission.consensus.humanApproval ? 'Yes' : 'No'}
                  </Typography>
                </Box>

                {/* Mission Info */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(mission.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Duration: {mission.estimatedDuration}
                  </Typography>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {mission.status === 'planning' && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => handleMissionAction(mission.id, 'start')}
                    >
                      Start
                    </Button>
                  )}
                  {mission.status === 'executing' && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Pause />}
                        onClick={() => handleMissionAction(mission.id, 'pause')}
                      >
                        Pause
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Stop />}
                        onClick={() => handleMissionAction(mission.id, 'stop')}
                      >
                        Stop
                      </Button>
                    </>
                  )}
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => {
                      setSelectedMission(mission);
                      setIsDialogOpen(true);
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Mission Details Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedMission && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Assignment sx={{ mr: 1 }} />
                {selectedMission.title}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedMission.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Tasks
              </Typography>
              <List>
                {selectedMission.tasks.map((task) => (
                  <ListItem key={task.id}>
                    <ListItemIcon>
                      {task.status === 'completed' && <CheckCircle color="success" />}
                      {task.status === 'in-progress' && <Timeline color="primary" />}
                      {task.status === 'pending' && <Info color="info" />}
                      {task.status === 'failed' && <Error color="error" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={task.title}
                      secondary={
                        <Box>
                          <Typography variant="body2">{task.description}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Assigned to: {task.assignedTo} | Est. Time: {task.estimatedTime}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MissionPlanner;
