import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { Save, Edit, Mail, MessageSquare, RefreshCw } from 'lucide-react';

interface Template {
  id: string;
  template_name: string;
  template_type: string;
  subject: string;
  message_body: string;
  send_via_email: boolean;
  send_via_whatsapp: boolean;
  is_active: boolean;
}

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Template>>({});

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('template_type', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: Template) => {
    setEditing(template.id);
    setEditData(template);
  };

  const handleSave = async (id: string) => {
    setSaving(id);
    try {
      const { error } = await supabase
        .from('message_templates')
        .update({
          subject: editData.subject,
          message_body: editData.message_body,
          send_via_email: editData.send_via_email,
          send_via_whatsapp: editData.send_via_whatsapp,
          is_active: editData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      await loadTemplates();
      setEditing(null);
      setEditData({});
      alert('Template updated successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setSaving(null);
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setEditData({});
  };

  if (loading) {
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
            <h1 className="text-3xl font-bold text-foreground">Message Templates</h1>
            <p className="text-muted-foreground">Manage automated email and WhatsApp message templates</p>
          </div>
          <Button onClick={loadTemplates} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
          <h3 className="font-medium text-blue-800 mb-2">Available Variables:</h3>
          <p className="text-sm text-blue-700">
            Use these in your messages: <code className="bg-blue-100 px-1 rounded">{'{{business_name}}'}</code>, 
            <code className="bg-blue-100 px-1 rounded ml-2">{'{{due_date}}'}</code>, 
            <code className="bg-blue-100 px-1 rounded ml-2">{'{{expiry_date}}'}</code>
          </p>
        </div>

        <div className="grid gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="p-6">
              {editing === template.id ? (
                <div className="space-y-4">
                  <div>
                    <Label>Template Name</Label>
                    <Input value={template.template_name} disabled className="bg-gray-50" />
                  </div>

                  <div>
                    <Label>Email Subject</Label>
                    <Input
                      value={editData.subject || ''}
                      onChange={(e) => setEditData({...editData, subject: e.target.value})}
                      placeholder="Email subject line"
                    />
                  </div>

                  <div>
                    <Label>Message Body</Label>
                    <Textarea
                      value={editData.message_body || ''}
                      onChange={(e) => setEditData({...editData, message_body: e.target.value})}
                      rows={8}
                      placeholder="Message content"
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editData.send_via_email}
                        onChange={(e) => setEditData({...editData, send_via_email: e.target.checked})}
                        className="h-4 w-4"
                      />
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Send via Email</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editData.send_via_whatsapp}
                        onChange={(e) => setEditData({...editData, send_via_whatsapp: e.target.checked})}
                        className="h-4 w-4"
                      />
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">Send via WhatsApp</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editData.is_active}
                        onChange={(e) => setEditData({...editData, is_active: e.target.checked})}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Active</span>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => handleSave(template.id)} disabled={saving === template.id}>
                      {saving === template.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{template.template_name}</h3>
                      <p className="text-sm text-muted-foreground">Type: {template.template_type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {template.send_via_email && <Mail className="h-4 w-4 text-blue-600" title="Email" />}
                      {template.send_via_whatsapp && <MessageSquare className="h-4 w-4 text-green-600" title="WhatsApp" />}
                      <span className={`px-2 py-1 rounded text-xs ${template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {template.subject && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Subject:</p>
                      <p className="text-sm">{template.subject}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Message:</p>
                    <pre className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">{template.message_body}</pre>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
