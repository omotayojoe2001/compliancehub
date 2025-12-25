import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContextClean";
import { freshDbService } from "@/lib/freshDbService";
import { twilioWhatsAppService } from "@/lib/twilioWhatsAppService";
import { overdueMonitoringService } from "@/lib/overdueMonitoringService";
import { supabase } from "@/lib/supabase";
import { Plus, Calendar, AlertCircle, FileText, Users, CreditCard, Building, AlertTriangle, CheckCircle, Clock, DollarSign } from "lucide-react";

export default function ObligationsWorking() {
  const { user } = useAuth();
  const [obligations, setObligations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    tax_type: '',
    tax_period: '',
    due_date: ''
  });

  const handleMarkAsPaid = async (obligationId: string) => {
    if (!user?.id) return;
    
    const confirmed = confirm('Mark this tax obligation as paid? This will stop all overdue reminders.');
    if (!confirmed) return;
    
    try {
      const success = await overdueMonitoringService.markAsPaid(obligationId, user.id);
      if (success) {
        alert('✅ Marked as paid! You will no longer receive reminders for this obligation.');
        await loadObligations(); // Reload to show updated status
      } else {
        alert('❌ Failed to mark as paid. Please try again.');
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('❌ Failed to mark as paid. Please try again.');
    }
  };

  const getObligationStatus = (obligation: any) => {
    const now = new Date();
    const dueDate = new Date(obligation.next_due_date);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (obligation.payment_status === 'paid') {
      return { status: 'paid', color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Paid' };
    } else if (daysUntilDue < 0) {
      return { status: 'overdue', color: 'bg-red-100 text-red-800', icon: AlertTriangle, text: `${Math.abs(daysUntilDue)} days overdue` };
    } else if (daysUntilDue <= 7) {
      return { status: 'due_soon', color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: `Due in ${daysUntilDue} days` };
    } else {
      return { status: 'pending', color: 'bg-blue-100 text-blue-800', icon: Calendar, text: `Due in ${daysUntilDue} days` };
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadObligations();
    }
  }, [user?.id]);

  const loadObligations = async () => {
    try {
      const data = await freshDbService.getObligations(user?.id || '');
      setObligations(data || []);
    } catch (error) {
      console.error('Failed to load obligations:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !formData.tax_type || !formData.tax_period || !formData.due_date) return;

    setSaving(true);
    try {
      const success = await freshDbService.addObligation(user.id, formData);
      if (success) {
        console.log('✅ Obligation added successfully, starting notifications...');
        
        // Get profile first
        const profile = await freshDbService.getProfile(user.id);
        console.log('👤 Profile data:', profile);
        console.log('👤 Profile phone:', profile?.phone);
        console.log('👤 Profile business_name:', profile?.business_name);
        const userName = profile?.business_name || 'there';
        
        // Send email notification
        console.log('📧 Starting email notification...');
        try {
          const emailPayload = {
            to: user.email,
            subject: 'Tax Obligation Added',
            html: `Hey ${userName}, you just added ${formData.tax_type} for ${formData.tax_period} due ${new Date(formData.due_date).toLocaleDateString()}.`
          };
          console.log('📧 Email payload:', emailPayload);
          
          const emailResponse = await fetch('https://fyhhcqjclcedpylhyjwy.supabase.co/functions/v1/send-email', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8',
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8'
            },
            body: JSON.stringify(emailPayload)
          });
          
          const emailResult = await emailResponse.json();
          console.log('📧 Email response:', emailResult);
          
          if (emailResponse.ok && emailResult.success) {
            console.log('✅ Email sent successfully!');
          } else {
            console.error('❌ Email error:', emailResult);
          }
        } catch (emailError) {
          console.error('❌ Email failed:', emailError);
        }

        // Send WhatsApp notification if user has phone
        console.log('📱 Starting WhatsApp notification...');
        if (profile?.phone) {
          console.log('📱 Phone found:', profile.phone);
          try {
            const whatsappMessage = `Hey ${userName}, you just added ${formData.tax_type} for ${formData.tax_period} due ${new Date(formData.due_date).toLocaleDateString()}.`;
            console.log('📱 WhatsApp message:', whatsappMessage);
            
            // Format phone number for WhatsApp
            let whatsappPhone = profile.phone;
            if (!whatsappPhone.startsWith('whatsapp:')) {
              // Convert Nigerian number format
              if (whatsappPhone.startsWith('0')) {
                whatsappPhone = '+234' + whatsappPhone.substring(1);
              }
              whatsappPhone = 'whatsapp:' + whatsappPhone;
            }
            console.log('📱 Formatted WhatsApp phone:', whatsappPhone);
            
            const whatsappResponse = await twilioWhatsAppService.sendMessage(
              whatsappPhone,
              whatsappMessage
            );
            
            console.log('📱 WhatsApp response:', whatsappResponse);
            console.log('✅ WhatsApp sent successfully!');
          } catch (whatsappError) {
            console.error('❌ WhatsApp failed:', whatsappError);
          }
        } else {
          console.log('❌ No phone number found. Go to Settings to add your phone number for WhatsApp notifications.');
          // Try with test phone number
          try {
            const whatsappMessage = `Hey ${userName}, you just added ${formData.tax_type} for ${formData.tax_period} due ${new Date(formData.due_date).toLocaleDateString()}.`;
            console.log('📱 Trying with test phone number...');
            
            const whatsappResponse = await twilioWhatsAppService.sendMessage(
              '+2347016190271',
              whatsappMessage
            );
            
            console.log('📱 Test WhatsApp response:', whatsappResponse);
            console.log('✅ Test WhatsApp sent successfully!');
          } catch (whatsappError) {
            console.error('❌ Test WhatsApp failed:', whatsappError);
          }
        }

        alert('Tax obligation added successfully!');
        setFormData({ tax_type: '', tax_period: '', due_date: '' });
        setShowForm(false);
        await loadObligations(); // Reload
      } else {
        alert('Failed to add obligation');
      }
    } catch (error) {
      alert('Failed to add obligation');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tax Obligations</h1>
            <p className="text-muted-foreground">Track your Nigerian business tax filing deadlines and get automatic reminders</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Tax Period
          </Button>
        </div>

        {/* Personal Status Message */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Your Tax Status This Month</h3>
              <div className="text-sm text-blue-800">
                {(() => {
                  const now = new Date();
                  const currentMonth = now.getMonth();
                  const currentYear = now.getFullYear();
                  
                  const dueSoon = obligations.filter(obligation => {
                    const dueDate = new Date(obligation.next_due_date);
                    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return daysUntilDue <= 30 && daysUntilDue > 0;
                  });
                  
                  const overdue = obligations.filter(obligation => {
                    const dueDate = new Date(obligation.next_due_date);
                    return dueDate < now;
                  });
                  
                  const thisMonth = obligations.filter(obligation => {
                    const dueDate = new Date(obligation.next_due_date);
                    return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
                  });
                  
                  if (overdue.length > 0) {
                    return (
                      <p className="text-red-700 font-medium">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        You have {overdue.length} overdue tax obligation{overdue.length > 1 ? 's' : ''}. Please file immediately to avoid penalties.
                      </p>
                    );
                  } else if (dueSoon.length > 0) {
                    return (
                      <p className="text-orange-700 font-medium">
                        <Clock className="h-4 w-4 inline mr-1" />
                        You have {dueSoon.length} tax obligation{dueSoon.length > 1 ? 's' : ''} due within 30 days. Stay on top of your deadlines!
                      </p>
                    );
                  } else if (thisMonth.length > 0) {
                    return (
                      <p className="text-blue-700 font-medium">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        You have {thisMonth.length} tax obligation{thisMonth.length > 1 ? 's' : ''} due this month. We'll remind you before each deadline.
                      </p>
                    );
                  } else if (obligations.length > 0) {
                    return (
                      <p className="text-green-700 font-medium">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Great! All your tax obligations are up to date. We'll notify you when deadlines approach.
                      </p>
                    );
                  } else {
                    return (
                      <p className="text-blue-700">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        Add your tax obligations below to start receiving automatic deadline reminders.
                      </p>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Educational Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            How Tax Obligations Work
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Tax Period:</strong> The month/year you're filing taxes for (e.g., June 2025 taxes)</p>
            <p><strong>Due Date:</strong> When you must file and pay to avoid penalties</p>
            <p><strong>Reminders:</strong> We'll send you email and WhatsApp alerts 7, 3, and 1 days before each deadline</p>
          </div>
        </div>

        {/* Tax Types Guide */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card p-4 rounded-lg border">
            <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              VAT
            </h4>
            <p className="text-xs text-muted-foreground mb-2">Value Added Tax</p>
            <p className="text-sm">Monthly filing for businesses with ₦25M+ annual turnover</p>
            <p className="text-xs text-green-600 font-medium">Due: 21st of following month</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              PAYE
            </h4>
            <p className="text-xs text-muted-foreground mb-2">Pay As You Earn</p>
            <p className="text-sm">Monthly employee income tax remittance</p>
            <p className="text-xs text-blue-600 font-medium">Due: 10th of following month</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              WHT
            </h4>
            <p className="text-xs text-muted-foreground mb-2">Withholding Tax</p>
            <p className="text-sm">Tax deducted from payments to suppliers/contractors</p>
            <p className="text-xs text-purple-600 font-medium">Due: 21st of following month</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
              <Building className="h-4 w-4" />
              CAC
            </h4>
            <p className="text-xs text-muted-foreground mb-2">Annual Returns</p>
            <p className="text-sm">Yearly company information filing</p>
            <p className="text-xs text-orange-600 font-medium">Due: 42 days after anniversary</p>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Add New Tax Obligation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tell us which tax you need to file and for which period. We'll calculate the due date and send you reminders.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="tax_type">Tax Type</Label>
                  <Select value={formData.tax_type} onValueChange={(value) => setFormData({...formData, tax_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose the tax you need to file" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VAT">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          VAT - Value Added Tax (Monthly)
                        </div>
                      </SelectItem>
                      <SelectItem value="PAYE">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          PAYE - Employee Income Tax (Monthly)
                        </div>
                      </SelectItem>
                      <SelectItem value="WHT">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          WHT - Withholding Tax (Monthly)
                        </div>
                      </SelectItem>
                      <SelectItem value="CAC">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          CAC - Annual Returns (Yearly)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select the type of tax you need to file
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="tax_period">Tax Period</Label>
                  <Input
                    id="tax_period"
                    type="month"
                    value={formData.tax_period}
                    onChange={(e) => setFormData({...formData, tax_period: e.target.value})}
                    max={new Date().toISOString().slice(0, 7)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Which month/year are you filing taxes for?
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="due_date">Filing Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    When must you file and pay this tax?
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <strong>Remember:</strong> We'll send you automatic reminders 7, 3, and 1 days before your due date via email and WhatsApp.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? 'Adding Tax Period...' : 'Add Tax Period & Set Reminders'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 sm:flex-none">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Obligations List */}
        <div className="space-y-4">
          {obligations.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tax obligations yet</h3>
              <p className="text-muted-foreground mb-4">Add your first tax obligation to get started</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Obligation
              </Button>
            </div>
          ) : (
            obligations.map((obligation: any) => {
              const taxTypeInfo = {
                'VAT': { icon: FileText, color: 'text-green-700', desc: 'Value Added Tax for businesses with ₦25M+ turnover' },
                'PAYE': { icon: Users, color: 'text-blue-700', desc: 'Employee income tax remittance' },
                'WHT': { icon: CreditCard, color: 'text-purple-700', desc: 'Tax withheld from supplier payments' },
                'CAC': { icon: Building, color: 'text-orange-700', desc: 'Annual company information filing' }
              };
              const info = taxTypeInfo[obligation.obligation_type] || { icon: FileText, color: 'text-gray-700', desc: 'Tax obligation' };
              const IconComponent = info.icon;
              
              return (
                <div key={obligation.id} className="bg-card p-4 rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="h-4 w-4" />
                        <h3 className={`font-semibold ${info.color}`}>{obligation.obligation_type}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{info.desc}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          <strong>Tax Period:</strong> {new Date(obligation.tax_period + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <Calendar className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-600">
                          Due: {new Date(obligation.next_due_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Added: {new Date(obligation.created_at || Date.now()).toLocaleDateString()}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const statusInfo = getObligationStatus(obligation);
                            const StatusIcon = statusInfo.icon;
                            return (
                              <span className={`inline-block px-2 py-1 rounded-full text-xs flex items-center gap-1 ${statusInfo.color}`}>
                                <StatusIcon className="h-3 w-3" /> {statusInfo.text}
                              </span>
                            );
                          })()}
                          {obligation.payment_status !== 'paid' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleMarkAsPaid(obligation.id)}
                              className="text-xs h-6 px-2"
                            >
                              <DollarSign className="h-3 w-3 mr-1" />
                              Mark as Paid
                            </Button>
                          )}
                        </div>
                        <span className="text-xs text-blue-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {obligation.payment_status === 'paid' ? 'Reminders Stopped' : 'Reminders On'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}