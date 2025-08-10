import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Ethical Agentic AI Platform">
      <main>
        <div className="zeropoint-hero">
          <div className="container">
            <h1 className="hero__title">{siteConfig.title}</h1>
            <p className="hero__subtitle">{siteConfig.tagline}</p>
            <div className="hero__buttons">
              <Link
                className="button button--primary button--lg"
                to="/docs/legal">
                Get Started
              </Link>
            </div>
          </div>
        </div>
        
        <div className="container">
          <div className="zeropoint-feature">
            <h2>Welcome to Zeropoint Protocol</h2>
            <p>
              An ethical AI platform built on Zeroth Principle ethics: safety, transparency, and fairness.
            </p>
          </div>
          
          <div className="zeropoint-feature">
            <h3>Current Phase: Phase 14</h3>
            <p>
              Multi-LLM orchestration and advanced AI capabilities.
            </p>
          </div>

          {/* Overview Section */}
          <div className="zeropoint-feature">
            <h2>Platform Overview</h2>
            <p>
              The Zeropoint Protocol is a comprehensive ethical AI platform that has evolved through multiple phases, 
              each building upon the previous to create a robust, scalable, and ethical AI ecosystem.
            </p>
            <p>
              Our platform combines advanced AI capabilities with blockchain technology, real-time visualization, 
              and comprehensive compliance frameworks to deliver enterprise-grade AI solutions.
            </p>
          </div>

          {/* Phases Section */}
          <div className="zeropoint-feature">
            <h2>Development Phases</h2>
            <p>
              Explore our development journey through the completed phases, each representing a significant milestone 
              in building the Zeropoint Protocol platform.
            </p>
            
            <div className="phases-grid">
              {/* Phase 9 */}
              <div className="phase-card">
                <h3>Phase 9: Advanced AI Integration</h3>
                <p><strong>Status:</strong> ✅ <strong>COMPLETED</strong></p>
                <p><strong>Date Range:</strong> August 2024 - January 2025</p>
                <p>
                  Established the foundation for advanced AI integration with Soulchain telemetry, 
                  consensus optimization, UE5 preparation, and licensing enforcement.
                </p>
                <Link to="/phases/09" className="button button--secondary">Learn More</Link>
              </div>

              {/* Phase 10 */}
              <div className="phase-card">
                <h3>Phase 10: Production Scaling</h3>
                <p><strong>Status:</strong> ✅ <strong>COMPLETED</strong></p>
                <p><strong>Date Range:</strong> August 2024 - January 2025</p>
                <p>
                  Scaled the platform for production workloads with Redis caching, connection pooling, 
                  circuit breaker patterns, and comprehensive load testing.
                </p>
                <Link to="/phases/10" className="button button--secondary">Learn More</Link>
              </div>

              {/* Phase 11 */}
              <div className="phase-card">
                <h3>Phase 11: UE5 Integration</h3>
                <p><strong>Status:</strong> ✅ <strong>COMPLETED</strong></p>
                <p><strong>Date Range:</strong> August 2024 - January 2025</p>
                <p>
                  Integrated Unreal Engine 5 with comprehensive bridge interface, performance optimization, 
                  WebSocket deployment, and real-time visualization capabilities.
                </p>
                <Link to="/phases/11" className="button button--secondary">Learn More</Link>
              </div>

              {/* Phase 12 */}
              <div className="phase-card">
                <h3>Phase 12: Symbiotic Intelligence</h3>
                <p><strong>Status:</strong> ✅ <strong>COMPLETED</strong></p>
                <p><strong>Date Range:</strong> August 2024 - January 2025</p>
                <p>
                  Implemented symbiotic intelligence with real-time chat widget, WebXR integration, 
                  WCAG 2.1 AA compliance, and advanced telemetry systems.
                </p>
                <Link to="/phases/12" className="button button--secondary">Learn More</Link>
              </div>

              {/* Phase 13 */}
              <div className="phase-card">
                <h3>Phase 13: Consensus Engine & Training</h3>
                <p><strong>Status:</strong> ✅ <strong>COMPLETED</strong></p>
                <p><strong>Date Range:</strong> January 2025 - August 2025</p>
                <p>
                  Dual-layer consensus engine with petal-based training, simulation environments, 
                  and comprehensive AI orchestration capabilities.
                </p>
                <Link to="/phases/13" className="button button--secondary">Learn More</Link>
              </div>

              {/* Phase 14 */}
              <div className="phase-card current-phase">
                <h3>Phase 14: Multi-LLM Orchestration</h3>
                <p><strong>Status:</strong> 🚧 <strong>IN PROGRESS</strong></p>
                <p><strong>Date Range:</strong> August 2025 - Present</p>
                <p>
                  Advanced multi-LLM orchestration system with synthetic agents, mission planning, 
                  performance monitoring, and enhanced RAG interface capabilities.
                </p>
                <Link to="/docs/status" className="button button--primary">Current Status</Link>
              </div>
            </div>
          </div>

          {/* Key Features Section */}
          <div className="zeropoint-feature">
            <h2>Key Platform Features</h2>
            <div className="features-grid">
              <div className="feature-item">
                <h4>🤖 Multi-LLM Orchestration</h4>
                <p>Advanced AI orchestration with multiple language models for complex task execution</p>
              </div>
              <div className="feature-item">
                <h4>🔗 Blockchain Integration</h4>
                <p>Soulchain integration with consensus mechanisms and decentralized governance</p>
              </div>
              <div className="feature-item">
                <h4>🎮 UE5 Visualization</h4>
                <p>Real-time 3D visualization and WebXR integration capabilities</p>
              </div>
              <div className="feature-item">
                <h4>📊 Performance Monitoring</h4>
                <p>Comprehensive telemetry, metrics, and performance optimization</p>
              </div>
              <div className="feature-item">
                <h4>🔒 Ethical Compliance</h4>
                <p>Built-in ethical AI principles and regulatory compliance frameworks</p>
              </div>
              <div className="feature-item">
                <h4>🌐 Real-time Communication</h4>
                <p>SSE streaming, WebSocket integration, and live collaboration tools</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
