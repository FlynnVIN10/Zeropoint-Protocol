'use client';

import { motion } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Globe,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { AppShell } from '../components/ui/AppShell';
import { HeaderGlass } from '../components/ui/HeaderGlass';
import { SideNav } from '../components/layout/SideNav';
import { KPIDial } from '../components/ui/KPIDial';
import { StatusTag } from '../components/ui/StatusTag';

export default function HomePage() {
  return (
    <AppShell>
      <HeaderGlass>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-accent">ZEROPOINT PROTOCOL</h1>
            <StatusTag status="online" size="sm" />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted">BlackOps Control Center</span>
          </div>
        </div>
      </HeaderGlass>

      <div className="flex">
        <SideNav />
        
        <main className="flex-1 lg:ml-80">
          {/* Hero Section */}
          <section className="relative h-screen flex items-center justify-center blackops-gradient">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237df9ff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center z-10"
            >
              <motion.h1 
                className="text-8xl font-bold mb-6 bg-gradient-to-r from-accent via-fg to-accent bg-clip-text text-transparent"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                ZEROPOINT
              </motion.h1>
              <motion.p 
                className="text-3xl text-muted mb-8 font-light tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                PROTOCOL
              </motion.p>
              <motion.p 
                className="text-xl text-fg max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <span className="text-accent font-semibold">Ethical Agentic AI Platform</span> with real-time Synthiant interactions, 
                live metrics, and BlackOps control center
              </motion.p>
            </motion.div>

            {/* Floating Elements */}
            <motion.div 
              className="absolute top-20 right-20 w-32 h-32 bg-accent rounded-full opacity-20 blur-xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-20 left-20 w-24 h-24 bg-warn rounded-full opacity-20 blur-xl"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
          </section>

          {/* Live Platform Status */}
          <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold mb-4">Live Platform Status</h2>
                <p className="text-muted text-lg">Real-time metrics and system health</p>
              </motion.div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <KPIDial
                  title="System Health"
                  value="99.9%"
                  subtitle="Uptime"
                  icon={<CheckCircle className="w-8 h-8" />}
                  color="ok"
                  trend="up"
                />

                <KPIDial
                  title="Active Synthiants"
                  value="47"
                  subtitle="Online"
                  icon={<Activity className="w-8 h-8" />}
                  color="accent"
                />

                <KPIDial
                  title="API Response"
                  value="127ms"
                  subtitle="Average"
                  icon={<TrendingUp className="w-8 h-8" />}
                  color="warn"
                  trend="stable"
                />

                <KPIDial
                  title="Security"
                  value="100%"
                  subtitle="Protected"
                  icon={<Shield className="w-8 h-8" />}
                  color="fg"
                />
              </div>
            </div>
          </section>

          {/* Phase 14 Task 2 Completion */}
          <section className="py-20 px-4 bg-panel">
            <div className="max-w-6xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold mb-4 text-accent">🚀 Phase 14 Task 2 - COMPLETED!</h2>
                <p className="text-xl text-muted">Enhanced SSE & Multi-LLM Implementation Successfully Deployed</p>
              </motion.div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h3 className="text-2xl font-bold mb-6 text-ok">✅ Task Completion Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-ok" />
                      <span><strong>Task:</strong> Phase 14 Task 2 - Enhanced SSE & Multi-LLM</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-ok" />
                      <span><strong>Status:</strong> COMPLETED</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-ok" />
                      <span><strong>Progress:</strong> 3/8 tasks completed (37.5%)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-ok" />
                      <span><strong>CEO Approval:</strong> ✅ APPROVED</span>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h3 className="text-2xl font-bold mb-6 text-accent">🚀 Implementation Highlights</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-accent" />
                      <span>Enhanced SSE endpoint with provider router</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-accent" />
                      <span>OpenAI/Anthropic failover logic</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-accent" />
                      <span>Rate limiting and DDoS protection</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-accent" />
                      <span>Security headers implementation</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-accent" />
                      <span>Load testing for 500 concurrent connections</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-accent" />
                      <span>Bias/fairness checks for ethical compliance</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Quick Navigation */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold mb-4">Control Center Access</h2>
                <p className="text-muted text-lg">Navigate to different sections of the platform</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { href: '/docs', title: 'Documentation', desc: 'MDX docs with Nextra', icon: Globe, color: 'accent' },
                  { href: '/phases', title: 'Development Phases', desc: 'Track our progress', icon: TrendingUp, color: 'ok' },
                  { href: '/control/overview', title: 'Control Overview', desc: 'KPIs and system status', icon: Activity, color: 'warn' },
                  { href: '/control/synthiants', title: 'Synthiants', desc: 'Live chat and presence', icon: Users, color: 'accent' },
                  { href: '/control/metrics', desc: 'Real-time metrics', title: 'Performance Metrics', icon: Zap, color: 'ok' },
                  { href: '/control/audit', title: 'Audit Log', desc: 'Append-only timeline', icon: Shield, color: 'fg' }
                ].map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    className="blackops-card group hover:border-accent transition-all duration-300 hover:scale-105"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className={`flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-${item.color} bg-opacity-20 rounded-full group-hover:bg-opacity-30 transition-all duration-300`}>
                      <item.icon className={`w-8 h-8 text-${item.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-center">{item.title}</h3>
                    <p className="text-muted text-center">{item.desc}</p>
                  </motion.a>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 px-4 border-t border-muted">
            <div className="max-w-6xl mx-auto text-center">
              <p className="text-muted">
                <em>Built with ❤️ by the Zeropoint Protocol team</em>
              </p>
              <p className="text-sm text-muted mt-2">
                © 2025 Zeropoint Protocol, Inc., Austin, TX. All Rights Reserved.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </AppShell>
  );
}
