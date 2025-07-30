import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const pricingPlans = [
  {
    name: 'Starter',
    price: '$1.80',
    period: 'per interview',
    interviews: '10 interviews/month',
    features: [
      'Basic AI interviews',
      'Standard reports',
      'Email support',
      'Basic analytics'
    ],
    popular: false,
  },
  {
    name: 'Growth',
    price: '$1.50',
    period: 'per interview',
    interviews: '50 interviews/month',
    features: [
      'Custom branding',
      'Bulk upload',
      'Advanced analytics',
      'Priority support'
    ],
    popular: true,
  },
  {
    name: 'Pro',
    price: '$1.20',
    period: 'per interview',
    interviews: '200 interviews/month',
    features: [
      'Custom question sets',
      'API integration',
      'White-label options',
      'Dedicated support'
    ],
    popular: false,
  },
  {
    name: 'Enterprise',
    price: '$1.00',
    period: 'per interview',
    interviews: '1000+ interviews/month',
    features: [
      'Full analytics suite',
      'Admin/team features',
      'SLA guarantee',
      'Custom integrations'
    ],
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pay only for what you use. Scale up or down as needed with our flexible pricing model.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative hover:shadow-lg transition-all duration-300 ${
                plan.popular ? "ring-2 ring-blue-500/50" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
                <p className="text-gray-600 text-sm mt-2">{plan.interviews}</p>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center justify-center space-x-2 text-gray-600">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signin">
                  <Button className="w-full">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Need a Custom Plan?</CardTitle>
              <CardDescription>
                Contact us for enterprise solutions and custom integrations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center space-x-4">
                <Link href="/auth/signin">
                  <Button size="lg">Start Free Trial</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg">Contact Sales</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 