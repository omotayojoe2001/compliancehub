import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Eye, Video, Clock, Users, BookOpen } from 'lucide-react';

interface HowToGuide {
  id: string;
  title: string;
  description: string;
  subheading: string;
  duration: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  youtube_video_id: string;
  requirements: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface GuideStep {
  id: string;
  guide_id: string;
  step_number: number;
  title: string;
  content: string;
}

export function HowToGuidesAdmin() {
  const [guides, setGuides] = useState<HowToGuide[]>([]);
  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<HowToGuide | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subheading: '',
    duration: 0,
    difficulty_level: 'beginner' as const,
    youtube_video_id: '',
    requirements: '',
    is_published: false
  });

  const [stepFormData, setStepFormData] = useState({
    title: '',
    content: '',
    step_number: 1
  });

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const { data, error } = await supabase
        .from('howto_guides')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuides(data || []);
    } catch (error) {
      console.error('Error fetching guides:', error);
    }
    setLoading(false);
  };

  const fetchSteps = async (guideId: string) => {
    try {
      const { data, error } = await supabase
        .from('howto_guide_steps')
        .select('*')
        .eq('guide_id', guideId)
        .order('step_number', { ascending: true });

      if (error) throw error;
      setSteps(data || []);
    } catch (error) {
      console.error('Error fetching steps:', error);
    }
  };

  const extractYouTubeId = (url: string): string => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  const createGuide = async () => {
    try {
      const requirements = formData.requirements.split(',').map(req => req.trim()).filter(req => req);
      const youtube_id = extractYouTubeId(formData.youtube_video_id);

      const { error } = await supabase
        .from('howto_guides')
        .insert([{
          ...formData,
          youtube_video_id: youtube_id,
          requirements
        }]);

      if (error) throw error;
      
      setIsCreateModalOpen(false);
      resetForm();
      fetchGuides();
    } catch (error) {
      console.error('Error creating guide:', error);
    }
  };

  const updateGuide = async () => {
    if (!selectedGuide) return;

    try {
      const requirements = formData.requirements.split(',').map(req => req.trim()).filter(req => req);
      const youtube_id = extractYouTubeId(formData.youtube_video_id);

      const { error } = await supabase
        .from('howto_guides')
        .update({
          ...formData,
          youtube_video_id: youtube_id,
          requirements
        })
        .eq('id', selectedGuide.id);

      if (error) throw error;
      
      setIsEditModalOpen(false);
      resetForm();
      fetchGuides();
    } catch (error) {
      console.error('Error updating guide:', error);
    }
  };

  const deleteGuide = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guide?')) return;

    try {
      const { error } = await supabase
        .from('howto_guides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchGuides();
    } catch (error) {
      console.error('Error deleting guide:', error);
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('howto_guides')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchGuides();
    } catch (error) {
      console.error('Error toggling published status:', error);
    }
  };

  const addStep = async (guideId: string) => {
    try {
      const { error } = await supabase
        .from('howto_guide_steps')
        .insert([{
          guide_id: guideId,
          ...stepFormData
        }]);

      if (error) throw error;
      
      setStepFormData({ title: '', content: '', step_number: steps.length + 1 });
      fetchSteps(guideId);
    } catch (error) {
      console.error('Error adding step:', error);
    }
  };

  const deleteStep = async (stepId: string, guideId: string) => {
    if (!confirm('Are you sure you want to delete this step?')) return;

    try {
      const { error } = await supabase
        .from('howto_guide_steps')
        .delete()
        .eq('id', stepId);

      if (error) throw error;
      fetchSteps(guideId);
    } catch (error) {
      console.error('Error deleting step:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subheading: '',
      duration: 0,
      difficulty_level: 'beginner',
      youtube_video_id: '',
      requirements: '',
      is_published: false
    });
  };

  const openEditModal = (guide: HowToGuide) => {
    setSelectedGuide(guide);
    setFormData({
      title: guide.title,
      description: guide.description || '',
      subheading: guide.subheading || '',
      duration: guide.duration || 0,
      difficulty_level: guide.difficulty_level,
      youtube_video_id: guide.youtube_video_id || '',
      requirements: guide.requirements?.join(', ') || '',
      is_published: guide.is_published
    });
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">How-To Guides Management</h2>
          <p className="text-muted-foreground">Create and manage educational guides for users</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Guide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New How-To Guide</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Guide title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Subheading</label>
                  <Input
                    value={formData.subheading}
                    onChange={(e) => setFormData({ ...formData, subheading: e.target.value })}
                    placeholder="Brief subheading"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Difficulty Level</label>
                  <Select value={formData.difficulty_level} onValueChange={(value: any) => setFormData({ ...formData, difficulty_level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">YouTube Video URL</label>
                <Input
                  value={formData.youtube_video_id}
                  onChange={(e) => setFormData({ ...formData, youtube_video_id: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Requirements (comma-separated)</label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Business registration, Tax ID, Bank account"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <label className="text-sm font-medium">Publish immediately</label>
              </div>

              <div className="flex gap-2">
                <Button onClick={createGuide}>Create Guide</Button>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Guides</p>
              <p className="text-2xl font-bold">{guides.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Eye className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Published</p>
              <p className="text-2xl font-bold">{guides.filter(g => g.is_published).length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Video className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">With Videos</p>
              <p className="text-2xl font-bold">{guides.filter(g => g.youtube_video_id).length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Beginner Level</p>
              <p className="text-2xl font-bold">{guides.filter(g => g.difficulty_level === 'beginner').length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Guides List */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Title</th>
                <th className="text-left p-3 font-medium">Duration</th>
                <th className="text-left p-3 font-medium">Level</th>
                <th className="text-left p-3 font-medium">Video</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Created</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((guide) => (
                <tr key={guide.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{guide.title}</p>
                      <p className="text-sm text-muted-foreground">{guide.subheading}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{guide.duration}m</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={guide.difficulty_level === 'beginner' ? 'default' : 'secondary'}>
                      {guide.difficulty_level}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {guide.youtube_video_id ? (
                      <Video className="h-4 w-4 text-green-600" />
                    ) : (
                      <span className="text-muted-foreground">No video</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={guide.is_published ? 'default' : 'secondary'}>
                        {guide.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      <Switch
                        checked={guide.is_published}
                        onCheckedChange={() => togglePublished(guide.id, guide.is_published)}
                        size="sm"
                      />
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="text-sm">{new Date(guide.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedGuide(guide);
                          fetchSteps(guide.id);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(guide)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteGuide(guide.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit How-To Guide</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Subheading</label>
                <Input
                  value={formData.subheading}
                  onChange={(e) => setFormData({ ...formData, subheading: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Difficulty Level</label>
                <Select value={formData.difficulty_level} onValueChange={(value: any) => setFormData({ ...formData, difficulty_level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">YouTube Video URL</label>
              <Input
                value={formData.youtube_video_id}
                onChange={(e) => setFormData({ ...formData, youtube_video_id: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Requirements (comma-separated)</label>
              <Textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
              <label className="text-sm font-medium">Published</label>
            </div>

            <div className="flex gap-2">
              <Button onClick={updateGuide}>Update Guide</Button>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Steps Management Modal */}
      {selectedGuide && (
        <Dialog open={!!selectedGuide} onOpenChange={() => setSelectedGuide(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Manage Steps: {selectedGuide.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Add New Step */}
              <Card className="p-4">
                <h3 className="font-medium mb-3">Add New Step</h3>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={stepFormData.step_number}
                      onChange={(e) => setStepFormData({ ...stepFormData, step_number: parseInt(e.target.value) || 1 })}
                      placeholder="#"
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      value={stepFormData.title}
                      onChange={(e) => setStepFormData({ ...stepFormData, title: e.target.value })}
                      placeholder="Step title"
                    />
                  </div>
                  <div className="col-span-5">
                    <Textarea
                      value={stepFormData.content}
                      onChange={(e) => setStepFormData({ ...stepFormData, content: e.target.value })}
                      placeholder="Step content"
                      className="min-h-[60px]"
                    />
                  </div>
                  <div className="col-span-2">
                    <Button onClick={() => addStep(selectedGuide.id)} className="w-full">
                      Add Step
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Existing Steps */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {steps.map((step) => (
                  <Card key={step.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Step {step.step_number}</Badge>
                          <h4 className="font-medium">{step.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.content}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteStep(step.id, selectedGuide.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}