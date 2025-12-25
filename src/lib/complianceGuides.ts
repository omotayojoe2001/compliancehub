export interface Guide {
  id: string;
  title: string;
  description: string;
  category: 'VAT' | 'PAYE' | 'CAC' | 'WHT' | 'General';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  steps: GuideStep[];
  requirements: string[];
  tips: string[];
}

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  warning?: string;
  documents?: string[];
  videoUrl?: string;
}

export const complianceGuides: Guide[] = [
  {
    id: 'vat-filing-firs',
    title: 'FIRS VAT Filing Steps',
    description: 'Complete step-by-step guide to file your VAT returns with FIRS online',
    category: 'VAT',
    difficulty: 'Beginner',
    estimatedTime: '30-45 minutes',
    requirements: [
      'FIRS TIN (Tax Identification Number)',
      'VAT Certificate',
      'Monthly sales and purchase records',
      'Bank statements',
      'Internet connection'
    ],
    tips: [
      'File before the 21st of every month to avoid penalties',
      'Keep all receipts and invoices as backup',
      'Double-check calculations before submitting',
      'Save confirmation receipt after filing'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Visit FIRS Online Portal',
        description: 'Go to the official FIRS website and log into your taxpayer portal',
        action: 'Navigate to https://www.firs.gov.ng and click "Taxpayer Portal"',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      },
      {
        id: 'step-2',
        title: 'Login to Your Account',
        description: 'Use your TIN and password to access your taxpayer dashboard',
        action: 'Enter your TIN as username and your registered password',
        warning: 'If you forgot your password, use the "Forgot Password" link'
      },
      {
        id: 'step-3',
        title: 'Select VAT Returns',
        description: 'Navigate to the VAT section and select monthly returns',
        action: 'Click on "Returns" → "VAT" → "Monthly Returns"'
      },
      {
        id: 'step-4',
        title: 'Fill Return Details',
        description: 'Enter your monthly VAT details including sales, purchases, and VAT collected',
        documents: ['Sales invoices', 'Purchase receipts', 'VAT certificates'],
        warning: 'Ensure all figures are accurate - errors can lead to penalties',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      },
      {
        id: 'step-5',
        title: 'Calculate VAT Payable',
        description: 'The system will automatically calculate your VAT liability',
        action: 'Review the calculated amount: Output VAT - Input VAT = VAT Payable'
      },
      {
        id: 'step-6',
        title: 'Submit and Pay',
        description: 'Submit your return and make payment if VAT is due',
        action: 'Click "Submit" then proceed to payment if amount is due',
        warning: 'Payment must be made immediately after filing to avoid penalties'
      },
      {
        id: 'step-7',
        title: 'Download Receipt',
        description: 'Save your filing confirmation and payment receipt',
        action: 'Download and print both the return acknowledgment and payment receipt'
      }
    ]
  },
  {
    id: 'cac-annual-returns',
    title: 'CAC Annual Returns Guide',
    description: 'How to file your annual returns with Corporate Affairs Commission',
    category: 'CAC',
    difficulty: 'Intermediate',
    estimatedTime: '1-2 hours',
    requirements: [
      'Company incorporation documents',
      'Audited financial statements',
      'Board resolutions',
      'Directors\' details',
      'Shareholders\' information'
    ],
    tips: [
      'File within 42 days of your company\'s anniversary',
      'Ensure financial statements are properly audited',
      'Update any changes in directors or shareholders',
      'Keep copies of all submitted documents'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Prepare Required Documents',
        description: 'Gather all necessary documents for annual filing',
        documents: [
          'Audited financial statements',
          'Annual return form (CAC 2.1)',
          'Board resolution approving the returns',
          'Evidence of payment of filing fee'
        ]
      },
      {
        id: 'step-2',
        title: 'Visit CAC Portal',
        description: 'Access the Corporate Affairs Commission online portal',
        action: 'Go to https://pre.cac.gov.ng and log into your company account'
      },
      {
        id: 'step-3',
        title: 'Complete Annual Return Form',
        description: 'Fill out the CAC 2.1 form with current company information',
        warning: 'Ensure all director and shareholder information is up to date'
      },
      {
        id: 'step-4',
        title: 'Upload Financial Statements',
        description: 'Upload your audited financial statements in PDF format',
        action: 'Attach balance sheet, profit & loss, and cash flow statements'
      },
      {
        id: 'step-5',
        title: 'Pay Filing Fee',
        description: 'Calculate and pay the required annual return filing fee',
        action: 'Fee varies by company type - check current CAC fee schedule'
      },
      {
        id: 'step-6',
        title: 'Submit and Confirm',
        description: 'Review all information and submit your annual return',
        action: 'Double-check all details before final submission'
      }
    ]
  },
  {
    id: 'paye-monthly-remittance',
    title: 'PAYE Monthly Remittance',
    description: 'Step-by-step guide to remit employee PAYE taxes monthly',
    category: 'PAYE',
    difficulty: 'Beginner',
    estimatedTime: '20-30 minutes',
    requirements: [
      'Employee payroll records',
      'PAYE tax deductions',
      'Company TIN',
      'Employee TIN numbers'
    ],
    tips: [
      'Remit by 10th of following month',
      'Keep detailed payroll records',
      'Ensure all employees have TIN',
      'File even if no PAYE was deducted'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Calculate PAYE Deductions',
        description: 'Calculate total PAYE deducted from all employees for the month',
        action: 'Sum up all PAYE deductions from monthly payroll'
      },
      {
        id: 'step-2',
        title: 'Access FIRS Portal',
        description: 'Log into FIRS taxpayer portal using company TIN',
        action: 'Visit https://www.firs.gov.ng and access taxpayer portal'
      },
      {
        id: 'step-3',
        title: 'Select PAYE Returns',
        description: 'Navigate to PAYE section for monthly remittance',
        action: 'Click "Returns" → "PAYE" → "Monthly Remittance"'
      },
      {
        id: 'step-4',
        title: 'Enter Employee Details',
        description: 'Input each employee\'s salary and PAYE deduction details',
        documents: ['Payroll schedule', 'Employee TIN list'],
        warning: 'Ensure all employee TINs are correct'
      },
      {
        id: 'step-5',
        title: 'Submit and Pay',
        description: 'Submit the return and make payment for total PAYE due',
        action: 'Review total amount and proceed with payment'
      }
    ]
  }
];