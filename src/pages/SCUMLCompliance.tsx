import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Building, Calendar, FileText, AlertCircle } from 'lucide-react';

export default function SCUMLCompliance() {
  const scumlRequirements = [
    {
      title: 'Annual Registration Renewal',
      description: 'Renew your SCUML registration annually',
      dueDate: 'March 31st',
      status: 'upcoming'
    },
    {
      title: 'Quarterly Returns',
      description: 'Submit quarterly business returns',
      dueDate: 'Every Quarter End',
      status: 'pending'
    },
    {
      title: 'Compliance Certificate',
      description: 'Obtain compliance certificate',
      dueDate: 'Annually',
      status: 'completed'
    }
  ];

  const applicableBusinesses = [
    'Microfinance Banks',
    'Bureau de Change',
    'Primary Mortgage Institutions',
    'Finance Companies',
    'Debt Recovery Agents',
    'Credit Bureaus',
    'Microfinance Institutions',
    'Money Lenders'
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">SCUML Compliance</h1>
          <p className="text-muted-foreground">
            Specialized Control Unit against Money Laundering compliance requirements
          </p>
        </div>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-4">
            <Building className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">About SCUML</h3>
              <p className="text-blue-700">
                The Specialized Control Unit against Money Laundering (SCUML) regulates 
                designated non-financial businesses and professions in Nigeria.
              </p>
              <a 
                href="https://scuml.gov.ng" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline mt-2"
              >
                Visit SCUML Website <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Applicable Businesses</h3>
            <div className="space-y-2">
              {applicableBusinesses.map((business, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">{business}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Key Requirements</h3>
            <div className="space-y-4">
              {scumlRequirements.map((req, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">{req.title}</h4>
                  <p className="text-sm text-muted-foreground">{req.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">{req.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">SCUML Compliance Checklist</h3>
          <div className="space-y-3">
            {[
              'Register with SCUML as a designated non-financial business',
              'Appoint a Compliance Officer',
              'Develop Anti-Money Laundering (AML) policies',
              'Conduct Customer Due Diligence (CDD)',
              'File Suspicious Transaction Reports (STRs)',
              'Submit quarterly returns to SCUML',
              'Renew registration annually',
              'Maintain proper records and documentation'
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900">Important Notice</h4>
              <p className="text-orange-800 text-sm mt-1">
                Non-compliance with SCUML requirements may result in penalties, 
                sanctions, or suspension of business operations. Ensure timely 
                submission of all required documents and reports.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}