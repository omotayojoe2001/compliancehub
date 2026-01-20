import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Video, Download, ExternalLink } from 'lucide-react';

export default function GuidesClean() {
  const guides = [
    {
      id: 1,
      title: 'VAT Registration and Filing',
      description: 'Complete guide to VAT registration, calculation, and filing in Nigeria',
      type: 'article',
      duration: '10 min read',
      category: 'VAT'
    },
    {
      id: 2,
      title: 'PAYE Tax Calculation',
      description: 'Step-by-step guide to calculating and filing PAYE taxes',
      type: 'video',
      duration: '15 min watch',
      category: 'PAYE'
    },
    {
      id: 3,
      title: 'Company Income Tax (CIT)',
      description: 'Understanding CIT requirements and filing procedures',
      type: 'article',
      duration: '12 min read',
      category: 'CIT'
    },
    {
      id: 4,
      title: 'Withholding Tax Guide',
      description: 'Complete guide to withholding tax rates and procedures',
      type: 'pdf',
      duration: '8 pages',
      category: 'WHT'
    },
    {
      id: 5,
      title: 'CAC Annual Returns',
      description: 'How to file your CAC annual returns and maintain compliance',
      type: 'article',
      duration: '7 min read',
      category: 'CAC'
    },
    {
      id: 6,
      title: 'Tax Calendar 2026',
      description: 'Complete Nigerian tax calendar with all important deadlines',
      type: 'pdf',
      duration: '2 pages',
      category: 'General'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'pdf': return <Download className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-red-600 bg-red-100';
      case 'pdf': return 'text-purple-600 bg-purple-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const categories = ['All', 'VAT', 'PAYE', 'CIT', 'WHT', 'CAC', 'General'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">How-To Guides</h1>
          <p className="text-muted-foreground">Learn Nigerian tax compliance with our comprehensive guides</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <Card className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Guides</p>
                <p className="text-lg md:text-2xl font-bold">{guides.length}</p>
              </div>
              <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Articles</p>
                <p className="text-lg md:text-2xl font-bold">{guides.filter(g => g.type === 'article').length}</p>
              </div>
              <FileText className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Videos</p>
                <p className="text-lg md:text-2xl font-bold">{guides.filter(g => g.type === 'video').length}</p>
              </div>
              <Video className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Downloads</p>
                <p className="text-lg md:text-2xl font-bold">{guides.filter(g => g.type === 'pdf').length}</p>
              </div>
              <Download className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold">Browse Guides</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button key={category} variant="outline" size="sm" className="text-xs px-2 py-1">
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <Card key={guide.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-full ${getTypeColor(guide.type)}`}>
                    {getTypeIcon(guide.type)}
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {guide.category}
                  </span>
                </div>
                
                <h4 className="font-semibold mb-2">{guide.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{guide.duration}</span>
                  <Button size="sm">
                    {guide.type === 'pdf' ? 'Download' : 'Read'}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Government Resources</h4>
              <div className="space-y-1">
                <a href="#" className="block text-sm text-blue-600 hover:underline">FIRS Official Website</a>
                <a href="#" className="block text-sm text-blue-600 hover:underline">CAC Online Portal</a>
                <a href="#" className="block text-sm text-blue-600 hover:underline">PENCOM Guidelines</a>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Tax Forms & Templates</h4>
              <div className="space-y-1">
                <a href="#" className="block text-sm text-blue-600 hover:underline">VAT Return Form</a>
                <a href="#" className="block text-sm text-blue-600 hover:underline">PAYE Schedule Template</a>
                <a href="#" className="block text-sm text-blue-600 hover:underline">CIT Self Assessment Form</a>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}