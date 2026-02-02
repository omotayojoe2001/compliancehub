import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Building2 } from 'lucide-react';

export default function StateRevenueServices() {
  const stateRevenueServices = [
    { name: 'Lagos State Internal Revenue Service', code: 'LIRS', website: 'https://lirs.gov.ng' },
    { name: 'Kano State Internal Revenue Service', code: 'KIRS', website: 'https://kanoirs.gov.ng' },
    { name: 'Rivers State Internal Revenue Service', code: 'RIRS', website: 'https://rirs.gov.ng' },
    { name: 'Ogun State Internal Revenue Service', code: 'OGIRS', website: 'https://ogirs.gov.ng' },
    { name: 'Kaduna State Internal Revenue Service', code: 'KADIRS', website: 'https://kadirs.gov.ng' },
    { name: 'Oyo State Internal Revenue Service', code: 'OYIRS', website: 'https://oyirs.gov.ng' },
    { name: 'Delta State Internal Revenue Service', code: 'DIRS', website: 'https://dirs.gov.ng' },
    { name: 'Edo State Internal Revenue Service', code: 'EIRS', website: 'https://eirs.gov.ng' },
    { name: 'Anambra State Internal Revenue Service', code: 'AIRS', website: 'https://airs.gov.ng' },
    { name: 'Imo State Internal Revenue Service', code: 'IIRS', website: 'https://iirs.gov.ng' },
    { name: 'Enugu State Internal Revenue Service', code: 'ESIRS', website: 'https://esirs.gov.ng' },
    { name: 'Abia State Internal Revenue Service', code: 'ABIRS', website: 'https://abirs.gov.ng' },
    { name: 'Akwa Ibom State Internal Revenue Service', code: 'AKIRS', website: 'https://akirs.gov.ng' },
    { name: 'Cross River State Internal Revenue Service', code: 'CRIRS', website: 'https://crirs.gov.ng' },
    { name: 'Bayelsa State Internal Revenue Service', code: 'BIRS', website: 'https://birs.gov.ng' },
    { name: 'Plateau State Internal Revenue Service', code: 'PIRS', website: 'https://pirs.gov.ng' },
    { name: 'Benue State Internal Revenue Service', code: 'BSIRS', website: 'https://bsirs.gov.ng' },
    { name: 'Taraba State Internal Revenue Service', code: 'TIRS', website: 'https://tirs.gov.ng' },
    { name: 'Adamawa State Internal Revenue Service', code: 'ADIRS', website: 'https://adirs.gov.ng' },
    { name: 'Gombe State Internal Revenue Service', code: 'GIRS', website: 'https://girs.gov.ng' },
    { name: 'Bauchi State Internal Revenue Service', code: 'BACIRS', website: 'https://bacirs.gov.ng' },
    { name: 'Borno State Internal Revenue Service', code: 'BOIRS', website: 'https://boirs.gov.ng' },
    { name: 'Yobe State Internal Revenue Service', code: 'YIRS', website: 'https://yirs.gov.ng' },
    { name: 'Jigawa State Internal Revenue Service', code: 'JIRS', website: 'https://jirs.gov.ng' },
    { name: 'Katsina State Internal Revenue Service', code: 'KATSIRS', website: 'https://katsirs.gov.ng' },
    { name: 'Sokoto State Internal Revenue Service', code: 'SIRS', website: 'https://sirs.gov.ng' },
    { name: 'Zamfara State Internal Revenue Service', code: 'ZIRS', website: 'https://zirs.gov.ng' },
    { name: 'Kebbi State Internal Revenue Service', code: 'KBIRS', website: 'https://kbirs.gov.ng' },
    { name: 'Niger State Internal Revenue Service', code: 'NIRS', website: 'https://nirs.gov.ng' },
    { name: 'Kwara State Internal Revenue Service', code: 'KWIRS', website: 'https://kwirs.gov.ng' },
    { name: 'Kogi State Internal Revenue Service', code: 'KGIRS', website: 'https://kgirs.gov.ng' },
    { name: 'Nasarawa State Internal Revenue Service', code: 'NASIRS', website: 'https://nasirs.gov.ng' },
    { name: 'Osun State Internal Revenue Service', code: 'OSIRS', website: 'https://osirs.gov.ng' },
    { name: 'Ondo State Internal Revenue Service', code: 'ODIRS', website: 'https://odirs.gov.ng' },
    { name: 'Ekiti State Internal Revenue Service', code: 'EKIRS', website: 'https://ekirs.gov.ng' },
    { name: 'Ebonyi State Internal Revenue Service', code: 'EBIRS', website: 'https://ebirs.gov.ng' }
  ];

  const generateLogo = (code: string) => {
    return (
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
        {code}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">State Revenue Services</h1>
          <p className="text-muted-foreground">
            Connect with Internal Revenue Services across all Nigerian states
          </p>
        </div>

        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-4">
            <Building2 className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Lagos Internal Revenue Service (LIRS)</h3>
              <p className="text-green-700">
                The Lagos State Internal Revenue Service - Nigeria's largest state revenue service.
              </p>
              <a 
                href="https://lirs.gov.ng" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-green-600 hover:underline mt-2"
              >
                Visit LIRS Website <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">All State Internal Revenue Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stateRevenueServices.map((service, index) => (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  {generateLogo(service.code)}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm leading-tight">{service.name}</h4>
                    <p className="text-xs text-muted-foreground">{service.code}</p>
                  </div>
                </div>
                <a
                  href={service.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                >
                  Visit Website <ExternalLink className="h-3 w-3" />
                </a>
              </Card>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">State Tax Obligations</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Personal Income Tax (PAYE)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Direct Assessment Tax</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Capital Gains Tax</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Stamp Duty</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Property Tax</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                Find My State Revenue Service
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                Tax Clearance Certificate
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                State Tax Calculator
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}