'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Star, Building2, User, Zap, Shield, Brain, Video } from 'lucide-react'
import Image from "next/image"
import clsx from 'clsx'

interface PricingProps {
  onSelectPlan?: (plan: string, type: 'individual' | 'organization') => void
}

export function Pricing({ onSelectPlan }: PricingProps) {
  const [selectedType, setSelectedType] = useState<'individual' | 'organization'>('organization')

  const individualPlans = [
    {
      name: 'Free Trial',
      price: '$0',
      period: '1 interview',
      description: 'Perfect for trying out our platform',
      features: [
        '1 free interview',
        'Basic emotion analysis',
        'Standard cheating detection',
        'Email support',
        'Basic analytics'
      ],
      popular: false,
      buttonText: 'Start Free Trial',
      buttonVariant: 'outline' as const
    },
    {
      name: 'Starter',
      price: '$1.80',
      period: 'per interview',
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
      popular: false,
      buttonText: 'Get Started',
      buttonVariant: 'default' as const
    },
    {
      name: 'Growth',
      price: '$1.50',
      period: 'per interview',
      description: 'For serious career development',
      features: [
        '50 interviews per month',
        'AI-powered coaching',
        'Real-time feedback',
        'Video recording',
        'Advanced analytics',
        'Priority support',
        'Custom interview scenarios',
        'Performance tracking'
      ],
      popular: true,
      buttonText: 'Get Started',
      buttonVariant: 'default' as const
    },
    {
      name: 'Pro',
      price: '$1.20',
      period: 'per interview',
      description: 'For professionals and power users',
      features: [
        '200 interviews per month',
        'Custom question sets',
        'API integration',
        'White-label options',
        'Dedicated support',
        'Advanced analytics',
        'Custom branding',
        'Bulk operations'
      ],
      popular: false,
      buttonText: 'Get Started',
      buttonVariant: 'default' as const
    }
  ]

  const organizationPlans = [
    {
      name: 'Starter',
      price: '$1.80',
      period: 'per interview',
      description: 'Perfect for small teams and startups',
      features: [
        '10 interviews per month',
        'Basic video interviews',
        'Standard emotion analysis',
        'Cheating detection',
        'Email support',
        'Basic reporting',
        'Team dashboard'
      ],
      popular: false,
      buttonText: 'Get Started',
      buttonVariant: 'outline' as const
    },
    {
      name: 'Growth',
      price: '$1.50',
      period: 'per interview',
      description: 'For growing companies and HR teams',
      features: [
        '50 interviews per month',
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
      buttonText: 'Get Started',
      buttonVariant: 'default' as const
    },
    {
      name: 'Pro',
      price: '$1.20',
      period: 'per interview',
      description: 'For established organizations',
      features: [
        '200 interviews per month',
        'Custom question sets',
        'API integration',
        'White-label options',
        'Dedicated support',
        'Custom integrations',
        'Advanced security',
        'SLA guarantees'
      ],
      popular: false,
      buttonText: 'Get Started',
      buttonVariant: 'default' as const
    },
    {
      name: 'Enterprise',
      price: '$1.00',
      period: 'per interview',
      description: 'For large organizations with custom needs',
      features: [
        '1000+ interviews per month',
        'Full analytics suite',
        'Admin/team features',
        'SLA guarantee',
        'Custom integrations',
        'White-label solution',
        'On-premise deployment',
        'Custom training',
        'Dedicated account manager'
      ],
      popular: false,
      buttonText: 'Get Started',
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
    <div className="relative py-16 px-2 md:px-0 bg-gradient-to-br from-blue-900 via-slate-900 to-cyan-900 overflow-hidden rounded-3xl shadow-2xl">
      {/* Floating background shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-700/20 rounded-full blur-3xl z-0" />
      <div className="absolute -bottom-32 right-0 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl z-0" />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-400/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 z-0" />

      {/* Header */}
      <div className="relative z-10 text-center mb-12">
        <div className="flex justify-center mb-6">
          <Image
            src="/JoCruit_Logo/logo_light.png"
            alt="JoCruit AI"
            width={80}
            height={80}
            className="w-20 h-20 drop-shadow-xl"
          />
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">Simple, Transparent Pricing</h2>
        <p className="text-xl text-slate-200 max-w-2xl mx-auto">Pay only for what you use. Scale up or down as needed with our flexible pricing model.</p>
      </div>

      {/* User Type Toggle */}
      <div className="relative z-10 flex justify-center mb-10">
        <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as 'individual' | 'organization')} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2 rounded-full bg-slate-800/80 border border-slate-700 shadow-lg">
            <TabsTrigger value="individual" className={clsx(
              'flex items-center gap-2 rounded-full py-2 px-6 font-semibold transition',
              selectedType === 'individual' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/40'
            )}>
              <User className="h-4 w-4" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="organization" className={clsx(
              'flex items-center gap-2 rounded-full py-2 px-6 font-semibold transition',
              selectedType === 'organization' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/40'
            )}>
              <Building2 className="h-4 w-4" />
              Organization
            </TabsTrigger>
          </TabsList>

          {/* Pricing Cards */}
          <TabsContent value="individual" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {individualPlans.map((plan, index) => (
                <Card
                  key={index}
                  className={clsx(
                    'relative bg-slate-800/80 border-2 border-slate-700 rounded-2xl shadow-xl transition-all duration-300 group hover:scale-105 hover:border-cyan-400/80',
                    plan.popular && 'border-4 border-cyan-400/80 shadow-2xl scale-105 z-10 bg-gradient-to-br from-blue-800/90 via-cyan-800/90 to-slate-900/90'
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                      <span className="inline-flex items-center px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-xs shadow-lg border-2 border-white/10">
                        <Star className="h-3 w-3 mr-1" /> Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-extrabold text-white mb-2 drop-shadow-md">{plan.name}</CardTitle>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl font-black text-cyan-300 drop-shadow">{plan.price}</span>
                      <span className="text-sm text-slate-300 font-medium">/{plan.period}</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-slate-200">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-base font-bold py-3 rounded-xl shadow-md"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {organizationPlans.map((plan, index) => (
                <Card
                  key={index}
                  className={clsx(
                    'relative bg-slate-800/80 border-2 border-slate-700 rounded-2xl shadow-xl transition-all duration-300 group hover:scale-105 hover:border-cyan-400/80',
                    plan.popular && 'border-4 border-cyan-400/80 shadow-2xl scale-105 z-10 bg-gradient-to-br from-blue-800/90 via-cyan-800/90 to-slate-900/90'
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                      <span className="inline-flex items-center px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-xs shadow-lg border-2 border-white/10">
                        <Star className="h-3 w-3 mr-1" /> Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-extrabold text-white mb-2 drop-shadow-md">{plan.name}</CardTitle>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl font-black text-cyan-300 drop-shadow">{plan.price}</span>
                      <span className="text-sm text-slate-300 font-medium">/{plan.period}</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-slate-200">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-base font-bold py-3 rounded-xl shadow-md"
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
      <div className="relative z-10 mt-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-white drop-shadow">Powerful Features for Every Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center bg-slate-800/80 border border-slate-700 rounded-xl shadow-md">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full shadow-lg">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-slate-300">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative z-10 mt-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-white drop-shadow">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="bg-slate-800/80 border border-slate-700 rounded-xl shadow-md">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-white">How does the video interview work?</h3>
              <p className="text-sm text-slate-300">
                Our AI-powered video interviews use advanced computer vision and speech recognition 
                to analyze your responses in real-time, providing instant feedback on your performance.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border border-slate-700 rounded-xl shadow-md">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-white">What kind of cheating detection do you use?</h3>
              <p className="text-sm text-slate-300">
                We use multiple layers of detection including face recognition, screen sharing detection, 
                background noise analysis, and unusual movement patterns to ensure interview integrity.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border border-slate-700 rounded-xl shadow-md">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-white">Can I customize interview questions?</h3>
              <p className="text-sm text-slate-300">
                Yes! Organizations can create custom interview scenarios and question sets 
                tailored to their specific roles and requirements.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border border-slate-700 rounded-xl shadow-md">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-white">Is my data secure?</h3>
              <p className="text-sm text-slate-300">
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