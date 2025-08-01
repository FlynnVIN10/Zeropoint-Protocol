# Phase 8: Consensus Visualizer Mockup

## Overview
The consensus visualizer provides real-time visualization of consensus operations using React Three Fiber with radial displays, neon hover effects, and Server-Sent Events (SSE) for live updates.

## Design Specifications

### Visual Components

#### 1. Radial Consensus Wheel
- **Layout**: Circular arrangement of participant nodes
- **Radius**: 300px base radius, scalable based on participant count
- **Node Size**: 20px diameter for each participant
- **Spacing**: Dynamic spacing based on participant count

#### 2. Participant Nodes
- **Active Voice**: Neon cyan glow (#00FFFF) with pulsing animation
- **Passive Stance**: Subtle gray glow (#666666) with fade effect
- **Hover State**: Bright white glow (#FFFFFF) with scale animation
- **Stake Indicator**: Ring around node showing stake amount (0-1000 ZEROPOINT)

#### 3. Consensus Flow Lines
- **Connection Lines**: Thin neon lines connecting active participants
- **Flow Direction**: Animated particles flowing from active to passive nodes
- **Intensity**: Line brightness based on consensus strength

### React Three Fiber Implementation

```jsx
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useState, useEffect } from 'react';

const ConsensusVisualizer = () => {
  const [participants, setParticipants] = useState([]);
  const [consensusData, setConsensusData] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource('/v1/consensus/visualization');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.success) {
        setConsensusData(data.data);
        setParticipants(data.data.radialData);
      }
    };

    return () => eventSource.close();
  }, []);

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} />
        
        <ConsensusWheel participants={participants} />
        <ConsensusMetrics data={consensusData} />
        
        <OrbitControls enableZoom={true} enablePan={true} />
      </Canvas>
    </div>
  );
};

const ConsensusWheel = ({ participants }) => {
  const radius = 3;
  
  return (
    <group>
      {participants.map((participant, index) => (
        <ParticipantNode
          key={participant.id}
          participant={participant}
          radius={radius}
          index={index}
          total={participants.length}
        />
      ))}
    </group>
  );
};

const ParticipantNode = ({ participant, radius, index, total }) => {
  const angle = (index / total) * 2 * Math.PI;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  
  const [hovered, setHovered] = useState(false);
  const [scale, setScale] = useState(1);
  
  useFrame(() => {
    if (hovered) {
      setScale(1.2);
    } else {
      setScale(1);
    }
  });

  const glowColor = participant.isActive ? '#00FFFF' : '#666666';
  const glowIntensity = participant.isActive ? 2 : 0.5;

  return (
    <group position={[x, 0, z]}>
      {/* Glow Effect */}
      <mesh scale={[scale * 1.5, scale * 1.5, scale * 1.5]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.3} />
      </mesh>
      
      {/* Main Node */}
      <mesh 
        scale={[scale, scale, scale]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial 
          color={participant.isActive ? '#00FFFF' : '#999999'}
          emissive={participant.isActive ? '#00FFFF' : '#333333'}
          emissiveIntensity={glowIntensity}
        />
      </mesh>
      
      {/* Stake Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.12, 32]} />
        <meshBasicMaterial 
          color="#FFD700" 
          transparent 
          opacity={participant.stake / 1000}
        />
      </mesh>
      
      {/* Participant Label */}
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.05}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {participant.id}
      </Text>
    </group>
  );
};

const ConsensusMetrics = ({ data }) => {
  if (!data) return null;
  
  return (
    <group position={[-2, 2, 0]}>
      <Text
        position={[0, 0, 0]}
        fontSize={0.1}
        color="white"
        anchorX="left"
        anchorY="top"
      >
        Consensus: {data.consensusRatio}
      </Text>
      
      <Text
        position={[0, -0.15, 0]}
        fontSize={0.08}
        color="cyan"
        anchorX="left"
        anchorY="top"
      >
        Active: {data.activeVoices}
      </Text>
      
      <Text
        position={[0, -0.25, 0]}
        fontSize={0.08}
        color="gray"
        anchorX="left"
        anchorY="top"
      >
        Passive: {data.passiveStances}
      </Text>
    </group>
  );
};
```

### CSS Styling

```css
.consensus-visualizer {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.consensus-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.consensus-status {
  display: flex;
  gap: 20px;
  align-items: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-dot.active {
  background: #00FFFF;
}

.status-dot.passive {
  background: #666666;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.consensus-canvas {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(0, 255, 255, 0.1);
}
```

### Animation Specifications

#### 1. Neon Glow Effects
- **Active Nodes**: Pulsing cyan glow with 2-second cycle
- **Hover Effects**: Bright white glow with 0.3-second transition
- **Stake Rings**: Golden glow with opacity based on stake amount

#### 2. Particle Flow
- **Direction**: From active to passive nodes
- **Speed**: 1 particle per second per connection
- **Color**: Cyan particles with fade-out effect
- **Trail**: Subtle glow trail following particle path

#### 3. Smooth Transitions
- **Node Movement**: 0.5-second ease-in-out transitions
- **Scale Changes**: 0.3-second ease-out transitions
- **Color Changes**: 0.2-second linear transitions

### Performance Optimizations

#### 1. Rendering
- **Frustum Culling**: Only render visible nodes
- **Level of Detail**: Reduce geometry for distant nodes
- **Instanced Rendering**: Use instanced meshes for similar objects

#### 2. Updates
- **Throttled Updates**: Limit to 60 FPS maximum
- **Batch Updates**: Group multiple state changes
- **Memory Management**: Clean up unused geometries

#### 3. Network
- **SSE Connection**: Maintain single persistent connection
- **Data Compression**: Minimize payload size
- **Connection Recovery**: Automatic reconnection on failure

### Integration Points

#### 1. API Endpoints
- **GET /v1/consensus/visualization**: SSE stream for real-time data
- **GET /v1/consensus/status**: Current consensus state
- **POST /v1/consensus/sync**: Trigger consensus synchronization

#### 2. Soulchain Integration
- **SOULCONS:VISUALIZED**: Log visualization generation
- **SOULCONS:SYNC**: Log consensus synchronization events
- **SOULCONS:INTENT**: Log intent validation events
- **SOULCONS:PASS**: Log consensus pass events

#### 3. Configuration
- **Update Interval**: 1000ms (configurable)
- **Max Participants**: 50 (configurable)
- **Neon Effects**: Enabled by default
- **SSE Enabled**: True by default

### Accessibility Features

#### 1. Keyboard Navigation
- **Tab Navigation**: Focusable participant nodes
- **Arrow Keys**: Navigate between participants
- **Enter/Space**: Select participant for details

#### 2. Screen Reader Support
- **ARIA Labels**: Descriptive labels for all elements
- **Live Regions**: Announce consensus changes
- **Status Updates**: Real-time status announcements

#### 3. Visual Accessibility
- **High Contrast**: Configurable color schemes
- **Motion Reduction**: Respect user preferences
- **Font Scaling**: Support for larger text sizes

### Future Enhancements

#### 1. Advanced Visualizations
- **3D Consensus Trees**: Hierarchical consensus structures
- **Temporal Graphs**: Historical consensus trends
- **Network Topology**: Participant relationship mapping

#### 2. Interactive Features
- **Participant Details**: Click to view detailed information
- **Consensus History**: Timeline of past decisions
- **Stake Management**: Visual stake allocation tools

#### 3. Analytics Integration
- **Performance Metrics**: Real-time performance monitoring
- **Consensus Analytics**: Statistical analysis of decisions
- **Predictive Models**: AI-powered consensus predictions 