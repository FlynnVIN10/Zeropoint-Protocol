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
  
  // Text field styles
  textField: {
    '& .MuiOutlinedInput-root': {
      color: '#ffffff',
      '& fieldset': {
        borderColor: '#2a2a2a',
        borderWidth: '2px',
      },
      '&:hover fieldset': {
        borderColor: '#00d4ff',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#00d4ff',
        borderWidth: '2px',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#a0a0a0',
      '&.Mui-focused': {
        color: '#00d4ff',
      },
    },
    '& .MuiInputBase-input': {
      fontSize: '16px',
      padding: '16px 20px',
    },
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
  
  // Dialog styles
  dialog: {
    '& .MuiDialog-paper': {
      background: 'linear-gradient(135deg, #0a0a0a, #111111)',
      border: '1px solid #2a2a2a',
      borderRadius: '20px',
      boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)',
    },
  },
  
  // Alert styles
  alert: {
    borderRadius: '12px',
    border: '1px solid #2a2a2a',
    '&.MuiAlert-standardSuccess': {
      background: 'rgba(0, 255, 136, 0.1)',
      borderColor: '#00ff88',
      color: '#00ff88',
    },
    '&.MuiAlert-standardWarning': {
      background: 'rgba(255, 170, 0, 0.1)',
      borderColor: '#ffaa00',
      color: '#ffaa00',
    },
    '&.MuiAlert-standardError': {
      background: 'rgba(255, 51, 102, 0.1)',
      borderColor: '#ff3366',
      color: '#ff3366',
    },
    '&.MuiAlert-standardInfo': {
      background: 'rgba(99, 102, 241, 0.1)',
      borderColor: '#6366f1',
      color: '#6366f1',
    },
  },
};

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
            title: 'Safety Boundary Implementation',
            description: 'Implement hard safety boundaries for AI operations',
            status: 'in-progress',
            dependencies: ['1-1'],
            assignedTo: 'AI Safety Team',
            estimatedTime: '4 hours'
          }
        ],
        createdAt: '2025-01-15T10:00:00Z',
        estimatedDuration: '8 hours'
      },
      {
        id: '2',
        title: 'Multi-LLM Orchestration Setup',
        description: 'Configure and deploy multi-LLM orchestration system',
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
            title: 'LLM Provider Integration',
            description: 'Integrate OpenAI, Anthropic, and other LLM providers',
            status: 'pending',
            dependencies: [],
            assignedTo: 'AI Engineering Team',
            estimatedTime: '6 hours'
          }
        ],
        createdAt: '2025-01-15T14:00:00Z',
        estimatedDuration: '12 hours'
      }
    ];
    
    setMissions(mockMissions);
  }, []);

  const handleCreateMission = () => {
    if (newMission.title.trim() && newMission.description.trim()) {
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
          requiredVotes: 5
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
        let newStatus = mission.status;
        switch (action) {
          case 'start':
            newStatus = 'executing';
            break;
          case 'pause':
            newStatus = 'paused';
            break;
          case 'stop':
            newStatus = 'planning';
            break;
        }
        return { ...mission, status: newStatus };
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
      case 'medium': return 'primary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getConsensusStatus = (consensus: Mission['consensus']) => {
    const approvalRate = (consensus.aiVotes / consensus.requiredVotes) * 100;
    if (consensus.humanApproval && approvalRate >= 80) return 'success';
    if (approvalRate >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3, background: '#000000', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ 
        color: '#00d4ff', 
        mb: 3, 
        textAlign: 'center',
        fontWeight: 700,
        textShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
      }}>
        Mission Planner
      </Typography>

      {/* Create Mission Section */}
      <Card sx={{ ...darkThemeStyles.card, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
            Create New Mission
          </Typography>
          
          {!isCreating ? (
            <Button 
              variant="contained" 
              onClick={() => setIsCreating(true)}
              sx={darkThemeStyles.primaryButton}
            >
              <Assignment sx={{ mr: 1 }} />
              New Mission
            </Button>
          ) : (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mission Title"
                    value={newMission.title}
                    onChange={(e) => setNewMission({...newMission, title: e.target.value})}
                    sx={darkThemeStyles.textField}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Priority"
                    value={newMission.priority}
                    onChange={(e) => setNewMission({...newMission, priority: e.target.value as any})}
                    sx={darkThemeStyles.textField}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </TextField>
                </Grid>
              </Grid>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newMission.description}
                onChange={(e) => setNewMission({...newMission, description: e.target.value})}
                sx={darkThemeStyles.textField}
              />
              
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={handleCreateMission}
                  sx={darkThemeStyles.primaryButton}
                >
                  Create Mission
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => setIsCreating(false)}
                  sx={darkThemeStyles.secondaryButton}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Missions Grid */}
      <Grid container spacing={3}>
        {missions.map((mission) => (
          <Grid item xs={12} md={6} key={mission.id}>
            <Card sx={darkThemeStyles.card}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#ffffff', flex: 1 }}>
                    {mission.title}
                  </Typography>
                  <Chip 
                    label={mission.status} 
                    color={getStatusColor(mission.status) as any}
                    sx={darkThemeStyles.chip}
                  />
                </Box>
                
                <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2 }}>
                  {mission.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip 
                    label={mission.priority} 
                    color={getPriorityColor(mission.priority) as any}
                    size="small"
                    sx={darkThemeStyles.chip}
                  />
                  <Chip 
                    label={`${mission.progress}%`} 
                    variant="outlined"
                    size="small"
                    sx={{ ...darkThemeStyles.chip, color: '#00d4ff' }}
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#808080', mb: 1 }}>
                    Progress
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={mission.progress} 
                    sx={darkThemeStyles.progressBar}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    size="small"
                    onClick={() => handleMissionAction(mission.id, 'start')}
                    disabled={mission.status === 'executing'}
                    sx={darkThemeStyles.secondaryButton}
                  >
                    <PlayArrow />
                  </Button>
                  <Button
                    size="small"
                    onClick={() => handleMissionAction(mission.id, 'pause')}
                    disabled={mission.status !== 'executing'}
                    sx={darkThemeStyles.secondaryButton}
                  >
                    <Pause />
                  </Button>
                  <Button
                    size="small"
                    onClick={() => handleMissionAction(mission.id, 'stop')}
                    sx={darkThemeStyles.secondaryButton}
                  >
                    <Stop />
                  </Button>
                </Box>
                
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSelectedMission(mission);
                    setIsDialogOpen(true);
                  }}
                  sx={darkThemeStyles.secondaryButton}
                >
                  View Details
                </Button>
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
        sx={darkThemeStyles.dialog}
      >
        {selectedMission && (
          <>
            <DialogTitle sx={{ color: '#00d4ff', borderBottom: '1px solid #333333' }}>
              {selectedMission.title}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ color: '#ffffff', mb: 3 }}>
                {selectedMission.description}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#00d4ff', mb: 2 }}>
                  Tasks
                </Typography>
                <List>
                  {selectedMission.tasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                      <ListItem>
                        <ListItemIcon>
                          {task.status === 'completed' ? (
                            <CheckCircle sx={{ color: '#00ff88' }} />
                          ) : task.status === 'in-progress' ? (
                            <Timeline sx={{ color: '#00d4ff' }} />
                          ) : (
                            <Assignment sx={{ color: '#b0b0b0' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={task.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                                {task.description}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#808080' }}>
                                Assigned to: {task.assignedTo} | Est. Time: {task.estimatedTime}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip 
                          label={task.status} 
                          color={getStatusColor(task.status) as any}
                          size="small"
                          sx={darkThemeStyles.chip}
                        />
                      </ListItem>
                      {index < selectedMission.tasks.length - 1 && (
                        <Divider sx={{ borderColor: '#333333' }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#00d4ff', mb: 2 }}>
                  Consensus Status
                </Typography>
                <Alert 
                  severity={getConsensusStatus(selectedMission.consensus) as any}
                  sx={darkThemeStyles.alert}
                >
                  AI Votes: {selectedMission.consensus.aiVotes}/{selectedMission.consensus.requiredVotes} | 
                  Human Approval: {selectedMission.consensus.humanApproval ? '✅' : '❌'}
                </Alert>
              </Box>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid #333333', p: 2 }}>
              <Button 
                onClick={() => setIsDialogOpen(false)}
                sx={darkThemeStyles.secondaryButton}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MissionPlanner;
