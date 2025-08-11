'use client';

import { motion } from 'framer-motion';
import { AppShell } from '../../components/ui/AppShell';
import { HeaderGlass } from '../../components/ui/HeaderGlass';
import { SideNav } from '../../components/layout/SideNav';
import { KPIDial } from '../../components/ui/KPIDial';
import { StatusTag } from '../../components/ui/StatusTag';
import { TrendSpark } from '../../components/ui/TrendSpark';
import { DataGrid } from '../../components/ui/DataGrid';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { ChatDock } from '../../components/ui/ChatDock';
import { PresenceBar } from '../../components/ui/PresenceBar';
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

export default function ComponentsShowcasePage() {
  const sampleData = [
    { id: 1, name: 'Alice Chen', role: 'Frontend Dev', status: 'Online', lastActive: '2 min ago' },
    { id: 2, name: 'Bob Rodriguez', role: 'Backend Dev', status: 'Away', lastActive: '5 min ago' },
    { id: 3, name: 'Carol Kim', role: 'DevOps', status: 'Busy', lastActive: '1 min ago' },
    { id: 4, name: 'David Thompson', role: 'QA Engineer', status: 'Online', lastActive: 'Just now' },
  ];

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'lastActive', label: 'Last Active', sortable: true },
  ];

  return (
    <AppShell>
      <HeaderGlass>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-accent">BLACKOPS UI COMPONENTS</h1>
            <StatusTag status="online" size="sm" />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted">Component Showcase</span>
          </div>
        </div>
      </HeaderGlass>

      <div className="flex">
        <SideNav />
        
        <main className="flex-1 lg:ml-80 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-8 text-center text-accent">BlackOps UI Component Library</h2>
            <p className="text-xl text-muted text-center mb-16">Complete design system with 10 core components</p>

            {/* KPI Dials Section */}
            <section className="mb-16">
              <h3 className="text-2xl font-bold mb-8 text-fg">KPI Dials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </section>

            {/* Status Tags Section */}
            <section className="mb-16">
              <h3 className="text-2xl font-bold mb-8 text-fg">Status Tags</h3>
              <div className="flex flex-wrap gap-4">
                <StatusTag status="online" size="sm" />
                <StatusTag status="offline" size="md" />
                <StatusTag status="warning" size="lg" />
                <StatusTag status="error" size="md" />
                <StatusTag status="maintenance" size="sm" />
              </div>
            </section>

            {/* Trend Spark Section */}
            <section className="mb-16">
              <h3 className="text-2xl font-bold mb-8 text-fg">Trend Sparks</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TrendSpark
                  value={15420}
                  change={12.5}
                  period="Last 30 days"
                />
                <TrendSpark
                  value={892}
                  change={-3.2}
                  period="Last 7 days"
                />
                <TrendSpark
                  value={2341}
                  change={0}
                  period="Last 24 hours"
                />
              </div>
            </section>

            {/* Data Grid Section */}
            <section className="mb-16">
              <h3 className="text-2xl font-bold mb-8 text-fg">Data Grid</h3>
              <DataGrid
                columns={columns}
                data={sampleData}
                searchable={true}
                filterable={true}
                pageSize={4}
              />
            </section>

            {/* Code Block Section */}
            <section className="mb-16">
              <h3 className="text-2xl font-bold mb-8 text-fg">Code Blocks</h3>
              <div className="space-y-6">
                <CodeBlock
                  code={`import { motion } from 'framer-motion';
import { KPIDial } from './components/ui/KPIDial';

export function Dashboard() {
  return (
    <KPIDial
      title="System Health"
      value="99.9%"
      subtitle="Uptime"
      icon={<CheckCircle className="w-8 h-8" />}
      color="ok"
      trend="up"
    />
  );
}`}
                  language="typescript"
                  title="Component Usage Example"
                />
                <CodeBlock
                  code={`const blackopsColors = {
  bg: '#0b0b0e',
  panel: '#111217',
  muted: '#1a1b22',
  fg: '#e6e6f0',
  accent: '#7df9ff',
  warn: '#ffb020',
  ok: '#16d19a'
};`}
                  language="javascript"
                  title="Design Tokens"
                />
              </div>
            </section>

            {/* Interactive Components Section */}
            <section className="mb-16">
              <h3 className="text-2xl font-bold mb-8 text-fg">Interactive Components</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-fg">Presence Bar</h4>
                  <PresenceBar showActivity={true} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-fg">Chat Dock</h4>
                  <p className="text-muted mb-4">Click the chat button in the bottom right to test</p>
                </div>
              </div>
            </section>

            {/* Component Stats */}
            <section className="mb-16">
              <h3 className="text-2xl font-bold mb-8 text-fg">Component Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="blackops-card text-center">
                  <div className="text-4xl font-bold text-accent mb-2">10</div>
                  <div className="text-muted">Total Components</div>
                </div>
                <div className="blackops-card text-center">
                  <div className="text-4xl font-bold text-ok mb-2">100%</div>
                  <div className="text-muted">AAA Accessibility</div>
                </div>
                <div className="blackops-card text-center">
                  <div className="text-4xl font-bold text-warn mb-2">120-180ms</div>
                  <div className="text-muted">Motion Duration</div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="text-center py-12 border-t border-muted">
              <p className="text-muted">
                <em>BlackOps UI Component Library - Built with ❤️ by the Zeropoint Protocol team</em>
              </p>
              <p className="text-sm text-muted mt-2">
                All components respect reduce-motion preferences and maintain AAA contrast ratios
              </p>
            </footer>
          </motion.div>
        </main>
      </div>

      {/* Chat Dock - Always visible for testing */}
      <ChatDock />
    </AppShell>
  );
}
