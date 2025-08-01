import React from 'react';
import Layout from '@theme/Layout';

export default function Technology() {
  return (
    <Layout
      title="Technology - Zeropoint Protocol"
      description="Advanced multi-agent collaboration with ethical AI principles">
      <main style={{padding: '4rem 0', background: '#1A1A1A', minHeight: '80vh'}}>
        <div className="container">
          <h1 style={{color: '#00C4FF', fontSize: '3rem', marginBottom: '2rem', textAlign: 'center'}}>Technology Stack</h1>
          <p style={{color: '#F5F5F0', fontSize: '1.2rem', marginBottom: '3rem', textAlign: 'center'}}>
            Cutting-edge AI architecture with ethical governance and decentralized consensus
          </p>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem'}}>
            <div style={{background: 'rgba(26, 26, 26, 0.8)', padding: '2rem', border: '1px solid rgba(0, 196, 255, 0.2)'}}>
              <h3 style={{color: '#00C4FF', marginBottom: '0.5rem'}}>Backend Framework</h3>
              <h4 style={{color: '#BF00FF', marginBottom: '1rem'}}>NestJS + TypeScript</h4>
              <p style={{color: '#F5F5F0', marginBottom: '1.5rem'}}>Modular API gateway with dependency injection, comprehensive validation, and enterprise-grade architecture</p>
              <ul style={{color: '#F5F5F0', paddingLeft: '1.5rem'}}>
                <li>RESTful API with OpenAPI documentation</li>
                <li>JWT authentication with role-based access</li>
                <li>Rate limiting and security middleware</li>
                <li>Automated key rotation system</li>
              </ul>
            </div>
            
            <div style={{background: 'rgba(26, 26, 26, 0.8)', padding: '2rem', border: '1px solid rgba(0, 196, 255, 0.2)'}}>
              <h3 style={{color: '#00C4FF', marginBottom: '0.5rem'}}>Database Layer</h3>
              <h4 style={{color: '#BF00FF', marginBottom: '1rem'}}>PostgreSQL + TypeORM</h4>
              <p style={{color: '#F5F5F0', marginBottom: '1.5rem'}}>Enterprise-grade database with zero-downtime migration and comprehensive backup strategies</p>
              <ul style={{color: '#F5F5F0', paddingLeft: '1.5rem'}}>
                <li>Zero-downtime migration from SQLite</li>
                <li>Automated migration scripts</li>
                <li>Performance optimization and indexing</li>
                <li>Comprehensive backup and recovery</li>
              </ul>
            </div>
            
            <div style={{background: 'rgba(26, 26, 26, 0.8)', padding: '2rem', border: '1px solid rgba(0, 196, 255, 0.2)'}}>
              <h3 style={{color: '#00C4FF', marginBottom: '0.5rem'}}>AI Integration</h3>
              <h4 style={{color: '#BF00FF', marginBottom: '1rem'}}>Python + Petals + Stable Diffusion</h4>
              <p style={{color: '#F5F5F0', marginBottom: '1.5rem'}}>Distributed AI processing with ethical validation and multi-agent collaboration</p>
              <ul style={{color: '#F5F5F0', paddingLeft: '1.5rem'}}>
                <li>Distributed text generation with BLOOM</li>
                <li>Image generation with Stable Diffusion</li>
                <li>Multi-agent communication protocols</li>
                <li>Zeroth-gate ethical validation</li>
              </ul>
            </div>
            
            <div style={{background: 'rgba(26, 26, 26, 0.8)', padding: '2rem', border: '1px solid rgba(0, 196, 255, 0.2)'}}>
              <h3 style={{color: '#00C4FF', marginBottom: '0.5rem'}}>Decentralized Storage</h3>
              <h4 style={{color: '#BF00FF', marginBottom: '1rem'}}>IPFS + Soulchain</h4>
              <p style={{color: '#F5F5F0', marginBottom: '1.5rem'}}>Immutable audit trail and decentralized content addressing</p>
              <ul style={{color: '#F5F5F0', paddingLeft: '1.5rem'}}>
                <li>Content-addressed storage system</li>
                <li>Immutable audit trail for compliance</li>
                <li>Decentralized governance mechanisms</li>
                <li>Consensus bridge operations</li>
              </ul>
            </div>
          </div>
          
          <div style={{background: 'rgba(0, 196, 255, 0.1)', border: '1px solid rgba(0, 196, 255, 0.3)', padding: '2rem', borderRadius: '10px'}}>
            <h2 style={{color: '#00C4FF', marginBottom: '1rem', textAlign: 'center'}}>Performance Metrics</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '2rem', color: '#00C4FF', marginBottom: '0.5rem'}}>36,474+</div>
                <p style={{color: '#F5F5F0'}}>Seconds uptime</p>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '2rem', color: '#00C4FF', marginBottom: '0.5rem'}}>100%</div>
                <p style={{color: '#F5F5F0'}}>Test coverage</p>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '2rem', color: '#00C4FF', marginBottom: '0.5rem'}}>&lt;30s</div>
                <p style={{color: '#F5F5F0'}}>Consensus timeout</p>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '2rem', color: '#00C4FF', marginBottom: '0.5rem'}}>8</div>
                <p style={{color: '#F5F5F0'}}>Phases completed</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}