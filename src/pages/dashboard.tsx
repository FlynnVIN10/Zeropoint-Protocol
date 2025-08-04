import React from 'react';
import Layout from '@theme/Layout';
import RoleBasedDashboard from '../components/RoleBasedDashboard';
import { RoleProvider } from '../contexts/RoleContext';
import styles from './dashboard.module.css';

// Dashboard page now uses RoleBasedDashboard component
export default function Dashboard(): JSX.Element {
  return (
    <Layout title="Dashboard" description="Zeropoint Protocol Dashboard">
      <RoleProvider>
        <RoleBasedDashboard />
      </RoleProvider>
    </Layout>
  );
} 