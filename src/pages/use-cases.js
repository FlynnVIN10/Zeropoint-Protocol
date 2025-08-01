import React from 'react';
import Layout from '@theme/Layout';

export default function UseCases() {
  return (
    <Layout
      title="Use Cases - Zeropoint Protocol"
      description="Value propositions and applications of ethical AI">
      <main style={{padding: '4rem 0', background: '#1A1A1A', minHeight: '80vh'}}>
        <div className="container">
          <h1 style={{color: '#00C4FF', fontSize: '3rem', marginBottom: '2rem'}}>Use Cases & Applications</h1>
          <p style={{color: '#F5F5F0', fontSize: '1.2rem', marginBottom: '3rem'}}>
            Discover how Zeropoint Protocol transforms AI applications with ethical governance and decentralized consensus
          </p>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '3rem'}}>
            <div style={{background: 'rgba(26, 26, 26, 0.8)', padding: '2rem', border: '1px solid rgba(0, 196, 255, 0.2)'}}>
              <h3 style={{color: '#00C4FF', marginBottom: '1rem'}}>Financial Services</h3>
              <p style={{color: '#F5F5F0', marginBottom: '1rem'}}>Secure, compliant AI-powered financial analysis and decision-making with immutable audit trails</p>
              <ul style={{color: '#F5F5F0', paddingLeft: '1.5rem'}}>
                <li>Risk Assessment with multi-agent collaboration</li>
                <li>Fraud Detection with decentralized consensus</li>
                <li>Compliance Monitoring with Soulchain audit trails</li>
              </ul>
            </div>
            
            <div style={{background: 'rgba(26, 26, 26, 0.8)', padding: '2rem', border: '1px solid rgba(0, 196, 255, 0.2)'}}>
              <h3 style={{color: '#00C4FF', marginBottom: '1rem'}}>Healthcare & Life Sciences</h3>
              <p style={{color: '#F5F5F0', marginBottom: '1rem'}}>Ethical AI for medical research, drug discovery, and patient care with privacy-preserving consensus</p>
              <ul style={{color: '#F5F5F0', paddingLeft: '1.5rem'}}>
                <li>Drug Discovery with molecular analysis</li>
                <li>Medical Imaging with ethical validation</li>
                <li>Clinical Trials with decentralized governance</li>
              </ul>
            </div>
            
            <div style={{background: 'rgba(26, 26, 26, 0.8)', padding: '2rem', border: '1px solid rgba(0, 196, 255, 0.2)'}}>
              <h3 style={{color: '#00C4FF', marginBottom: '1rem'}}>Supply Chain & Logistics</h3>
              <p style={{color: '#F5F5F0', marginBottom: '1rem'}}>Transparent, efficient supply chain management with decentralized consensus and real-time tracking</p>
              <ul style={{color: '#F5F5F0', paddingLeft: '1.5rem'}}>
                <li>Inventory Optimization with AI coordination</li>
                <li>Route Optimization with consensus-based decisions</li>
                <li>Quality Assurance with immutable audit trails</li>
              </ul>
            </div>
            
            <div style={{background: 'rgba(26, 26, 26, 0.8)', padding: '2rem', border: '1px solid rgba(0, 196, 255, 0.2)'}}>
              <h3 style={{color: '#00C4FF', marginBottom: '1rem'}}>Research & Development</h3>
              <p style={{color: '#F5F5F0', marginBottom: '1rem'}}>Collaborative research platforms with ethical AI governance and decentralized knowledge sharing</p>
              <ul style={{color: '#F5F5F0', paddingLeft: '1.5rem'}}>
                <li>Scientific Collaboration with shared knowledge bases</li>
                <li>Data Analysis with consensus-based validation</li>
                <li>Publication Verification with immutable audit trails</li>
              </ul>
            </div>
          </div>
          
          <div style={{background: 'rgba(0, 196, 255, 0.1)', border: '1px solid rgba(0, 196, 255, 0.3)', padding: '2rem', borderRadius: '10px'}}>
            <h2 style={{color: '#00C4FF', marginBottom: '1rem'}}>Key Benefits</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '2rem', color: '#00C4FF', marginBottom: '0.5rem'}}>30-50%</div>
                <p style={{color: '#F5F5F0'}}>Cost Reduction</p>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '2rem', color: '#00C4FF', marginBottom: '0.5rem'}}>99.9%</div>
                <p style={{color: '#F5F5F0'}}>Ethical Compliance</p>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '2rem', color: '#00C4FF', marginBottom: '0.5rem'}}>&lt;30s</div>
                <p style={{color: '#F5F5F0'}}>Consensus Time</p>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '2rem', color: '#00C4FF', marginBottom: '0.5rem'}}>100%</div>
                <p style={{color: '#F5F5F0'}}>Uptime Reliability</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}