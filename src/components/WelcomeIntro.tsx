import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Calculator, Bell, FileText, Shield, Users, TrendingUp } from 'lucide-react';

interface WelcomeIntroProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function WelcomeIntro({ onGetStarted, onSignIn }: WelcomeIntroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      icon: Calculator,
      title: 'Smart Tax Calculators',
      description: 'Automated VAT, PAYE, CIT, and Withholding Tax calculations with real-time updates'
    },
    {
      icon: Bell,
      title: 'Never Miss Deadlines',
      description: 'Email and WhatsApp reminders for all Nigerian tax obligations and filing dates'
    },
    {
      icon: FileText,
      title: 'Digital Cashbook',
      description: 'Track income, expenses, and automatically calculate VAT obligations'
    },
    {
      icon: Shield,
      title: 'Compliance Made Easy',
      description: 'Stay compliant with LIRS, CAC, and State Revenue Service requirements'
    }
  ];

  const slides = [
    {
      title: 'Welcome to ComplianceHub',
      subtitle: 'Your Complete Nigerian Tax Compliance Solution',
      description: 'Simplify tax calculations, never miss deadlines, and stay compliant with automated reminders and smart calculators.',
      image: '🏢'
    },
    {
      title: 'Automated Tax Calculations',
      subtitle: 'Calculate VAT, PAYE, CIT & More',
      description: 'Get accurate tax calculations instantly with our smart calculators designed for Nigerian tax laws.',
      image: '🧮'
    },
    {
      title: 'Never Miss a Deadline',
      subtitle: 'Email & WhatsApp Reminders',
      description: 'Receive timely notifications for all your tax obligations, filing deadlines, and compliance requirements.',
      image: '⏰'
    },
    {
      title: 'Digital Cashbook',
      subtitle: 'Track Every Transaction',
      description: 'Manage your finances with our digital cashbook that automatically calculates VAT and generates reports.',
      image: '📊'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ComplianceHub</h1>
          </div>
          <p className="text-gray-600">Nigerian Tax Compliance Made Simple</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Slideshow */}
          <div className="order-2 lg:order-1">
            <Card className="p-8 text-center">
              <div className="text-6xl mb-4">{slides[currentSlide].image}</div>
              <h2 className="text-2xl font-bold mb-2">{slides[currentSlide].title}</h2>
              <h3 className="text-lg text-blue-600 mb-4">{slides[currentSlide].subtitle}</h3>
              <p className="text-gray-600 mb-6">{slides[currentSlide].description}</p>
              
              {/* Slide indicators */}
              <div className="flex justify-center gap-2 mb-6">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              {/* Navigation buttons */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={prevSlide}>
                  Previous
                </Button>
                <Button onClick={nextSlide}>
                  Next
                </Button>
              </div>
            </Card>
          </div>

          {/* Features & CTA */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <feature.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pricing Preview */}
            <Card className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Start Your Free Trial</h3>
                <p className="mb-4">Plans starting from ₦12,000/month</p>
                <div className="flex items-center justify-center gap-2 text-sm mb-4">
                  <CheckCircle className="h-4 w-4" />
                  <span>No setup fees</span>
                  <CheckCircle className="h-4 w-4" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={onGetStarted}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                Get Started - Create Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                onClick={onSignIn}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Already have an account? Sign In
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="text-center text-sm text-gray-600">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>500+ Businesses</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>99.9% Uptime</span>
                </div>
              </div>
              <p>Trusted by Nigerian businesses for tax compliance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}