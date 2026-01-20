import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, AlertTriangle, CheckCircle, Play } from 'lucide-react';
import { complianceGuides, Guide } from '@/lib/complianceGuides';
import { HelpWrapper } from '@/components/onboarding/HelpWrapper';

export default function Guides() {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

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
      Beginner: 'bg-green-100 text-green-800',
      Intermediate: 'bg-yellow-100 text-yellow-800',
      Advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || colors.Beginner;
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
                {selectedGuide.estimatedTime}
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

          {/* Tips */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold mb-3 text-blue-800">💡 Pro Tips</h3>
            <ul className="space-y-1">
              {selectedGuide.tips.map((tip, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                  <span>•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </Card>

          {/* Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold">📝 Step-by-Step Instructions</h3>
            {selectedGuide.steps.map((step, index) => (
              <Card key={step.id} className="p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStepCompletion(step.id)}
                    className={`mt-1 rounded-full p-1 ${
                      completedSteps.has(step.id)
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
                      <h4 className="font-medium">{step.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    
                    {step.videoUrl && (
                      <div className="bg-gray-900 rounded-lg overflow-hidden mb-3">
                        <div className="flex items-center justify-between p-3 bg-gray-800">
                          <div className="flex items-center gap-2">
                            <Play className="h-4 w-4 text-white" />
                            <span className="text-white text-sm font-medium">Video Tutorial</span>
                          </div>
                        </div>
                        <iframe
                          src={step.videoUrl}
                          className="w-full h-64"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={`Video tutorial for ${step.title}`}
                        />
                      </div>
                    )}
                    
                    {step.action && (
                      <div className="bg-gray-50 p-3 rounded mb-3">
                        <p className="text-sm"><strong>Action:</strong> {step.action}</p>
                      </div>
                    )}
                    
                    {step.warning && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <p className="text-sm text-yellow-800">{step.warning}</p>
                        </div>
                      </div>
                    )}
                    
                    {step.documents && (
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm font-medium text-blue-800 mb-1">Required Documents:</p>
                        <ul className="text-sm text-blue-700">
                          {step.documents.map((doc, i) => (
                            <li key={i}>• {doc}</li>
                          ))}
                        </ul>
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <HelpWrapper
          helpTitle="What are these guides?"
          helpContent="These are step-by-step instructions to help you file your taxes correctly. Each guide shows you exactly what to do, what documents you need, and how to avoid mistakes."
        >
          <div>
            <h1 className="text-lg font-semibold text-foreground">Compliance Guides</h1>
            <p className="text-sm text-muted-foreground">
              Step-by-step guides for Nigerian tax compliance
            </p>
          </div>
        </HelpWrapper>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {complianceGuides.map((guide) => (
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
                  <span className="truncate">{guide.estimatedTime}</span>
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
                  {guide.steps.some(step => step.videoUrl) && (
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