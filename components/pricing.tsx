'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Star, Building2, User, Zap, Shield, Brain, Video } from 'lucide-react'
import Image from "next/image"

interface PricingProps {
  onSelectPlan?: (plan: string, type: 'individual' | 'organization') => void
}

export function Pricing({ onSelectPlan }: PricingProps) {
  const [selectedType, setSelectedType] = useState<'individual' | 'organization'>('individual')

  const individualPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out our platform',
      features: [
        '3 interviews per month',
        'Basic emotion analysis',
        'Standard cheating detection',
        'Email support',
        'Basic analytics'
      ],
      popular: false,
      buttonText: 'Get Started Free',
      buttonVariant: 'outline' as const
    },
    {
      name: 'Basic',
      price: '$29',
      period: 'per month',
      description: 'Great for job seekers and professionals',
      features: [
        '10 interviews per month',
        'Advanced emotion analysis',
        'Enhanced cheating detection',
        'Priority email support',
        'Detailed analytics',
        'Interview feedback',
        'Practice mode'
      ],
      popular: true,
      buttonText: 'Start Basic Plan',
      buttonVariant: 'default' as const
    },
    {
      name: 'Premium',
      price: '$79',
      period: 'per month',
      description: 'For serious career development',
      features: [
        'Unlimited interviews',
        'AI-powered coaching',
        'Real-time feedback',
        'Video recording',
        'Advanced analytics',
        'Priority support',
        'Custom interview scenarios',
        'Performance tracking'
      ],
      popular: false,
      buttonText: 'Start Premium Plan',
      buttonVariant: 'default' as const
    }
  ]

  const organizationPlans = [
    {
      name: 'Starter',
      price: '$199',
      period: 'per month',
      description: 'Perfect for small teams and startups',
      features: [
        'Up to 10 users',
        'Basic video interviews',
        'Standard emotion analysis',
        'Cheating detection',
        'Email support',
        'Basic reporting',
        'Team dashboard'
      ],
      popular: false,
      buttonText: 'Start Starter Plan',
      buttonVariant: 'outline' as const
    },
    {
      name: 'Professional',
      price: '$499',
      period: 'per month',
      description: 'For growing companies and HR teams',
      features: [
        'Up to 50 users',
        'Advanced video interviews',
        'Enhanced emotion analysis',
        'Advanced cheating detection',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
        'API access',
        'Bulk candidate management'
      ],
      popular: true,
      buttonText: 'Start Professional Plan',
      buttonVariant: 'default' as const
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For large organizations with custom needs',
      features: [
        'Unlimited users',
        'Custom AI models',
        'Advanced security',
        'Dedicated support',
        'Custom integrations',
        'White-label solution',
        'On-premise deployment',
        'SLA guarantees',
        'Custom training'
      ],
      popular: false,
      buttonText: 'Contact Sales',
      buttonVariant: 'default' as const
    }
  ]

  const features = [
    {
      icon: Video,
      title: 'Live Video Interviews',
      description: 'High-quality video calls with real-time analysis'
    },
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced emotion detection and behavioral analysis'
    },
    {
      icon: Shield,
      title: 'Cheating Detection',
      description: 'Multi-layered security to prevent malpractice'
    },
    {
      icon: Zap,
      title: 'Real-time Feedback',
      description: 'Instant insights and coaching during interviews'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <Image
            src="/JoCruit_Logo/logo_light.png"
            alt="JoCruit AI"
            width={80}
            height={80}
            className="w-20 h-20"
          />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
        <p className="text-xl text-slate-300">Pay only for what you use. Scale up or down as needed.</p>
      </div>

      {/* User Type Toggle */}
      <div className="flex justify-center">
        <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as 'individual' | 'organization')} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="organization" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organization
            </TabsTrigger>
          </TabsList>

          {/* Pricing Cards */}
          <TabsContent value="individual" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {individualPlans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.buttonVariant}
                  onClick={() => onSelectPlan?.(plan.name.toLowerCase(), 'individual')}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
            </div>
          </TabsContent>

          <TabsContent value="organization" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {organizationPlans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.buttonVariant}
                  onClick={() => onSelectPlan?.(plan.name.toLowerCase(), 'organization')}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Features Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Powerful Features for Every Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">How does the video interview work?</h3>
              <p className="text-sm text-muted-foreground">
                Our AI-powered video interviews use advanced computer vision and speech recognition 
                to analyze your responses in real-time, providing instant feedback on your performance.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">What kind of cheating detection do you use?</h3>
              <p className="text-sm text-muted-foreground">
                We use multiple layers of detection including face recognition, screen sharing detection, 
                background noise analysis, and unusual movement patterns to ensure interview integrity.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Can I customize interview questions?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! Organizations can create custom interview scenarios and question sets 
                tailored to their specific roles and requirements.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Is my data secure?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely. We use enterprise-grade encryption and follow strict data protection 
                protocols to ensure your interview data remains confidential and secure.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 