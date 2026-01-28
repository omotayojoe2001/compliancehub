import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Building2, Bell, Calculator, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function PublicLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">TaxandCompliance T&C</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Never Miss a Tax Deadline Again
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Get WhatsApp + Email reminders for Nigerian business owners. 
          Receive smart alerts before VAT, PAYE, and CAC deadlines with step-by-step filing guides.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" className="text-lg px-8 py-3">
              Start Getting Reminders Free
            </Button>
          </Link>
          <Link to="/tax-calculator">
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              Try Tax Calculator
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">What We Watch For You</h2>
        <p className="text-center text-gray-600 mb-12">We monitor all these deadlines so you don't have to worry</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 text-center">
            <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">VAT Returns</h3>
            <p className="text-sm text-gray-600">Monthly filing by 21st of each month</p>
            <p className="text-xs text-blue-600 mt-2 font-medium">✓ We'll remind you</p>
          </Card>
          <Card className="p-6 text-center">
            <Building2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">PAYE Remittance</h3>
            <p className="text-sm text-gray-600">Employee tax by 10th of each month</p>
            <p className="text-xs text-green-600 mt-2 font-medium">✓ We'll remind you</p>
          </Card>
          <Card className="p-6 text-center">
            <Bell className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">CAC Annual Returns</h3>
            <p className="text-sm text-gray-600">42 days after company anniversary</p>
            <p className="text-xs text-orange-600 mt-2 font-medium">✓ We'll remind you</p>
          </Card>
          <Card className="p-6 text-center">
            <Calculator className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Tax Calculator</h3>
            <p className="text-sm text-gray-600">Instant Nigerian tax calculations</p>
            <p className="text-xs text-purple-600 mt-2 font-medium">✓ Always available</p>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-2">Basic</h3>
            <div className="text-3xl font-bold text-blue-600 mb-4">₦3,000<span className="text-sm text-gray-600">/month</span></div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />Up to 3 obligations</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />Email reminders</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />Tax calculator</li>
            </ul>
            <Link to="/register">
              <Button className="w-full">Get Started</Button>
            </Link>
          </Card>
          
          <Card className="p-6 border-blue-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
              Most Popular
            </div>
            <h3 className="text-xl font-bold mb-2">Pro</h3>
            <div className="text-3xl font-bold text-blue-600 mb-4">₦7,000<span className="text-sm text-gray-600">/month</span></div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />Unlimited obligations</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />WhatsApp + Email</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />Advanced calculator</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />Priority support</li>
            </ul>
            <Link to="/register">
              <Button className="w-full">Get Started</Button>
            </Link>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-2">Annual</h3>
            <div className="text-3xl font-bold text-blue-600 mb-4">₦30,000<span className="text-sm text-gray-600">/year</span></div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />Everything in Pro</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />Multi-user access</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />API access</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />Dedicated support</li>
            </ul>
            <Link to="/register">
              <Button className="w-full">Get Started</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Never Miss a Deadline?</h2>
        <p className="text-xl text-gray-600 mb-8">Join hundreds of Nigerian businesses staying compliant</p>
        <Link to="/register">
          <Button size="lg" className="text-lg px-8 py-3">
            Start Your Free Trial
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2024 TaxandCompliance T&C. Never miss a tax deadline again.</p>
        </div>
      </footer>
    </div>
  );
}