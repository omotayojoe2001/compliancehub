import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, AlertTriangle, CheckCircle, Play } from 'lucide-react';
import { guidesService, Guide } from '@/lib/guidesService';

export default function Guides() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    setLoading(true);
    const data = await guidesService.getGuides();
    setGuides(data);
    setLoading(false);
  };

  const toggleStepCompletion = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      VAT: 'bg-blue-100 text-blue-800',
      PAYE: 'bg-green-100 text-green-800',
      CAC: 'bg-purple-100 text-purple-800',
      WHT: 'bg-orange-100 text-orange-800',
      General: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.General;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || colors.beginner;
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // If already embed URL, return as is
    if (url.includes('/embed/')) return url;
    
    // Extract video ID from various YouTube URL formats
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    
    return url;
  };

  if (selectedGuide) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setSelectedGuide(null)}>
              ← Back to Guides
            </Button>
            <div className="flex gap-2">
              <Badge className={getCategoryColor(selectedGuide.category)}>
                {selectedGuide.category}
              </Badge>
              <Badge className={getDifficultyColor(selectedGuide.difficulty)}>
                {selectedGuide.difficulty}
              </Badge>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">{selectedGuide.title}</h1>
            <p className="text-muted-foreground mt-2">{selectedGuide.description}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selectedGuide.duration}
              </div>
              <div>
                {completedSteps.size}/{selectedGuide.steps.length} steps completed
              </div>
            </div>
          </div>

          {/* Requirements */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">📋 What You Need</h3>
            <ul className="space-y-1">
              {selectedGuide.requirements.map((req, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </Card>

          {/* YouTube Video */}
          {selectedGuide.youtube_url && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Play className="h-5 w-5 text-red-600" />
                Video Tutorial
              </h3>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <iframe
                  src={getEmbedUrl(selectedGuide.youtube_url)}
                  className="w-full h-64"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Video tutorial for ${selectedGuide.title}`}
                />
              </div>
            </Card>
          )}

          {/* Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold">📝 Step-by-Step Instructions</h3>
            {selectedGuide.steps.map((step, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStepCompletion(`step-${index}`)}
                    className={`mt-1 rounded-full p-1 ${
                      completedSteps.has(`step-${index}`)
                        ? 'text-green-600 bg-green-100'
                        : 'text-gray-400 bg-gray-100'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Step {index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{step}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Compliance Guides</h1>
          <p className="text-sm text-muted-foreground">
            Step-by-step guides for Nigerian tax compliance
          </p>
        </div>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <Card key={guide.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedGuide(guide)}>
              <div className="flex items-start justify-between mb-3">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex gap-1">
                  <Badge className={getCategoryColor(guide.category)} variant="secondary">
                    {guide.category}
                  </Badge>
                </div>
              </div>
              
              <h3 className="font-semibold mb-2 text-sm sm:text-base">{guide.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">{guide.description}</p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="truncate">{guide.duration}</span>
                </div>
                <Badge className={getDifficultyColor(guide.difficulty)} variant="outline">
                  {guide.difficulty}
                </Badge>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate">
                    {guide.steps.length} steps • {guide.requirements.length} requirements
                  </p>
                  {guide.youtube_url && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Play className="h-3 w-3" />
                      <span className="hidden sm:inline">Video included</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}