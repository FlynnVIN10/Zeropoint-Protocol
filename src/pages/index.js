import React, { useState } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import HomepageFeatures from '../components/HomepageFeatures';
import FeedbackBadge from '../components/FeedbackBadge';
import SynthiantCarousel from '../components/SynthiantCarousel';
import WalletConnectModal from '../components/WalletConnectModal';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <h1 className={clsx('hero__title', styles.heroTitle)}>
            {siteConfig.title}
          </h1>
          <p className={clsx('hero__subtitle', styles.heroSubtitle)}>
            {siteConfig.tagline}
          </p>
          <div className={styles.heroDescription}>
            <p>
              The future of ethical AI is here. Zeropoint Protocol combines advanced 
              multi-agent collaboration with decentralized governance to create a 
              new paradigm of artificial intelligence that serves humanity.
            </p>
            <div className={styles.progressBadge}>
              <span className={styles.badgeText}>Phase 8 Complete</span>
              <span className={styles.badgeSubtext}>Consensus Ops & Interop</span>
            </div>
          </div>
          <div className={styles.buttons}>
            <Link
              className={clsx('button', styles.heroButton)}
              to="/technology">
              Explore Technology
            </Link>
            <Link
              className={clsx('button', styles.heroButtonSecondary)}
              to="/use-cases">
              View Use Cases
            </Link>
            <Link
              className={clsx('button', styles.heroButtonTertiary)}
              to="/status">
              System Status
            </Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.glitchArt}>
            {/* Glitch art cityscape effect */}
            <div className={styles.cityscape}>
              <div className={styles.building}></div>
              <div className={styles.building}></div>
              <div className={styles.building}></div>
              <div className={styles.building}></div>
              <div className={styles.building}></div>
            </div>
            <div className={styles.dataStream}>
              <div className={styles.dataLine}></div>
              <div className={styles.dataLine}></div>
              <div className={styles.dataLine}></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Ethical Agentic AI Platform`}
      description="Zeropoint Protocol: Advanced multi-agent collaboration with ethical AI principles and decentralized governance.">
      <HomepageHeader />
      <main className={styles.mainContent}>
        <section className={styles.featuresSection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Core Capabilities</h2>
            <HomepageFeatures />
          </div>
        </section>
        
        <section className={styles.progressSection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Development Progress</h2>
            <div className={styles.progressGrid}>
              <div className={styles.progressCard}>
                <h3>Phase 1-3: Foundation</h3>
                <p>Core architecture, AI integration, security implementation</p>
                <span className={styles.statusComplete}>✅ Complete</span>
              </div>
              <div className={styles.progressCard}>
                <h3>Phase 4: Website</h3>
                <p>Enhanced UI/UX, feedback systems, documentation</p>
                <span className={styles.statusComplete}>✅ Complete</span>
              </div>
              <div className={styles.progressCard}>
                <h3>Phase 5: Testing</h3>
                <p>Comprehensive test suite, deployment validation</p>
                <span className={styles.statusComplete}>✅ Complete</span>
              </div>
              <div className={styles.progressCard}>
                <h3>Phase 6: Database</h3>
                <p>PostgreSQL migration, zero-downtime deployment</p>
                <span className={styles.statusComplete}>✅ Complete</span>
              </div>
              <div className={styles.progressCard}>
                <h3>Phase 7: Security</h3>
                <p>Advanced security hardening, key rotation, logging</p>
                <span className={styles.statusComplete}>✅ Complete</span>
              </div>
              <div className={styles.progressCard}>
                <h3>Phase 8: Consensus</h3>
                <p>Soulchain <-> DAOstate integration, token gating</p>
                <span className={styles.statusComplete}>✅ Complete</span>
              </div>
            </div>
          </div>
        </section>
        
        <section className={styles.statsSection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>System Metrics</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>36,474+</h3>
                <p>Seconds of continuous uptime</p>
              </div>
              <div className={styles.statCard}>
                <h3>100%</h3>
                <p>Test coverage (unit, integration, security, consensus)</p>
              </div>
              <div className={styles.statCard}>
                <h3>8 Phases</h3>
                <p>Development phases completed successfully</p>
              </div>
              <div className={styles.statCard}>
                <h3>&lt;30s</h3>
                <p>Consensus operation timeout targets met</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.technologySection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Advanced Features</h2>
            <div className={styles.techGrid}>
              <div className={styles.techCard}>
                <h3>Multi-Agent Collaboration</h3>
                <p>Advanced swarm intelligence with coordinated decision-making and shared knowledge</p>
              </div>
              <div className={styles.techCard}>
                <h3>Ethical AI Framework</h3>
                <p>Zeroth-gate validation system ensuring all AI operations align with ethical principles</p>
              </div>
              <div className={styles.techCard}>
                <h3>Decentralized Governance</h3>
                <p>IPFS-based Soulchain ledger with consensus mechanisms and token gating</p>
              </div>
              <div className={styles.techCard}>
                <h3>Consensus Bridge</h3>
                <p>Soulchain <-> DAOstate integration with performance benchmarks and real-time visualization</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FeedbackBadge />
    </Layout>
  );
}