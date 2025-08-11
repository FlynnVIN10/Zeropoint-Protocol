import React from 'react';
import EnhancedLayout from '../components/EnhancedLayout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <EnhancedLayout
      title={`${siteConfig.title}`}
      description="Ethical Agentic AI Platform">
      <main>
        {/* Enhanced Hero Section with Corporate Visuals */}
        <div className="zeropoint-hero">
          <div className="container">
            <div className="fade-in">
              <h1 className="hero__title">{siteConfig.title}</h1>
              <p className="hero__subtitle">{siteConfig.tagline}</p>
              <div className="hero__buttons">
                <Link
                  className="button button--primary button--lg"
                  to="/docs/legal">
                  Get Started
                </Link>
                <Link
                  className="button button--secondary button--lg"
                  to="/docs/status">
                  View Status
                </Link>
                <Link
                  className="button button--tertiary button--lg"
                  to="/docs/api">
                  API Docs
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container">
          {/* Enhanced Welcome Section */}
          <div className="zeropoint-feature slide-up">
            <h2>Welcome to Zeropoint Protocol</h2>
            <p className="text-gradient">
              An ethical AI platform built on Zeroth Principle ethics: safety, transparency, and fairness.
              Experience the future of AI with our cutting-edge technology and unwavering commitment to ethical development.
            </p>
            <div className="corporate-grid-3 mt-5">
              <div className="corporate-card text-center">
                <h4 className="text-accent">🔒 Ethical Foundation</h4>
                <p>Built on principles of safety, transparency, and fairness</p>
              </div>
              <div className="corporate-card text-center">
                <h4 className="text-accent">🚀 Advanced Technology</h4>
                <p>State-of-the-art AI orchestration and consensus systems</p>
              </div>
              <div className="corporate-card text-center">
                <h4 className="text-accent">🌐 Enterprise Ready</h4>
                <p>Production-grade scalability and compliance frameworks</p>
              </div>
            </div>
          </div>
          
          {/* Enhanced Current Phase Section */}
          <div className="zeropoint-feature slide-up">
            <h3>Current Phase: Phase 14</h3>
            <p>
              Multi-LLM orchestration and advanced AI capabilities with synthetic agents, mission planning, 
              and enhanced RAG interface capabilities.
            </p>
            <div className="zeropoint-status success">
              <strong>Status:</strong> Active Development - Multi-LLM orchestration system in progress
            </div>
            <div className="corporate-grid-2 mt-5">
              <div className="corporate-card">
                <h5 className="text-accent">🎯 Current Focus</h5>
                <p>Multi-LLM orchestration system with synthetic agents</p>
              </div>
              <div className="corporate-card">
                <h5 className="text-accent">📊 Progress</h5>
                <p>Core infrastructure complete, agent training in progress</p>
              </div>
            </div>
          </div>

          {/* Enhanced Overview Section */}
          <div className="zeropoint-feature slide-up">
            <h2>Platform Overview</h2>
            <p>
              The Zeropoint Protocol is a comprehensive ethical AI platform that has evolved through multiple phases, 
              each building upon the previous to create a robust, scalable, and ethical AI ecosystem.
            </p>
            <p>
              Our platform combines advanced AI capabilities with blockchain technology, real-time visualization, 
              and comprehensive compliance frameworks to deliver enterprise-grade AI solutions.
            </p>
            <div className="corporate-grid-4 mt-5">
              <div className="corporate-card text-center">
                <h5 className="text-accent">🤖 AI Core</h5>
                <p>Advanced neural networks and consensus engines</p>
              </div>
              <div className="corporate-card text-center">
                <h5 className="text-accent">🔗 Blockchain</h5>
                <p>Soulchain integration with decentralized governance</p>
              </div>
              <div className="corporate-card text-center">
                <h5 className="text-accent">🎮 Visualization</h5>
                <p>Real-time 3D and WebXR capabilities</p>
              </div>
              <div className="corporate-card text-center">
                <h5 className="text-accent">📋 Compliance</h5>
                <p>GDPR, WCAG, and enterprise security standards</p>
              </div>
            </div>
          </div>

          {/* Enhanced Phases Section */}
          <div className="zeropoint-feature slide-up">
            <h2>Development Phases</h2>
            <p>
              Explore our development journey through the completed phases, each representing a significant milestone 
              in building the Zeropoint Protocol platform.
            </p>
            
            <div className="phases-grid">
              {/* Phase 9 */}
              <div className="phase-card fade-in">
                <h3>Phase 9: Advanced AI Integration</h3>
                <p><strong>Status:</strong> ✅ <strong>COMPLETED</strong></p>
                <p><strong>Date Range:</strong> August 2024 - January 2025</p>
                <p>
                  Established the foundation for advanced AI integration with Soulchain telemetry, 
                  consensus optimization, UE5 preparation, and licensing enforcement.
                </p>
                <div className="mt-4">
                  <Link to="/phases/09" className="button button--secondary">Learn More</Link>
                </div>
              </div>

              {/* Phase 10 */}
              <div className="phase-card fade-in">
                <h3>Phase 10: Production Scaling</h3>
                <p><strong>Status:</strong> ✅ <strong>COMPLETED</strong></p>
                <p><strong>Date Range:</strong> August 2024 - January 2025</p>
                <p>
                  Scaled the platform for production workloads with Redis caching, connection pooling, 
                  circuit breaker patterns, and comprehensive load testing.
                </p>
                <div className="mt-4">
                  <Link to="/phases/10" className="button button--secondary">Learn More</Link>
                </div>
              </div>

              {/* Phase 11 */}
              <div className="phase-card fade-in">
                <h3>Phase 11: UE5 Integration</h3>
                <p><strong>Status:</strong> ✅ <strong>COMPLETED</strong></p>
                <p><strong>Date Range:</strong> August 2024 - January 2025</p>
                <p>
                  Integrated Unreal Engine 5 with comprehensive bridge interface, performance optimization, 
                  WebSocket deployment, and real-time visualization capabilities.
                </p>
                <div className="mt-4">
                  <Link to="/phases/11" className="button button--secondary">Learn More</Link>
                </div>
              </div>

              {/* Phase 12 */}
              <div className="phase-card fade-in">
                <h3>Phase 12: Symbiotic Intelligence</h3>
                <p><strong>Status:</strong> ✅ <strong>COMPLETED</strong></p>
                <p><strong>Date Range:</strong> August 2024 - January 2025</p>
                <p>
                  Implemented symbiotic intelligence with real-time chat widget, WebXR integration, 
                  WCAG 2.1 AA compliance, and advanced telemetry systems.
                </p>
                <div className="mt-4">
                  <Link to="/phases/12" className="button button--secondary">Learn More</Link>
                </div>
              </div>

              {/* Phase 13 */}
              <div className="phase-card fade-in">
                <h3>Phase 13: Consensus Engine & Training</h3>
                <p><strong>Status:</strong> ✅ <strong>COMPLETED</strong></p>
                <p><strong>Date Range:</strong> January 2025 - August 2025</p>
                <p>
                  Dual-layer consensus engine with petal-based training, simulation environments, 
                  and comprehensive AI orchestration capabilities.
                </p>
                <div className="mt-4">
                  <Link to="/phases/13" className="button button--secondary">Learn More</Link>
                </div>
              </div>

              {/* Phase 14 */}
              <div className="phase-card current-phase fade-in">
                <h3>Phase 14: Multi-LLM Orchestration</h3>
                <p><strong>Status:</strong> 🚧 <strong>IN PROGRESS</strong></p>
                <p><strong>Date Range:</strong> August 2025 - Present</p>
                <p>
                  Advanced multi-LLM orchestration system with synthetic agents, mission planning, 
                  performance monitoring, and enhanced RAG interface capabilities.
                </p>
                <div className="mt-4">
                  <Link to="/docs/status" className="button button--primary">Current Status</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Key Features Section */}
          <div className="zeropoint-feature slide-up">
            <h2>Key Platform Features</h2>
            <div className="features-grid">
              <div className="feature-item fade-in">
                <h4>🤖 Multi-LLM Orchestration</h4>
                <p>Advanced AI orchestration with multiple language models for complex task execution</p>
              </div>
              <div className="feature-item fade-in">
                <h4>🔗 Blockchain Integration</h4>
                <p>Soulchain integration with consensus mechanisms and decentralized governance</p>
              </div>
              <div className="feature-item fade-in">
                <h4>🎮 UE5 Visualization</h4>
                <p>Real-time 3D visualization and WebXR integration capabilities</p>
              </div>
              <div className="feature-item fade-in">
                <h4>📊 Performance Monitoring</h4>
                <p>Comprehensive telemetry, metrics, and performance optimization</p>
              </div>
              <div className="feature-item fade-in">
                <h4>🔒 Ethical Compliance</h4>
                <p>Built-in ethical AI principles and regulatory compliance frameworks</p>
              </div>
              <div className="feature-item fade-in">
                <h4>🌐 Real-time Communication</h4>
                <p>SSE streaming, WebSocket integration, and live collaboration tools</p>
              </div>
            </div>
          </div>

          {/* New Corporate Metrics Section */}
          <div className="zeropoint-feature slide-up">
            <h2>Platform Metrics</h2>
            <div className="corporate-grid-4">
              <div className="corporate-card text-center">
                <h3 className="text-accent">99.9%</h3>
                <p className="text-muted">Uptime</p>
              </div>
              <div className="corporate-card text-center">
                <h3 className="text-accent">50ms</h3>
                <p className="text-muted">Avg Response Time</p>
              </div>
              <div className="corporate-card text-center">
                <h3 className="text-accent">1M+</h3>
                <p className="text-muted">API Calls/Day</p>
              </div>
              <div className="corporate-card text-center">
                <h3 className="text-accent">14</h3>
                <p className="text-muted">Development Phases</p>
              </div>
            </div>
          </div>

          {/* Enhanced Call to Action Section */}
          <div className="zeropoint-feature slide-up">
            <h2>Ready to Experience the Future?</h2>
            <p>
              Join us in building the next generation of ethical AI technology. 
              Explore our documentation, check our current status, or get involved in our development.
            </p>
            <div className="hero__buttons">
              <Link
                className="button button--primary button--lg"
                to="/docs">
                Explore Documentation
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="/docs/status">
                Platform Status
              </Link>
              <Link
                className="button button--tertiary button--lg"
                to="/docs/api">
                API Reference
              </Link>
            </div>
          </div>
        </div>
      </main>
    </EnhancedLayout>
  );
}
