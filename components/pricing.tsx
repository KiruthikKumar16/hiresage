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
    <div className="relative py-20 px-4 md:px-8 bg-gradient-to-br from-blue-900 via-slate-900 to-cyan-900 overflow-hidden rounded-3xl shadow-2xl">
      {/* Floating background shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-700/20 rounded-full blur-3xl z-0" />
      <div className="absolute -bottom-32 right-0 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl z-0" />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-400/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 z-0" />

      {/* Header */}
      <div className="relative z-10 text-center mb-16">
        <div className="flex justify-center mb-8">
          <Image
            src="/JoCruit_Logo/logo_light.png"
            alt="JoCruit AI"
            width={100}
            height={100}
            className="w-24 h-24 drop-shadow-xl"
          />
        </div>
        <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg leading-tight">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
          Pay only for what you use. Scale up or down as needed with our flexible pricing model.
        </p>
      </div>

      {/* User Type Toggle */}
      <div className="relative z-10 flex justify-center mb-16">
        <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as 'individual' | 'organization')} className="w-full max-w-lg">
          <TabsList className="grid w-full grid-cols-2 rounded-full bg-slate-800/80 border-2 border-slate-700 shadow-lg p-1">
            <TabsTrigger value="individual" className={clsx(
              'flex items-center gap-3 rounded-full py-4 px-8 font-bold text-lg transition-all duration-300',
              selectedType === 'individual' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105' : 'text-slate-300 hover:bg-slate-700/40 hover:text-white'
            )}>
              <User className="h-5 w-5" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="organization" className={clsx(
              'flex items-center gap-3 rounded-full py-4 px-8 font-bold text-lg transition-all duration-300',
              selectedType === 'organization' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105' : 'text-slate-300 hover:bg-slate-700/40 hover:text-white'
            )}>
              <Building2 className="h-5 w-5" />
              Organization
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Pricing Cards */}
      <TabsContent value="individual" className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {individualPlans.map((plan, index) => (
            <Card
              key={index}
              className={clsx(
                'relative bg-slate-800/90 border-2 border-slate-700 rounded-3xl shadow-2xl transition-all duration-500 group hover:scale-105 hover:border-cyan-400/80 min-h-[600px] flex flex-col',
                plan.popular && 'border-4 border-cyan-400/80 shadow-2xl scale-105 z-10 bg-gradient-to-br from-blue-800/90 via-cyan-800/90 to-slate-900/90'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                  <span className="inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-sm shadow-xl border-2 border-white/20">
                    <Star className="h-4 w-4 mr-2" /> Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-6 pt-8">
                <CardTitle className="text-4xl font-extrabold text-white mb-4 drop-shadow-md">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-6xl font-black text-cyan-300 drop-shadow">{plan.price}</span>
                  <span className="text-xl text-slate-300 font-medium">/{plan.period}</span>
                </div>
                <p className="text-slate-400 text-lg mb-4 leading-relaxed">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-6 pt-0 flex-1 flex flex-col">
                <ul className="space-y-4 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-4">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-lg text-slate-200 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-xl font-bold py-4 rounded-xl shadow-lg mt-8"
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

      <TabsContent value="organization" className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {organizationPlans.map((plan, index) => (
            <Card
              key={index}
              className={clsx(
                'relative bg-slate-800/90 border-2 border-slate-700 rounded-3xl shadow-2xl transition-all duration-500 group hover:scale-105 hover:border-cyan-400/80 min-h-[600px] flex flex-col',
                plan.popular && 'border-4 border-cyan-400/80 shadow-2xl scale-105 z-10 bg-gradient-to-br from-blue-800/90 via-cyan-800/90 to-slate-900/90'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                  <span className="inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-sm shadow-xl border-2 border-white/20">
                    <Star className="h-4 w-4 mr-2" /> Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-6 pt-8">
                <CardTitle className="text-4xl font-extrabold text-white mb-4 drop-shadow-md">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-6xl font-black text-cyan-300 drop-shadow">{plan.price}</span>
                  <span className="text-xl text-slate-300 font-medium">/{plan.period}</span>
                </div>
                <p className="text-slate-400 text-lg mb-4 leading-relaxed">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-6 pt-0 flex-1 flex flex-col">
                <ul className="space-y-4 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-4">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-lg text-slate-200 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-xl font-bold py-4 rounded-xl shadow-lg mt-8"
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

      {/* Features Section */}
      <div className="relative z-10 mt-20">
        <h2 className="text-4xl font-bold text-center mb-12 text-white drop-shadow">Powerful Features for Every Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-slate-300 text-lg leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 