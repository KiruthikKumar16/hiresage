'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Star, Building2, User, Zap, Shield, Brain, Video } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import clsx from 'clsx'

interface PricingProps {
  onSelectPlan?: (plan: string, type: 'individual' | 'organization') => void
}

export function Pricing({ onSelectPlan }: PricingProps) {
  const [selectedType, setSelectedType] = useState<'individual' | 'organization'>('organization')

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
      buttonVariant: 'outline' as const,
      href: '/auth/signin'
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
      buttonVariant: 'default' as const,
      href: '/purchase?plan=basic&type=individual'
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
      buttonVariant: 'default' as const,
      href: '/purchase?plan=premium&type=individual'
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
      buttonVariant: 'outline' as const,
      href: '/purchase?plan=starter&type=organization'
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
      buttonVariant: 'default' as const,
      href: '/purchase?plan=professional&type=organization'
    },
    {
      name: 'Enterprise',
      price: '$999',
      period: 'per month',
      description: 'For large organizations and enterprises',
      features: [
        'Unlimited users',
        'Custom video interviews',
        'Advanced AI analysis',
        'Enterprise security',
        'Dedicated support',
        'Custom integrations',
        'White-label solution',
        'Advanced reporting',
        'SLA guarantee'
      ],
      popular: false,
      buttonText: 'Contact Sales',
      buttonVariant: 'default' as const,
      href: '/contact'
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
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 text-center py-20 px-4">
        <div className="flex justify-center mb-8">
          <Image
            src="/JoCruit_Logo/logo_full_dark.png"
            alt="JoCruit AI"
            width={200}
            height={60}
            className="h-16 w-auto"
          />
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent drop-shadow-2xl">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Pay only for what you use. Scale up or down as needed with our flexible pricing model.
        </p>
      </div>

      {/* Pricing Section with Tabs */}
      <div className="relative z-10">
        <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as 'individual' | 'organization')} className="w-full">
          {/* User Type Toggle */}
          <div className="flex justify-center mb-16">
            <div className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-2 rounded-full bg-slate-800/80 border-2 border-slate-700 shadow-lg p-1 h-16">
                <TabsTrigger 
                  value="organization" 
                  className={clsx(
                    'flex items-center gap-2 rounded-full py-3 px-6 font-bold text-base transition-all duration-300',
                    selectedType === 'organization' 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105' 
                      : 'text-slate-300 hover:bg-slate-700/40 hover:text-white'
                  )}
                >
                  <Building2 className="h-4 w-4" />
                  <span className="whitespace-nowrap">Organization</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="individual" 
                  className={clsx(
                    'flex items-center gap-2 rounded-full py-3 px-6 font-bold text-base transition-all duration-300',
                    selectedType === 'individual' 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105' 
                      : 'text-slate-300 hover:bg-slate-700/40 hover:text-white'
                  )}
                >
                  <User className="h-4 w-4" />
                  <span className="whitespace-nowrap">Individual</span>
                </TabsTrigger>
              </TabsList>
            </div>
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
                    <Link href={plan.href} className="mt-8">
                      <Button
                        className={clsx(
                          'w-full text-xl font-bold py-4 rounded-xl shadow-lg transition-all duration-300',
                          plan.buttonVariant === 'outline'
                            ? 'bg-transparent border-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 hover:text-white'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white hover:scale-105'
                        )}
                        variant={plan.buttonVariant}
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
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
                    <Link href={plan.href} className="mt-8">
                      <Button
                        className={clsx(
                          'w-full text-xl font-bold py-4 rounded-xl shadow-lg transition-all duration-300',
                          plan.buttonVariant === 'outline'
                            ? 'bg-transparent border-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 hover:text-white'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white hover:scale-105'
                        )}
                        variant={plan.buttonVariant}
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Section */}
      <div className="relative z-10 text-center py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Join thousands of companies and universities already using JoCruit AI to streamline their interview process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 hover:text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-300">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 