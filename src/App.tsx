/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Registration } from './pages/Registration';
import { Dashboard } from './pages/Dashboard';
import { BoardDetail } from './pages/BoardDetail';
import { FollowUps } from './pages/FollowUps';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';
import { ScriptsManager } from './pages/ScriptsManager';
import { AdminArea } from './pages/AdminArea';
import { Wizard } from './pages/Wizard';
import { Layout } from './components/Layout';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useEffect } from 'react';
import { dbApi } from './lib/db';

export default function App() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // Initialize default scripts if needed, but only if the user is an admin
    if (profile?.isAdmin) {
      dbApi.initializeDefaultScripts().catch(console.error);
    }
  }, [profile?.isAdmin]);

  if (loading) {
    return <div className="min-h-screen bg-[#0A192F] flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#0A192F] text-white">
        <Routes>
          {!user ? (
            <Route path="*" element={<Registration />} />
          ) : !profile ? (
            <Route path="*" element={<Registration />} />
          ) : (
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/boards" element={<Dashboard />} />
              <Route path="/boards/:id" element={<BoardDetail />} />
              <Route path="/boards/:id/wizard" element={<Wizard />} />
              <Route path="/followups" element={<FollowUps />} />
              
              {/* Rep specific route */}
              <Route path="/stats" element={profile.isAdmin ? <Navigate to="/admin" replace /> : <Stats />} />
              
              <Route path="/settings" element={<Settings />} />
              
              {/* Admin only routes */}
              <Route path="/admin" element={profile.isAdmin ? <AdminArea /> : <Navigate to="/" replace />} />
              <Route path="/admin/scripts" element={profile.isAdmin ? <ScriptsManager /> : <Navigate to="/" replace />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          )}
        </Routes>
        <PWAInstallButton />
        <OfflineIndicator />
      </div>
    </Router>
  );
}
