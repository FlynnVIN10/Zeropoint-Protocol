# Phase 8: Consensus Visualizer Mockup

## Overview
The Consensus Visualizer is a real-time 3D visualization component that displays agent interactions and consensus formation in the Zeropoint Protocol. Built with React Three Fiber, it provides an immersive view of the consensus process with neon accents and dynamic animations.

## Component Architecture

### React Three Fiber Component Structure
```typescript
// ConsensusVisualizer.tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';

interface AgentNode {
  id: string;
  position: { x: number; y: number; z: number };
  status: 'active' | 'passive' | 'neutral';
  voice: 'proposal' | 'opposition' | 'abstain' | 'support';
  confidence: number;
  stake: number;
}

interface DAOState {
  position: { x: number; y: number; z: number };
  status: 'processing' | 'resolved' | 'conflicted';
  quorum: number;
  threshold: number;
  currentConsensus: number;
}

interface ConsensusVisualizerProps {
  agents: AgentNode[];
  daoState: DAOState;
  onAgentHover?: (agentId: string) => void;
  onAgentClick?: (agentId: string) => void;
}
```

## Visual Design Specifications

### Color Scheme
- **Neon Blue**: `#00ffff` - Active agent voices
- **Neon Green**: `#00ff00` - Support/proposal voices  
- **Neon Red**: `#ff0066` - Opposition voices
- **Neon Yellow**: `#ffff00` - Abstain voices
- **Neon Purple**: `#9900ff` - DAO state center
- **Neon White**: `#ffffff` - Connection lines
- **Dark Background**: `#0a0a0a` - Main background

### Agent Node Design
```typescript
const AgentNode: React.FC<{ agent: AgentNode; isHovered: boolean }> = ({ agent, isHovered }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Dynamic color based on voice type
  const getVoiceColor = (voice: string) => {
    switch (voice) {
      case 'proposal': return '#00ff00';
      case 'opposition': return '#ff0066';
      case 'abstain': return '#ffff00';
      case 'support': return '#00ffff';
      default: return '#ffffff';
    }
  };

  // Neon glow effect
  const glowIntensity = isHovered ? 2.0 : agent.status === 'active' ? 1.5 : 0.8;
  
  return (
    <group position={[agent.position.x, agent.position.y, agent.position.z]}>
      {/* Main sphere */}
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial 
          color={getVoiceColor(agent.voice)}
          emissive={getVoiceColor(agent.voice)}
          emissiveIntensity={glowIntensity}
          transparent
          opacity={0.9}
        />
      </Sphere>
      
      {/* Agent ID text */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {agent.id}
      </Text>
      
      {/* Confidence indicator */}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.15}
        color="#cccccc"
        anchorX="center"
        anchorY="middle"
      >
        {Math.round(agent.confidence * 100)}%
      </Text>
    </group>
  );
};
```

### DAO State Center Design
```typescript
const DAOStateCenter: React.FC<{ daoState: DAOState }> = ({ daoState }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Pulsing animation for processing state
  useFrame((state) => {
    if (meshRef.current && daoState.status === 'processing') {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return '#9900ff';
      case 'resolved': return '#00ff00';
      case 'conflicted': return '#ff0066';
      default: return '#ffffff';
    }
  };

  return (
    <group position={[daoState.position.x, daoState.position.y, daoState.position.z]}>
      {/* Central sphere */}
      <Sphere ref={meshRef} args={[0.8, 32, 32]}>
        <meshStandardMaterial 
          color={getStatusColor(daoState.status)}
          emissive={getStatusColor(daoState.status)}
          emissiveIntensity={1.5}
          transparent
          opacity={0.8}
        />
      </Sphere>
      
      {/* Consensus progress ring */}
      <Ring
        args={[1.2, 1.5, 64]}
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial 
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </Ring>
      
      {/* Status text */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {daoState.status.toUpperCase()}
      </Text>
      
      {/* Consensus metrics */}
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.2}
        color="#cccccc"
        anchorX="center"
        anchorY="middle"
      >
        {Math.round(daoState.currentConsensus * 100)}% / {Math.round(daoState.threshold * 100)}%
      </Text>
    </group>
  );
};
```

### Connection Lines
```typescript
const ConnectionLines: React.FC<{ agents: AgentNode[]; daoState: DAOState }> = ({ agents, daoState }) => {
  return (
    <group>
      {/* Agent to DAO state connections */}
      {agents.map((agent) => (
        <Line
          key={`connection-${agent.id}`}
          points={[
            [agent.position.x, agent.position.y, agent.position.z],
            [daoState.position.x, daoState.position.y, daoState.position.z]
          ]}
          color="#ffffff"
          lineWidth={agent.status === 'active' ? 2 : 1}
          transparent
          opacity={agent.status === 'active' ? 0.8 : 0.4}
        />
      ))}
      
      {/* Inter-agent connections for active voices */}
      {agents
        .filter(agent => agent.status === 'active')
        .map((agent1, i) => 
          agents
            .filter(agent => agent.status === 'active')
            .slice(i + 1)
            .map((agent2) => (
              <Line
                key={`agent-connection-${agent1.id}-${agent2.id}`}
                points={[
                  [agent1.position.x, agent1.position.y, agent1.position.z],
                  [agent2.position.x, agent2.position.y, agent2.position.z]
                ]}
                color="#00ffff"
                lineWidth={1}
                transparent
                opacity={0.6}
              />
            ))
        )}
    </group>
  );
};
```

## Animation Specifications

### Hover Effects
- **Neon Glow**: Agent nodes glow brighter when hovered
- **Scale Animation**: Nodes scale up by 20% on hover
- **Text Highlight**: Agent ID and confidence values become more prominent
- **Connection Highlight**: Connected lines become brighter and thicker

### Active Voice Animations
- **Pulsing**: Active agents pulse with a neon glow
- **Orbital Movement**: Agents orbit around the DAO state center
- **Voice Waves**: Ripple effects emanate from active agents
- **Color Transitions**: Smooth color transitions based on voice type

### Passive Stance Effects
- **Fade Effect**: Passive agents have reduced opacity (0.6)
- **Static Position**: No orbital movement
- **Dimmed Glow**: Reduced neon intensity
- **Muted Connections**: Thinner, less visible connection lines

## Real-time Data Integration

### Server-Sent Events (SSE)
```typescript
const useConsensusData = () => {
  const [consensusData, setConsensusData] = useState({
    agents: [],
    daoState: {
      position: { x: 0, y: 0, z: 0 },
      status: 'processing',
      quorum: 0.6,
      threshold: 0.5,
      currentConsensus: 0.4
    }
  });

  useEffect(() => {
    const eventSource = new EventSource('/v1/consensus/visualizer');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'consensus-visualization') {
        setConsensusData(data);
        
        // Log visualization event to soulchain
        fetch('/v1/consensus/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SOULCONS:VISUALIZED',
            data: {
              timestamp: data.timestamp,
              agentCount: data.agents.length,
              consensusLevel: data.consensus.current
            }
          })
        });
      }
    };

    return () => eventSource.close();
  }, []);

  return consensusData;
};
```

### Performance Optimization
- **Frame Rate**: Target 60 FPS for smooth animations
- **LOD (Level of Detail)**: Reduce polygon count for distant agents
- **Culling**: Only render agents within camera view
- **Instancing**: Use instanced meshes for similar agent types
- **Memory Management**: Dispose of unused geometries and materials

## Interaction Features

### Mouse Controls
- **Orbit**: Click and drag to rotate camera around scene
- **Zoom**: Mouse wheel to zoom in/out
- **Pan**: Right-click and drag to pan camera
- **Hover**: Mouse over agents to see details
- **Click**: Click agents to focus camera

### Keyboard Shortcuts
- **R**: Reset camera to default position
- **A**: Toggle agent labels
- **C**: Toggle connection lines
- **S**: Toggle statistics overlay
- **F**: Focus on DAO state center

### Touch Controls (Mobile)
- **Pinch**: Zoom in/out
- **Swipe**: Rotate camera
- **Tap**: Select agent
- **Double Tap**: Reset view

## Responsive Design

### Desktop (1920x1080+)
- Full 3D scene with all features enabled
- High-quality shadows and lighting
- Detailed agent information panels
- Multiple camera angles available

### Tablet (768x1024)
- Simplified 3D scene
- Reduced particle effects
- Condensed information display
- Touch-optimized controls

### Mobile (375x667)
- 2D top-down view option
- Minimal animations
- Essential information only
- Swipe-based navigation

## Accessibility Features

### Visual Accessibility
- **High Contrast Mode**: Enhanced color contrast
- **Color Blind Support**: Alternative color schemes
- **Motion Reduction**: Option to disable animations
- **Large Text**: Scalable text sizes

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all elements
- **Live Regions**: Real-time updates announced
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Indicators**: Clear focus states

## Integration Points

### Soulchain Logging
```typescript
// Log visualization events
const logVisualizationEvent = (event: string, data: any) => {
  fetch('/v1/consensus/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'SOULCONS:VISUALIZED',
      event,
      data,
      timestamp: new Date().toISOString()
    })
  });
};
```

### Performance Monitoring
```typescript
// Monitor frame rate and performance
const usePerformanceMonitor = () => {
  const [fps, setFps] = useState(60);
  const [memoryUsage, setMemoryUsage] = useState(0);

  useFrame((state) => {
    setFps(Math.round(1 / state.clock.getDelta()));
    
    if (performance.memory) {
      setMemoryUsage(performance.memory.usedJSHeapSize / 1024 / 1024);
    }
  });

  return { fps, memoryUsage };
};
```

## Future Enhancements

### Planned Features
- **VR Support**: Oculus Quest and HTC Vive compatibility
- **AR Overlay**: Mobile AR visualization
- **Voice Commands**: Speech-to-text for agent interaction
- **Haptic Feedback**: Controller vibration for events
- **Multi-User**: Collaborative visualization sessions

### Advanced Animations
- **Particle Systems**: Consensus formation particles
- **Sound Integration**: Audio feedback for events
- **Physics Simulation**: Realistic agent movement
- **Weather Effects**: Environmental atmosphere

## Implementation Timeline

### Phase 8.1 (Week 1)
- Basic 3D scene setup
- Agent node rendering
- DAO state center
- Basic animations

### Phase 8.2 (Week 2)
- Connection lines
- Hover effects
- Real-time data integration
- Performance optimization

### Phase 8.3 (Week 3)
- Advanced animations
- Interaction features
- Responsive design
- Accessibility features

### Phase 8.4 (Week 4)
- Testing and refinement
- Performance tuning
- Documentation
- Deployment

## Success Metrics

### Performance Targets
- **Frame Rate**: >55 FPS average
- **Load Time**: <3 seconds initial load
- **Memory Usage**: <100MB for 50 agents
- **Network Latency**: <100ms for updates

### User Experience Targets
- **Engagement**: >80% of users interact with visualization
- **Comprehension**: >90% understand consensus state
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile Performance**: >30 FPS on mobile devices

---

*"Visualizing consensus is the bridge between human intuition and machine precision." - Zeropoint Protocol Design Principle* 