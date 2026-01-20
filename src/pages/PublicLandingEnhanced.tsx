import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Building2, Bell, Calculator, FileText, Shield, Zap, Users, Star, ArrowRight, Phone, Mail, MapPin, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function PublicLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ComplianceHub</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-20 text-center relative">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Trusted by 500+ Nigerian Businesses
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Never Miss a<br />
            <span className="text-blue-600">Tax Deadline</span> Again
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Automated WhatsApp + Email reminders for Nigerian business owners. 
            Get alerts before VAT, PAYE, and CAC deadlines with step-by-step filing guides.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700 shadow-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/tax-calculator">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2">
                Try Tax Calculator
              </Button>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>500+ Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-current text-yellow-500" />
              <span>4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Nigerian Business Owners</h2>
            <p className="text-gray-600">See what our customers say about staying compliant</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current text-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">"ComplianceHub saved my business from ₦500,000 in penalties. The WhatsApp reminders are a lifesaver!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">AO</span>
                </div>
                <div>
                  <p className="font-semibold">Adebayo Ogundimu</p>
                  <p className="text-sm text-gray-500">CEO, TechFlow Ltd</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-white shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current text-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">"Finally, a system that understands Nigerian tax deadlines. No more scrambling at the last minute!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">FN</span>
                </div>
                <div>
                  <p className="font-semibold">Funmi Nwosu</p>
                  <p className="text-sm text-gray-500">Founder, GreenLeaf Ventures</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-white shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current text-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">"The tax calculator alone is worth the subscription. Accurate and saves me hours of work every month."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">KA</span>
                </div>
                <div>
                  <p className="font-semibold">Kemi Adebayo</p>
                  <p className="text-sm text-gray-500">MD, Adebayo & Associates</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What We Watch For You</h2>
            <p className="text-xl text-gray-600">Comprehensive tax compliance monitoring for Nigerian businesses</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow border-0 shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">VAT Returns</h3>
              <p className="text-gray-600 mb-4">Monthly filing by 21st of each month</p>
              <div className="text-sm text-blue-600 font-medium">Auto-calculated deadlines</div>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-lg transition-shadow border-0 shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">PAYE Remittance</h3>
              <p className="text-gray-600 mb-4">Employee tax by 10th of each month</p>
              <div className="text-sm text-green-600 font-medium">Payroll integration ready</div>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-lg transition-shadow border-0 shadow-sm">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">CAC Annual Returns</h3>
              <p className="text-gray-600 mb-4">42 days after company anniversary</p>
              <div className="text-sm text-orange-600 font-medium">Never miss filing your returns</div>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-lg transition-shadow border-0 shadow-sm">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">SCUML Registration</h3>
              <p className="text-gray-600 mb-4">For designated businesses</p>
              <div className="text-sm text-red-600 font-medium">
                <a href="https://scuml.gov.ng" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Visit SCUML Portal
                </a>
              </div>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-lg transition-shadow border-0 shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calculator className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tax Calculator</h3>
              <p className="text-gray-600 mb-4">Instant Nigerian tax calculations</p>
              <div className="text-sm text-purple-600 font-medium">Always up-to-date rates</div>
            </Card>
          </div>
        </div>
      </section>

      {/* State Revenue Services */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Connect with Revenue Services</h2>
            <p className="text-gray-600">Direct links to Nigerian Revenue Service and State Internal Revenue Services</p>
          </div>
          
          {/* NRS Link */}
          <div className="text-center mb-8">
            <a href="https://nrs.gov.ng" target="_blank" rel="noopener noreferrer" 
               className="inline-flex items-center gap-3 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">NRS</span>
              </div>
              <span className="font-semibold">Nigerian Revenue Service Portal</span>
            </a>
          </div>
          
          {/* State Revenue Services Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Lagos', url: 'https://lirs.gov.ng', code: 'LIRS' },
              { name: 'Kano', url: 'https://kanoirs.gov.ng', code: 'KIRS' },
              { name: 'Rivers', url: 'https://rirs.gov.ng', code: 'RIRS' },
              { name: 'Ogun', url: 'https://ogirs.gov.ng', code: 'OGIRS' },
              { name: 'Kaduna', url: 'https://kadirs.gov.ng', code: 'KADIRS' },
              { name: 'Oyo', url: 'https://oyoirs.gov.ng', code: 'OYOIRS' },
              { name: 'Delta', url: 'https://dirs.gov.ng', code: 'DIRS' },
              { name: 'Edo', url: 'https://eirs.gov.ng', code: 'EIRS' },
              { name: 'Imo', url: 'https://iirs.gov.ng', code: 'IIRS' },
              { name: 'Anambra', url: 'https://airs.gov.ng', code: 'AIRS' },
              { name: 'Akwa Ibom', url: 'https://akirs.gov.ng', code: 'AKIRS' },
              { name: 'Cross River', url: 'https://crs-irs.gov.ng', code: 'CRIRS' }
            ].map((state) => (
              <a key={state.code} href={state.url} target="_blank" rel="noopener noreferrer"
                 className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center group">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
                  <span className="text-blue-600 font-bold text-xs">{state.code}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{state.name}</p>
                <p className="text-xs text-gray-500">{state.code}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-3">Add Your Tax Obligations</h3>
              <p className="text-gray-600">Tell us what taxes you need to file and when they're due</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-3">Get Automatic Reminders</h3>
              <p className="text-gray-600">Receive WhatsApp and email alerts 7, 3, and 1 days before deadlines</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-3">Stay Compliant</h3>
              <p className="text-gray-600">Never miss a deadline and avoid costly penalties</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your business needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold mb-2">Basic</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">₦12,000<span className="text-lg text-gray-600">/month</span></div>
              <div className="text-sm text-gray-500 mb-4">+ 7.5% VAT = ₦12,900</div>
              <div className="text-sm text-green-600 mb-4">Annual: ₦15,000/year (Save ₦39,800)</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" />VAT Calculator only</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" />E-Invoicing with company logo</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" />WhatsApp + Email alerts</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" />Basic compliance tracking</li>
              </ul>
              <Link to="/register">
                <Button className="w-full py-3">Get Started</Button>
              </Link>
            </Card>
            
            <Card className="p-8 border-2 border-blue-500 relative hover:shadow-xl transition-shadow">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">₦30,000<span className="text-lg text-gray-600">/month</span></div>
              <div className="text-sm text-gray-500 mb-4">+ 7.5% VAT = ₦32,250</div>
              <div className="text-sm text-green-600 mb-4">Annual: ₦50,000/year (Save ₦336,000)</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" />VAT, PAYE, CIT, Withholding Calculator</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" />Digital Cashbook with VAT auto-calculation</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" />E-Invoicing with company logo</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" />Expense management system</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" />WhatsApp + Email alerts</li>
              </ul>
              <Link to="/register">
                <Button className="w-full py-3 bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </Link>
            </Card>
            
            <Card className="p-8 hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">₦50,000<span className="text-lg text-gray-600">/month</span></div>
              <div className="text-sm text-gray-500 mb-4">+ 7.5% VAT = ₦53,750</div>
              <div className="text-sm text-green-600 mb-4">Custom Annual Pricing Available</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" />All Pro features + Capital Gains Calculator</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" />In-house Tax Consultant</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" />Advanced Digital Cashbook</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" />Priority E-Invoicing</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" />Optional Filing Service (+₦10,000/month)</li>
              </ul>
              <Link to="/register">
                <Button className="w-full py-3">Get Started</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Never Miss a Deadline?</h2>
          <p className="text-xl mb-8 opacity-90">Join 500+ Nigerian businesses staying compliant with ComplianceHub</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/tax-calculator">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600">
                Try Calculator First
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">ComplianceHub</span>
              </div>
              <p className="text-gray-400 mb-4">Never miss a tax deadline again. Automated reminders for Nigerian businesses.</p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/tax-calculator" className="hover:text-white transition-colors">Tax Calculator</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>hello@compliancehub.ng</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+234 800 COMPLY</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Lagos, Nigeria</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2024 ComplianceHub. All rights reserved.</p>
            <div className="flex gap-6 text-gray-400 text-sm mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}