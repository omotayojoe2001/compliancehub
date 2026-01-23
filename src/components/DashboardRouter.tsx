import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContextClean';
import { supabaseService } from '@/lib/supabaseService';
import Dashboard from '@/pages/Dashboard';
import FreemiumDashboard from '@/pages/FreemiumDashboard';

export function DashboardRouter() {
  // SIMPLIFIED - Always show regular Dashboard
  return <Dashboard />;
}