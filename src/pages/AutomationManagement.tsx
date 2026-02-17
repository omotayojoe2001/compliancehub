import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { emailService } from '@/lib/emailService';
import { whatsappService } from '@/lib/whatsappService';
import { Pencil, Power, PowerOff, Send } from 'lucide-react';

interface AutomationTemplate {
  id: string;
  automation_type: string;
  name: string;
  description: string;
  send_via_email: boolean;
  send_via_whatsapp: boolean;
  trigger_event: string;
  delay_minutes: number;
  days_before_due: number | null;
  email_subject: string | null;
  email_body: string | null;
  whatsapp_message: string | null;
  is_active: boolean;
}

export default function AutomationManagement() {
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AutomationTemplate>>({});
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendTarget, setSendTarget] = useState<'all' | 'individual'>('all');
  const [sendEmail, setSendEmail] = useState('');
  const [sendPhone, setSendPhone] = useState('');
  const [sendSubject, setSendSubject] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(false);
  const [sending, setSending] = useState(false);
  const [scheduleType, setScheduleType] = useState<'now' | 'scheduled'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('email, phone, business_name, client_name')
      .order('client_name');
    
    if (data) setUsers(data);
  };

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('automation_templates')
      .select('*')
      .order('automation_type', { ascending: true })
      .order('days_before_due', { ascending: false });

    if (!error && data) {
      setTemplates(data);
    }
    setLoading(false);
  };

  const startEdit = (template: AutomationTemplate) => {
    setEditing(template.id);
    setEditForm(template);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditForm({});
  };

  const saveTemplate = async () => {
    if (!editing) return;

    const { error } = await supabase
      .from('automation_templates')
      .update({
        ...editForm,
        updated_at: new Date().toISOString()
      })
      .eq('id', editing);

    if (!error) {
      alert('Automation updated successfully!');
      setEditing(null);
      setEditForm({});
      loadTemplates();
    } else {
      alert('Failed to update automation');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('automation_templates')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (!error) {
      loadTemplates();
    }
  };

  const sendInstantMessage = async () => {
    if (!sendMessage) {
      alert('Please enter a message');
      return;
    }

    if (scheduleType === 'scheduled' && (!scheduleDate || !scheduleTime)) {
      alert('Please select date and time for scheduled message');
      return;
    }

    setSending(true);
    try {
      // Calculate delay if scheduled
      let delay = 0;
      if (scheduleType === 'scheduled') {
        const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        const now = new Date();
        delay = scheduledDateTime.getTime() - now.getTime();
        
        if (delay < 0) {
          alert('Scheduled time must be in the future');
          setSending(false);
          return;
        }
      }

      const sendMessages = async () => {
        if (sendTarget === 'all') {
          // Send to all users
          const { data: users } = await supabase
            .from('profiles')
            .select('email, phone, business_name');

          if (users) {
            let sent = 0;
            for (const user of users) {
              const message = sendMessage.replace('{{business_name}}', user.business_name || 'there');
              
              if (sendViaEmail && user.email) {
                await emailService.sendEmail({
                  to: user.email,
                  subject: sendSubject,
                  body: message
                });
                sent++;
              }
              
              if (sendViaWhatsApp && user.phone) {
                await whatsappService.sendMessage(user.phone, message);
                sent++;
              }
            }
            alert(`Message sent to ${sent} recipients!`);
          }
        } else {
          // Send to individual
          if (sendViaEmail && sendEmail) {
            await emailService.sendEmail({
              to: sendEmail,
              subject: sendSubject,
              body: sendMessage
            });
          }
          
          if (sendViaWhatsApp && sendPhone) {
            await whatsappService.sendMessage(sendPhone, sendMessage);
          }
          
          alert('Message sent successfully!');
        }
      };

      if (scheduleType === 'scheduled') {
        // Save to database for backend processing
        const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        
        const { error: scheduleError } = await supabase
          .from('scheduled_messages')
          .insert({
            target_type: sendTarget,
            target_email: sendTarget === 'individual' ? sendEmail : null,
            target_phone: sendTarget === 'individual' ? sendPhone : null,
            send_via_email: sendViaEmail,
            send_via_whatsapp: sendViaWhatsApp,
            email_subject: sendSubject,
            message_body: sendMessage,
            scheduled_time: scheduledDateTime.toISOString(),
            status: 'pending'
          });
        
        if (scheduleError) {
          alert('Failed to schedule message');
          setSending(false);
          return;
        }
        
        alert(`Message scheduled for ${scheduleDate} at ${scheduleTime}`);
      } else {
        await sendMessages();
      }
      
      setShowSendModal(false);
      setSendMessage('');
      setSendSubject('');
      setSendEmail('');
      setSendPhone('');
    } catch (error) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <AdminLayout><div>Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Automation Management</h1>
            <p className="text-muted-foreground">Manage email and WhatsApp automations</p>
          </div>
          <Button onClick={() => setShowSendModal(true)}>
            <Send className="h-4 w-4 mr-2" /> Send Instant Message
          </Button>
        </div>

        {editing ? (
          <div className="bg-white p-6 rounded-lg border space-y-4">
            <h2 className="text-lg font-semibold">Edit Automation</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.send_via_email || false}
                    onChange={(e) => setEditForm({ ...editForm, send_via_email: e.target.checked })}
                  />
                  <span className="text-sm">Email</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.send_via_whatsapp || false}
                    onChange={(e) => setEditForm({ ...editForm, send_via_whatsapp: e.target.checked })}
                  />
                  <span className="text-sm">WhatsApp</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Delay (min)</label>
                <input
                  type="number"
                  value={editForm.delay_minutes || 0}
                  onChange={(e) => setEditForm({ ...editForm, delay_minutes: parseInt(e.target.value) })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              {(editForm.automation_type === 'tax_reminder' || editForm.automation_type === 'payment_reminder') && (
                <div>
                  <label className="block text-sm font-medium mb-2">Days Before</label>
                  <input
                    type="number"
                    value={editForm.days_before_due || 0}
                    onChange={(e) => setEditForm({ ...editForm, days_before_due: parseInt(e.target.value) })}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              )}
            </div>

            {editForm.send_via_email && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Subject</label>
                  <input
                    type="text"
                    value={editForm.email_subject || ''}
                    onChange={(e) => setEditForm({ ...editForm, email_subject: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Body</label>
                  <textarea
                    value={editForm.email_body || ''}
                    onChange={(e) => setEditForm({ ...editForm, email_body: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 h-32"
                  />
                </div>
              </div>
            )}

            {editForm.send_via_whatsapp && (
              <div>
                <label className="block text-sm font-medium mb-2">WhatsApp Message</label>
                <textarea
                  value={editForm.whatsapp_message || ''}
                  onChange={(e) => setEditForm({ ...editForm, whatsapp_message: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 h-32"
                />
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Variables: {'{{'}business_name{'}}'}, {'{{'}due_date{'}}'}, {'{{'}tax_period{'}}'}, {'{{'}amount{'}}'}, {'{{'}invoice_number{'}}'}, {'{{'}client_name{'}}'}
            </div>

            <div className="flex gap-3">
              <Button onClick={saveTemplate}>Save Changes</Button>
              <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Channels</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Timing</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{template.automation_type}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {template.send_via_email && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Email</span>}
                        {template.send_via_whatsapp && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">WhatsApp</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {template.days_before_due ? `${template.days_before_due}d before` : template.delay_minutes > 0 ? `${template.delay_minutes}m delay` : 'Immediate'}
                    </td>
                    <td className="px-4 py-3">
                      {template.is_active ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1 w-fit">
                          <Power className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded flex items-center gap-1 w-fit">
                          <PowerOff className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => startEdit(template)}>
                          <Pencil className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button
                          variant={template.is_active ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => toggleActive(template.id, template.is_active)}
                        >
                          {template.is_active ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Send Instant Message Modal */}
        {showSendModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Send Instant Message</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Send To</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={sendTarget === 'all'}
                        onChange={() => setSendTarget('all')}
                      />
                      <span>All Registered Users</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={sendTarget === 'individual'}
                        onChange={() => setSendTarget('individual')}
                      />
                      <span>Individual User</span>
                    </label>
                  </div>
                </div>

                {sendTarget === 'individual' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Search User</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowUserDropdown(true);
                          }}
                          onFocus={() => setShowUserDropdown(true)}
                          className="w-full border rounded-md px-3 py-2"
                          placeholder="Search by name, email, or phone..."
                        />
                        {showUserDropdown && searchTerm && (
                          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {users
                              .filter(u => 
                                u.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                u.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                u.phone?.includes(searchTerm)
                              )
                              .map((user, idx) => (
                                <div
                                  key={idx}
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => {
                                    setSendEmail(user.email);
                                    setSendPhone(user.phone);
                                    setSearchTerm(user.client_name || user.business_name || user.email);
                                    setShowUserDropdown(false);
                                  }}
                                >
                                  <div className="font-medium">{user.client_name || user.business_name}</div>
                                  <div className="text-sm text-gray-600">{user.email}</div>
                                  {user.phone && <div className="text-xs text-gray-500">{user.phone}</div>}
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={sendEmail}
                          onChange={(e) => setSendEmail(e.target.value)}
                          className="w-full border rounded-md px-3 py-2 bg-gray-50"
                          placeholder="user@example.com"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <input
                          type="tel"
                          value={sendPhone}
                          onChange={(e) => setSendPhone(e.target.value)}
                          className="w-full border rounded-md px-3 py-2 bg-gray-50"
                          placeholder="2348012345678"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Send Time</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={scheduleType === 'now'}
                        onChange={() => setScheduleType('now')}
                      />
                      <span>Send Now</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={scheduleType === 'scheduled'}
                        onChange={() => setScheduleType('scheduled')}
                      />
                      <span>Schedule</span>
                    </label>
                  </div>
                </div>

                {scheduleType === 'scheduled' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date</label>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full border rounded-md px-3 py-2"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Time</label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sendViaEmail}
                      onChange={(e) => setSendViaEmail(e.target.checked)}
                    />
                    <span>Send via Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sendViaWhatsApp}
                      onChange={(e) => setSendViaWhatsApp(e.target.checked)}
                    />
                    <span>Send via WhatsApp</span>
                  </label>
                </div>

                {sendViaEmail && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Subject</label>
                    <input
                      type="text"
                      value={sendSubject}
                      onChange={(e) => setSendSubject(e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Enter subject"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={sendMessage}
                    onChange={(e) => setSendMessage(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 h-32"
                    placeholder="Enter your message..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {'{{'}business_name{'}}'} for personalization
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowSendModal(false)} disabled={sending}>
                    Cancel
                  </Button>
                  <Button onClick={sendInstantMessage} disabled={sending}>
                    {sending ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
