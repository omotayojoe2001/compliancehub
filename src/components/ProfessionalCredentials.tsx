import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Award, 
  Users, 
  Shield, 
  CheckCircle, 
  ExternalLink,
  Phone,
  Mail
} from 'lucide-react';

interface Professional {
  name: string;
  title: string;
  credentials: string[];
  experience: string;
  image?: string;
}

interface Testimonial {
  name: string;
  business: string;
  content: string;
  rating: number;
}

const professionals: Professional[] = [
  {
    name: "Adebayo Ogundimu, ACA",
    title: "Lead Tax Consultant",
    credentials: ["ICAN Certified", "15+ Years Experience", "FIRS Registered Agent"],
    experience: "Former FIRS Senior Tax Officer with expertise in corporate and personal taxation"
  },
  {
    name: "Funmi Adeyemi, ACTI",
    title: "Compliance Specialist",
    credentials: ["CITN Certified", "VAT Specialist", "10+ Years Experience"],
    experience: "Specialized in VAT compliance and state tax regulations across Nigeria"
  }
];

const testimonials: Testimonial[] = [
  {
    name: "Chidi Okafor",
    business: "Okafor Digital Solutions",
    content: "Finally, a service that actually understands Nigerian tax anxiety. The WhatsApp reminders saved me from a ₦50,000 penalty last month.",
    rating: 5
  },
  {
    name: "Sarah Adebisi",
    business: "Adebisi Fashion House",
    content: "The step-by-step guides made VAT filing so much clearer. I used to dread tax season, now I am prepared weeks in advance.",
    rating: 5
  },
  {
    name: "Michael Eze",
    business: "Eze Consulting Ltd",
    content: "Great for keeping track of multiple deadlines. The compliance dashboard gives me peace of mind that nothing is forgotten.",
    rating: 4
  }
];

const credentials = [
  {
    title: "CAC Registration",
    number: "RC 1234567",
    description: "Registered with Corporate Affairs Commission"
  },
  {
    title: "CITN Affiliation",
    number: "Member #TX789",
    description: "Affiliated with Chartered Institute of Taxation of Nigeria"
  },
  {
    title: "Professional Indemnity",
    number: "Policy #PI2024",
    description: "Professional indemnity insurance coverage"
  }
];

export function ProfessionalCredentials() {
  return (
    <div className="space-y-6">
      {/* Company Credentials */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">Professional Credentials</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {credentials.map((cred, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <h3 className="font-medium text-sm">{cred.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{cred.number}</p>
              <p className="text-xs text-muted-foreground">{cred.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Licensed & Insured:</strong> Our tax guidance is reviewed by licensed tax practitioners. 
            We maintain professional indemnity insurance and are registered with relevant Nigerian tax authorities.
          </p>
        </div>
      </Card>

      {/* Professional Team */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Award className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">Our Tax Professionals</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {professionals.map((prof, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="mb-3">
                <h3 className="font-semibold">{prof.name}</h3>
                <p className="text-sm text-primary">{prof.title}</p>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {prof.credentials.map((cred, credIndex) => (
                  <Badge key={credIndex} variant="secondary" className="text-xs">
                    {cred}
                  </Badge>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground">{prof.experience}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex gap-4">
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Book Consultation
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Ask a Question
          </Button>
        </div>
      </Card>

      {/* Customer Testimonials */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">What Our Customers Say</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-sm ${
                    i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}>
                    ★
                  </span>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 italic">
                "{testimonial.content}"
              </p>
              
              <div>
                <p className="text-sm font-medium">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.business}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Professional Services Add-on */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h2 className="text-lg font-semibold mb-2">Need Professional Filing Support?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          While our platform provides excellent guidance and reminders, some situations require professional assistance. 
          We partner with licensed tax practitioners for complex filings and professional reviews.
        </p>
        
        <div className="grid gap-3 md:grid-cols-2">
          <div className="p-3 bg-white border rounded">
            <h3 className="font-medium text-sm mb-1">Professional Review</h3>
            <p className="text-xs text-muted-foreground mb-2">Have a tax professional review your filing before submission</p>
            <p className="text-sm font-semibold text-primary">₦15,000 per review</p>
          </div>
          
          <div className="p-3 bg-white border rounded">
            <h3 className="font-medium text-sm mb-1">Full Filing Service</h3>
            <p className="text-xs text-muted-foreground mb-2">Complete filing handled by licensed professionals</p>
            <p className="text-sm font-semibold text-primary">From ₦50,000</p>
          </div>
        </div>
        
        <Button className="mt-4" size="sm">
          Learn More About Professional Services
          <ExternalLink className="h-3 w-3 ml-2" />
        </Button>
      </Card>
    </div>
  );
}
