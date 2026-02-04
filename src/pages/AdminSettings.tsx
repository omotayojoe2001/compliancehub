import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { contentService } from '@/lib/contentService';
import { Save, RefreshCw } from 'lucide-react';

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Placeholder for future settings
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
    setLoading(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
            <p className="text-muted-foreground">Configure system-wide settings and integrations</p>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Settings</h2>
          <p className="text-muted-foreground">
            For pricing and content management, please use the <strong>Content Manager</strong> at /admin/content
          </p>
        </Card>
      </div>
    </AdminLayout>
  );
}