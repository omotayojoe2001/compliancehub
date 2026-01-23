import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, Crown, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextClean';
import { supabaseService } from '@/lib/supabaseService';

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature: string;
}

export function SubscriptionGate({ children, feature }: SubscriptionGateProps) {
  // DISABLED - Allow all access for now
  return <>{children}</>;
}