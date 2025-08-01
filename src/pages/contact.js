import React from 'react';
import Layout from '@theme/Layout';

export default function Contact() {
  return (
    <Layout
      title="Contact - Zeropoint Protocol"
      description="Get in touch with the Zeropoint Protocol team">
      <main style={{padding: '4rem 0', background: '#1A1A1A', minHeight: '80vh'}}>
        <div className="container">
          <h1 style={{color: '#00C4FF', fontSize: '3rem', marginBottom: '2rem'}}>Contact Us</h1>
          <p style={{color: '#F5F5F0', fontSize: '1.2rem', marginBottom: '3rem'}}>
            Get in touch with the Zeropoint Protocol team for support, partnerships, and technical inquiries
          </p>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
            <div style={{background: 'rgba(26, 26, 26, 0.8)', padding: '2rem', border: '1px solid rgba(0, 196, 255, 0.2)'}}>
              <h3 style={{color: '#00C4FF', marginBottom: '1rem'}}>General Inquiries</h3>
              <p style={{color: '#F5F5F0', marginBottom: '1rem'}}>For general questions about Zeropoint Protocol</p>
              <a href="mailto:info@zeropointprotocol.ai" style={{color: '#BF00FF', textDecoration: 'none'}}>
                info@zeropointprotocol.ai
              </a>
            </div>
            
            <div style={{background: 'rgba(26, 26, 26, 0.8)', padding: '2rem', border: '1px solid rgba(0, 196, 255, 0.2)'}}>
              <h3 style={{color: '#00C4FF', marginBottom: '1rem'}}>Technical Support</h3>
              <p style={{color: '#F5F5F0', marginBottom: '1rem'}}>For technical issues and API support</p>
              <a href="mailto:support@zeropointprotocol.ai" style={{color: '#BF00FF', textDecoration: 'none'}}>
                support@zeropointprotocol.ai
              </a>
            </div>
            
            <div style={{background: 'rgba(26, 26, 26, 0.8)', padding: '2rem', border: '1px solid rgba(0, 196, 255, 0.2)'}}>
              <h3 style={{color: '#00C4FF', marginBottom: '1rem'}}>Business Development</h3>
              <p style={{color: '#F5F5F0', marginBottom: '1rem'}}>For partnerships and enterprise inquiries</p>
              <a href="mailto:business@zeropointprotocol.ai" style={{color: '#BF00FF', textDecoration: 'none'}}>
                business@zeropointprotocol.ai
              </a>
            </div>
            
            <div style={{background: 'rgba(26, 26, 26, 0.8)', padding: '2rem', border: '1px solid rgba(0, 196, 255, 0.2)'}}>
              <h3 style={{color: '#00C4FF', marginBottom: '1rem'}}>Security Issues</h3>
              <p style={{color: '#F5F5F0', marginBottom: '1rem'}}>For security vulnerabilities and concerns</p>
              <a href="mailto:security@zeropointprotocol.ai" style={{color: '#BF00FF', textDecoration: 'none'}}>
                security@zeropointprotocol.ai
              </a>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}