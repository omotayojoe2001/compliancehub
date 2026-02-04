import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { contentService } from '@/lib/contentService';
import { Save, RefreshCw, DollarSign } from 'lucide-react';

export default function AdminSettings() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const data = await contentService.getContent();
      setContent(data);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    
    setLoading(true);
    try {
      const success = await contentService.updateContent(content);
      if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    }
    setLoading(false);
  };

  if (!content) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
            <p className="text-muted-foreground">Configure system-wide settings and integrations</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Subscription Plans & Pricing
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium mb-4">Subscription Plans</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="basicAnnual">Basic Plan (Annual) - ₦</Label>
                  <Input
                    id="basicAnnual"
                    type="number"
                    value={content?.pricing?.plans?.basic?.annualPrice || 15000}
                    onChange={(e) => {
                      const newContent = { ...content };
                      if (!newContent.pricing) newContent.pricing = { plans: {}, filingCharges: {} };
                      if (!newContent.pricing.plans) newContent.pricing.plans = {};
                      if (!newContent.pricing.plans.basic) newContent.pricing.plans.basic = {};
                      newContent.pricing.plans.basic.annualPrice = parseInt(e.target.value);
                      setContent(newContent);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="basicMonthly">Basic Plan (Monthly) - ₦</Label>
                  <Input
                    id="basicMonthly"
                    type="number"
                    value={content?.pricing?.plans?.basic?.monthlyPrice || 1250}
                    onChange={(e) => {
                      const newContent = { ...content };
                      if (!newContent.pricing) newContent.pricing = { plans: {}, filingCharges: {} };
                      if (!newContent.pricing.plans) newContent.pricing.plans = {};
                      if (!newContent.pricing.plans.basic) newContent.pricing.plans.basic = {};
                      newContent.pricing.plans.basic.monthlyPrice = parseInt(e.target.value);
                      setContent(newContent);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="proAnnual">Pro Plan (Annual) - ₦</Label>
                  <Input
                    id="proAnnual"
                    type="number"
                    value={content?.pricing?.plans?.pro?.annualPrice || 50000}
                    onChange={(e) => {
                      const newContent = { ...content };
                      if (!newContent.pricing) newContent.pricing = { plans: {}, filingCharges: {} };
                      if (!newContent.pricing.plans) newContent.pricing.plans = {};
                      if (!newContent.pricing.plans.pro) newContent.pricing.plans.pro = {};
                      newContent.pricing.plans.pro.annualPrice = parseInt(e.target.value);
                      setContent(newContent);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="proMonthly">Pro Plan (Monthly) - ₦</Label>
                  <Input
                    id="proMonthly"
                    type="number"
                    value={content?.pricing?.plans?.pro?.monthlyPrice || 4167}
                    onChange={(e) => {
                      const newContent = { ...content };
                      if (!newContent.pricing) newContent.pricing = { plans: {}, filingCharges: {} };
                      if (!newContent.pricing.plans) newContent.pricing.plans = {};
                      if (!newContent.pricing.plans.pro) newContent.pricing.plans.pro = {};
                      newContent.pricing.plans.pro.monthlyPrice = parseInt(e.target.value);
                      setContent(newContent);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="enterpriseAnnual">Enterprise Plan (Annual) - ₦</Label>
                  <Input
                    id="enterpriseAnnual"
                    type="number"
                    value={content?.pricing?.plans?.enterprise?.annualPrice || 150000}
                    onChange={(e) => {
                      const newContent = { ...content };
                      if (!newContent.pricing) newContent.pricing = { plans: {}, filingCharges: {} };
                      if (!newContent.pricing.plans) newContent.pricing.plans = {};
                      if (!newContent.pricing.plans.enterprise) newContent.pricing.plans.enterprise = {};
                      newContent.pricing.plans.enterprise.annualPrice = parseInt(e.target.value);
                      setContent(newContent);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="enterpriseMonthly">Enterprise Plan (Monthly) - ₦</Label>
                  <Input
                    id="enterpriseMonthly"
                    type="number"
                    value={content?.pricing?.plans?.enterprise?.monthlyPrice || 12500}
                    onChange={(e) => {
                      const newContent = { ...content };
                      if (!newContent.pricing) newContent.pricing = { plans: {}, filingCharges: {} };
                      if (!newContent.pricing.plans) newContent.pricing.plans = {};
                      if (!newContent.pricing.plans.enterprise) newContent.pricing.plans.enterprise = {};
                      newContent.pricing.plans.enterprise.monthlyPrice = parseInt(e.target.value);
                      setContent(newContent);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}