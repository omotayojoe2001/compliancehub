import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Building, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextClean';
import { comprehensiveDbService } from '@/lib/comprehensiveDbService';

export default function AddObligation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    obligation_type: '',
    description: '',
    registration_date: '',
    registration_month_year: '',
    know_exact_date: true,
    frequency: 'monthly',
    amount: '',
    tin: '',
    business_name: '',
    custom_notes: ''
  });

  const obligationTypes = [
    { 
      value: 'VAT', 
      label: 'VAT (Value Added Tax)', 
      description: 'Monthly VAT returns - ₦5,000-50,000 typical',
      dueRule: 'Monthly - 21st of following month',
      autoFrequency: 'monthly',
      needsHelp: true,
      helpText: 'Need help with VAT filing? We can connect you with certified tax consultants.'
    },
    { 
      value: 'PAYE', 
      label: 'PAYE (Pay As You Earn)', 
      description: 'Monthly employee tax deductions - varies by salary',
      dueRule: 'Monthly - 10th of following month',
      autoFrequency: 'monthly',
      needsHelp: true,
      helpText: 'PAYE calculations can be complex. Get professional help for accurate filing.'
    },
    { 
      value: 'CAC', 
      label: 'CAC Annual Returns', 
      description: 'Company registration renewal - ₦10,000 fee',
      dueRule: '18 months after incorporation/last filing',
      autoFrequency: '18months',
      needsHelp: true,
      helpText: 'CAC filing requires specific documents. We can help you prepare and file.'
    },
    { 
      value: 'CIT', 
      label: 'CIT (Company Income Tax)', 
      description: 'Annual company income tax - 30% of profits',
      dueRule: 'Annually - 6 months after year end',
      autoFrequency: 'annually',
      needsHelp: true,
      helpText: 'CIT requires detailed financial statements. Professional help recommended.'
    },
    { 
      value: 'Personal Income', 
      label: 'Personal Income Tax', 
      description: 'Individual income tax - varies by state',
      dueRule: 'Annually - March 31st',
      autoFrequency: 'annually',
      needsHelp: false,
      helpText: ''
    }
  ];

  const calculateDueDate = (registrationDate: string, obligationType: string) => {
    if (!registrationDate || !obligationType) return '';
    
    const regDate = new Date(registrationDate);
    const selectedType = obligationTypes.find(type => type.value === obligationType);
    
    if (!selectedType) return '';
    
    let dueDate = new Date(regDate);
    
    switch (obligationType) {
      case 'VAT':
      case 'PAYE':
      case 'WHT':
        // Next month, 21st for VAT/WHT, 10th for PAYE
        dueDate.setMonth(dueDate.getMonth() + 1);
        dueDate.setDate(obligationType === 'PAYE' ? 10 : 21);
        break;
      case 'CAC':
        // 18 months after registration
        dueDate.setMonth(dueDate.getMonth() + 18);
        break;
      case 'CIT':
        // 6 months after year end (assuming Dec 31 year end)
        dueDate.setFullYear(dueDate.getFullYear() + 1);
        dueDate.setMonth(5); // June
        dueDate.setDate(30);
        break;
      case 'Personal Income':
        // Next March 31st
        dueDate.setFullYear(dueDate.getFullYear() + 1);
        dueDate.setMonth(2); // March
        dueDate.setDate(31);
        break;
      default:
        return '';
    }
    
    return dueDate.toISOString().split('T')[0];
  };

  const calculateFromMonthYear = (monthYear: string, obligationType: string) => {
    if (!monthYear || !obligationType) return '';
    
    // monthYear format: "2024-01" (year-month)
    const [year, month] = monthYear.split('-');
    const regDate = new Date(parseInt(year), parseInt(month) - 1, 15); // Use 15th as default day
    
    return calculateDueDate(regDate.toISOString().split('T')[0], obligationType);
  };

  const getUniqueQuestions = (obligationType: string) => {
    switch (obligationType) {
      case 'VAT':
        return {
          primaryQuestion: 'What is your monthly sales/turnover?',
          secondaryQuestion: 'When did you register for VAT?',
          amountLabel: 'Monthly Sales Amount (₦)',
          amountHelp: 'Your total monthly sales. VAT = 7.5% of this amount',
          registrationLabel: 'VAT Registration Date',
          registrationHelp: 'When did FIRS approve your VAT registration?'
        };
      case 'PAYE':
        return {
          primaryQuestion: 'How many employees do you have?',
          secondaryQuestion: 'What is your total monthly salary bill?',
          amountLabel: 'Total Monthly Salaries (₦)',
          amountHelp: 'Total amount you pay all employees monthly',
          registrationLabel: 'First Employee Hire Date',
          registrationHelp: 'When did you hire your first employee?'
        };
      case 'CAC':
        return {
          primaryQuestion: 'When was your company incorporated?',
          secondaryQuestion: 'What type of company is it?',
          amountLabel: 'CAC Renewal Fee (₦)',
          amountHelp: 'Standard CAC annual return fee is ₦10,000',
          registrationLabel: 'Company Incorporation Date',
          registrationHelp: 'Date on your Certificate of Incorporation'
        };
      case 'CIT':
        return {
          primaryQuestion: 'What is your financial year-end?',
          secondaryQuestion: 'What was your last annual profit?',
          amountLabel: 'Expected Annual Profit (₦)',
          amountHelp: 'CIT = 30% of your annual profit',
          registrationLabel: 'Company Registration Date',
          registrationHelp: 'When was your company first registered?'
        };
      case 'Personal Income':
        return {
          primaryQuestion: 'What is your annual income?',
          secondaryQuestion: 'Which state do you reside in?',
          amountLabel: 'Annual Income (₦)',
          amountHelp: 'Your total yearly income from all sources',
          registrationLabel: 'First Income Date',
          registrationHelp: 'When did you start earning this income?'
        };
      default:
        return {
          primaryQuestion: 'When did you register for this obligation?',
          secondaryQuestion: 'What is the expected amount?',
          amountLabel: 'Expected Amount (₦)',
          amountHelp: 'Estimated payment amount',
          registrationLabel: 'Registration Date',
          registrationHelp: 'When did you register for this?'
        };
    }
  };

  const uniqueQuestions = getUniqueQuestions(formData.obligation_type);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !formData.obligation_type) return;

    let dueDate = '';
    if (formData.know_exact_date && formData.registration_date) {
      dueDate = calculateDueDate(formData.registration_date, formData.obligation_type);
    } else if (!formData.know_exact_date && formData.registration_month_year) {
      dueDate = calculateFromMonthYear(formData.registration_month_year, formData.obligation_type);
    }

    if (!dueDate) {
      alert('Please provide registration information to calculate due date');
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      const selectedType = obligationTypes.find(type => type.value === formData.obligation_type);
      
      await comprehensiveDbService.createTaxObligation(user.id, {
        obligation_type: formData.obligation_type,
        description: formData.description || `${formData.obligation_type} compliance requirement`,
        due_date: dueDate,
        frequency: selectedType?.autoFrequency || formData.frequency,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        status: 'pending',
        metadata: {
          registration_date: formData.registration_date,
          registration_month_year: formData.registration_month_year,
          know_exact_date: formData.know_exact_date,
          tin: formData.tin,
          business_name: formData.business_name,
          custom_notes: formData.custom_notes,
          auto_calculated: true
        }
      });

      await comprehensiveDbService.logActivity(
        user.id, 
        'obligation_added', 
        `Added new ${formData.obligation_type} obligation with auto-calculated due date`
      );

      setSaved(true);
      setTimeout(() => {
        navigate('/obligations');
      }, 2000);

    } catch (error) {
      console.error('Error saving obligation:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedType = obligationTypes.find(type => type.value === formData.obligation_type);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Add Tax Obligation</h1>
          <p className="text-muted-foreground">Add a new tax obligation to start tracking and receiving reminders</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Obligation Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Tax Type *</label>
                <select 
                  value={formData.obligation_type}
                  onChange={(e) => {
                    updateFormData('obligation_type', e.target.value);
                    const selectedType = obligationTypes.find(type => type.value === e.target.value);
                    if (selectedType) {
                      updateFormData('frequency', selectedType.autoFrequency);
                    }
                  }}
                  className="w-full border border-border rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select tax type</option>
                  {obligationTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {selectedType && (
                  <div className="mt-2 p-3 bg-blue-50 rounded text-sm">
                    <p className="text-blue-800 font-medium">{selectedType.description}</p>
                    <p className="text-blue-600 text-xs mt-1">Due: {selectedType.dueRule}</p>
                    {selectedType.needsHelp && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-green-700 text-xs">{selectedType.helpText}</p>
                        <button 
                          type="button"
                          className="text-green-600 text-xs underline mt-1"
                          onClick={() => alert('Professional help feature coming soon!')}
                        >
                          Get Professional Help
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{uniqueQuestions.registrationLabel} *</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      name="know_date"
                      checked={formData.know_exact_date}
                      onChange={() => updateFormData('know_exact_date', true)}
                      className="rounded" 
                    />
                    <span className="text-sm">Yes, I know the exact date</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      name="know_date"
                      checked={!formData.know_exact_date}
                      onChange={() => updateFormData('know_exact_date', false)}
                      className="rounded" 
                    />
                    <span className="text-sm">No, I only remember the month/year</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{uniqueQuestions.registrationHelp}</p>
              </div>

              {formData.know_exact_date ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Registration Date *</label>
                  <input 
                    type="date" 
                    value={formData.registration_date}
                    onChange={(e) => updateFormData('registration_date', e.target.value)}
                    className="w-full border border-border rounded-md px-3 py-2"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">When did you register for this tax/license?</p>
                  {formData.registration_date && formData.obligation_type && (
                    <div className="mt-2">
                      <p className="text-xs text-green-600">
                        Next due date will be: {calculateDueDate(formData.registration_date, formData.obligation_type)}
                      </p>
                      {(() => {
                        const dueDate = new Date(calculateDueDate(formData.registration_date, formData.obligation_type));
                        const today = new Date();
                        const isOverdue = dueDate < today;
                        if (isOverdue) {
                          const daysPast = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                          return (
                            <p className="text-xs text-red-600 font-medium mt-1">
                              ⚠️ OVERDUE by {daysPast} days!
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">Registration Month/Year *</label>
                  <input 
                    type="month" 
                    value={formData.registration_month_year}
                    onChange={(e) => updateFormData('registration_month_year', e.target.value)}
                    className="w-full border border-border rounded-md px-3 py-2"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Select the month and year you registered</p>
                  {formData.registration_month_year && formData.obligation_type && (
                    <p className="text-xs text-green-600 mt-1">
                      Next due date will be: {calculateFromMonthYear(formData.registration_month_year, formData.obligation_type)}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">{uniqueQuestions.amountLabel}</label>
                <input 
                  type="number" 
                  value={formData.amount}
                  onChange={(e) => updateFormData('amount', e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-border rounded-md px-3 py-2"
                />
                <p className="text-xs text-muted-foreground mt-1">{uniqueQuestions.amountHelp}</p>
                {formData.obligation_type === 'CIT' && formData.amount && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-700 text-sm font-medium">
                      CIT Tax Due: ₦{(parseFloat(formData.amount) * 0.30).toLocaleString()}
                    </p>
                    <p className="text-green-600 text-xs">30% of ₦{parseFloat(formData.amount).toLocaleString()}</p>
                  </div>
                )}
                {formData.obligation_type === 'VAT' && formData.amount && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-blue-700 text-sm font-medium">
                      VAT Due: ₦{(parseFloat(formData.amount) * 0.075).toLocaleString()}
                    </p>
                    <p className="text-blue-600 text-xs">7.5% of ₦{parseFloat(formData.amount).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Additional details about this obligation..."
                className="w-full border border-border rounded-md px-3 py-2"
                rows={3}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Business Name</label>
                <input 
                  type="text" 
                  value={formData.business_name}
                  onChange={(e) => updateFormData('business_name', e.target.value)}
                  placeholder="Your business name"
                  className="w-full border border-border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tax ID (TIN)</label>
                <input 
                  type="text" 
                  value={formData.tin}
                  onChange={(e) => updateFormData('tin', e.target.value)}
                  placeholder="12345678-0001"
                  className="w-full border border-border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Registration Date</label>
                <input 
                  type="date" 
                  value={formData.registration_date}
                  onChange={(e) => updateFormData('registration_date', e.target.value)}
                  className="w-full border border-border rounded-md px-3 py-2"
                />
                <p className="text-xs text-muted-foreground mt-1">When did you register for this tax?</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Custom Notes</label>
                <input 
                  type="text" 
                  value={formData.custom_notes}
                  onChange={(e) => updateFormData('custom_notes', e.target.value)}
                  placeholder="Any special notes or reminders"
                  className="w-full border border-border rounded-md px-3 py-2"
                />
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/obligations')}
            >
              Cancel
            </Button>
            
            <Button 
              type="submit"
              disabled={saving || !formData.obligation_type || (!formData.registration_date && !formData.registration_month_year)}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Added Successfully!
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Obligation
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}