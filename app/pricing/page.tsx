import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Check } from 'lucide-react'

const pricingPlans = [
  {
    name: 'Starter',
    price: '$1.80',
    period: 'per interview',
    interviews: '10 interviews/month',
    description: 'Perfect for small teams and startups',
    features: [
      'Basic AI interviews',
      'Standard reports',
      'Email support',
      'Basic analytics',
      'Up to 10 interviews/month',
      'Standard question sets'
    ],
    popular: false,
    color: 'border-gray-200'
  },
  {
    name: 'Growth',
    price: '$1.50',
    period: 'per interview',
    interviews: '50 interviews/month',
    description: 'Ideal for growing companies',
    features: [
      'Custom branding',
      'Bulk upload',
      'Advanced analytics',
      'Priority support',
      'Up to 50 interviews/month',
      'Custom question sets',
      'Team collaboration'
    ],
    popular: true,
    color: 'border-orange-500'
  },
  {
    name: 'Pro',
    price: '$1.20',
    period: 'per interview',
    interviews: '200 interviews/month',
    description: 'For established enterprises',
    features: [
      'Custom question sets',
      'API integration',
      'White-label options',
      'Dedicated support',
      'Up to 200 interviews/month',
      'Advanced security',
      'Custom integrations'
    ],
    popular: false,
    color: 'border-gray-200'
  },
  {
    name: 'Enterprise',
    price: '$1.00',
    period: 'per interview',
    interviews: '1000+ interviews/month',
    description: 'For large organizations',
    features: [
      'Full analytics suite',
      'Admin/team features',
      'SLA guarantee',
      'Custom integrations',
      'Unlimited interviews',
      'On-premise deployment',
      '24/7 dedicated support'
    ],
    popular: false,
    color: 'border-gray-200'
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/JoCruit_Logo/logo_full_light.png"
                alt="JoCruit AI"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-orange-600 transition-colors">
                Home
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-orange-600 transition-colors">
                Contact
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-black mb-8 leading-tight">
            Simple,
            <br />
            <span className="text-orange-600">Transparent</span>
            <br />
            Pricing
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Pay only for what you use. Scale up or down as needed with our flexible pricing model.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative hover:shadow-xl transition-all duration-300 border-2 ${plan.color} ${
                  plan.popular ? "ring-2 ring-orange-500/50 shadow-lg" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-black">{plan.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-black">{plan.price}</span>
                    <span className="text-gray-500 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">{plan.interviews}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <ul className="space-y-4 mb-8 text-left">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3 text-gray-700">
                        <Check className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/signin">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? "bg-orange-600 hover:bg-orange-700 text-white" 
                          : "bg-black hover:bg-gray-800 text-white"
                      }`}
                    >
                      Get Started
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto text-center">
          <Card className="max-w-3xl mx-auto bg-white border-0 shadow-xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-black">Need a Custom Plan?</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Contact us for enterprise solutions and custom integrations tailored to your specific needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signin">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Image
                src="/JoCruit_Logo/logo_full_light.png"
                alt="JoCruit AI"
                width={120}
                height={40}
                className="h-8 w-auto mb-4"
              />
              <p className="text-gray-400">
                Revolutionary AI-powered interview platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/press" className="hover:text-white transition-colors">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>Copyright © 2024 – JoCruit AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 