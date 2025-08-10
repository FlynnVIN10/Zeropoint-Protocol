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
            <Link to="/phases/14">Learn More</Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}
