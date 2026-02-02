import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { contentService } from '@/lib/contentService';
import { Save, RefreshCw, FileText, DollarSign, Phone, Link, Users, Lightbulb } from 'lucide-react';

interface SiteContent {
  siteInfo: {
    companyName: string;
    tagline: string;
    description: string;
    phone: string;
    email: string;
    address: string;
  };
  pricing: {
    plans: {
      free: { name: string; monthlyPrice: number; annualPrice: number; features: string[]; };
      basic: { name: string; monthlyPrice: number; annualPrice: number; features: string[]; };
      pro: { name: string; monthlyPrice: number; annualPrice: number; features: string[]; };
      enterprise: { name: string; monthlyPrice: number; annualPrice: number; features: string[]; };
    };
    filingCharges: {
      vat: number;
      paye: number;
      cit: number;
      wht: number;
      filing_service: number;
    };
  };
  features: Array<{
    title: string;
    description: string;
  }>;
  howItWorks: Array<{
    step: string;
    title: string;
    description: string;
  }>;
  targetAudience: string[];
  footer: {
    aboutText: string;
    quickLinks: string[];
    socialLinks: {
      facebook: string;
      twitter: string;
      linkedin: string;
    };
  };
}

export default function AdminContent() {
  const [content, setContent] = useState<SiteContent | null>(null);
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
        alert('Failed to save content');
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      alert('Failed to save content');
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

  const updateContent = (section: keyof ContentSettings, key: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updateNestedContent = (section: keyof ContentSettings, subsection: string, key: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [key]: value
        }
      }
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Content Manager</h1>
            <p className="text-muted-foreground">Manage site content, pricing, and footer information</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchContent} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
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

        <Tabs defaultValue="site-info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="site-info">Site Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
          </TabsList>

          <TabsContent value="site-info">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Site Information
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={content.siteInfo.companyName}
                      onChange={(e) => setContent({...content, siteInfo: {...content.siteInfo, companyName: e.target.value}})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={content.siteInfo.tagline}
                      onChange={(e) => setContent({...content, siteInfo: {...content.siteInfo, tagline: e.target.value}})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={content.siteInfo.description}
                      onChange={(e) => setContent({...content, siteInfo: {...content.siteInfo, description: e.target.value}})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={content.siteInfo.phone}
                      onChange={(e) => setContent({...content, siteInfo: {...content.siteInfo, phone: e.target.value}})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={content.siteInfo.email}
                      onChange={(e) => setContent({...content, siteInfo: {...content.siteInfo, email: e.target.value}})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={content.siteInfo.address}
                      onChange={(e) => setContent({...content, siteInfo: {...content.siteInfo, address: e.target.value}})}
                    />
                  </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Subscription Plans & Pricing
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Subscription Plans</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="freeAnnual">Free Plan - Annual (₦)</Label>
                      <Input
                        id="freeAnnual"
                        type="number"
                        value={content.pricing.plans.free.annualPrice}
                        onChange={(e) => {
                          const newContent = { ...content };
                          newContent.pricing.plans.free.annualPrice = parseInt(e.target.value);
                          setContent(newContent);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="freeMonthly">Free Plan - Monthly (₦)</Label>
                      <Input
                        id="freeMonthly"
                        type="number"
                        value={content.pricing.plans.free.monthlyPrice}
                        onChange={(e) => {
                          const newContent = { ...content };
                          newContent.pricing.plans.free.monthlyPrice = parseInt(e.target.value);
                          setContent(newContent);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="basicAnnual">Basic Plan - Annual (₦)</Label>
                      <Input
                        id="basicAnnual"
                        type="number"
                        value={content.pricing.plans.basic.annualPrice}
                        onChange={(e) => {
                          const newContent = { ...content };
                          newContent.pricing.plans.basic.annualPrice = parseInt(e.target.value);
                          setContent(newContent);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="basicMonthly">Basic Plan - Monthly (₦)</Label>
                      <Input
                        id="basicMonthly"
                        type="number"
                        value={content.pricing.plans.basic.monthlyPrice}
                        onChange={(e) => {
                          const newContent = { ...content };
                          newContent.pricing.plans.basic.monthlyPrice = parseInt(e.target.value);
                          setContent(newContent);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="proAnnual">Pro Plan - Annual (₦)</Label>
                      <Input
                        id="proAnnual"
                        type="number"
                        value={content.pricing.plans.pro.annualPrice}
                        onChange={(e) => {
                          const newContent = { ...content };
                          newContent.pricing.plans.pro.annualPrice = parseInt(e.target.value);
                          setContent(newContent);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="proMonthly">Pro Plan - Monthly (₦)</Label>
                      <Input
                        id="proMonthly"
                        type="number"
                        value={content.pricing.plans.pro.monthlyPrice}
                        onChange={(e) => {
                          const newContent = { ...content };
                          newContent.pricing.plans.pro.monthlyPrice = parseInt(e.target.value);
                          setContent(newContent);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="enterpriseAnnual">Enterprise Plan - Annual (₦)</Label>
                      <Input
                        id="enterpriseAnnual"
                        type="number"
                        value={content.pricing.plans.enterprise.annualPrice}
                        onChange={(e) => {
                          const newContent = { ...content };
                          newContent.pricing.plans.enterprise.annualPrice = parseInt(e.target.value);
                          setContent(newContent);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="enterpriseMonthly">Enterprise Plan - Monthly (₦)</Label>
                      <Input
                        id="enterpriseMonthly"
                        type="number"
                        value={content.pricing.plans.enterprise.monthlyPrice}
                        onChange={(e) => {
                          const newContent = { ...content };
                          newContent.pricing.plans.enterprise.monthlyPrice = parseInt(e.target.value);
                          setContent(newContent);
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Filing Charges (₦)</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="vatCharge">VAT Filing</Label>
                      <Input
                        id="vatCharge"
                        type="number"
                        value={content.pricing.filingCharges.vat}
                        onChange={(e) => updateNestedContent('pricing', 'filingCharges', 'vat', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="payeCharge">PAYE Filing</Label>
                      <Input
                        id="payeCharge"
                        type="number"
                        value={content.pricing.filingCharges.paye}
                        onChange={(e) => updateNestedContent('pricing', 'filingCharges', 'paye', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="citCharge">CIT Filing</Label>
                      <Input
                        id="citCharge"
                        type="number"
                        value={content.pricing.filingCharges.cit}
                        onChange={(e) => updateNestedContent('pricing', 'filingCharges', 'cit', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="whtCharge">WHT Filing</Label>
                      <Input
                        id="whtCharge"
                        type="number"
                        value={content.pricing.filingCharges.wht}
                        onChange={(e) => updateNestedContent('pricing', 'filingCharges', 'wht', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Current Pricing Structure:</strong><br/>
                    • Free: ₦0/year (₦0/month)<br/>
                    • Basic: ₦15,000/year (₦1,250/month)<br/>
                    • Pro: ₦50,000/year (₦4,167/month)<br/>
                    • Enterprise: ₦150,000/year (₦12,500/month)
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="footer">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Footer Content</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="aboutText">About Text</Label>
                  <Textarea
                    id="aboutText"
                    value={content.footer.aboutText}
                    onChange={(e) => updateContent('footer', 'aboutText', e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="quickLinks">Quick Links (comma separated)</Label>
                  <Input
                    id="quickLinks"
                    value={content.footer.quickLinks.join(', ')}
                    onChange={(e) => updateContent('footer', 'quickLinks', e.target.value.split(', '))}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="links">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Link className="h-5 w-5" />
                Social Media Links
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="facebook">Facebook URL</Label>
                  <Input
                    id="facebook"
                    value={content.footer.socialLinks.facebook}
                    onChange={(e) => updateNestedContent('footer', 'socialLinks', 'facebook', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter URL</Label>
                  <Input
                    id="twitter"
                    value={content.footer.socialLinks.twitter}
                    onChange={(e) => updateNestedContent('footer', 'socialLinks', 'twitter', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    value={content.footer.socialLinks.linkedin}
                    onChange={(e) => updateNestedContent('footer', 'socialLinks', 'linkedin', e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}