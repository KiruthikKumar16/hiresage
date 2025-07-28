"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Users, BarChart3, Zap, CheckCircle, Star, ArrowRight, Menu, X, Video, Shield, Building2, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { TrialSignupForm } from "@/components/trial-signup-form"
import { ContactForm } from "@/components/contact-form"
import { Toaster } from "sonner"

export default function JoCruitAIX() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const founders = [
    { name: "Shrivishaal", role: "Co-Founder", image: "/placeholder.svg?height=300&width=300&text=Shrivishaal", linkedin: "https://www.linkedin.com/in/shrivishaal/" },
    { name: "Kiruthik", role: "Co-Founder", image: "/placeholder.svg?height=300&width=300&text=Kiruthik", linkedin: "https://www.linkedin.com/in/kiruthikkumarm/" },
    { name: "Yuvanesh", role: "Co-Founder", image: "/placeholder.svg?height=300&width=300&text=Yuvanesh", linkedin: "https://www.linkedin.com/in/yuvanesh-sankar/" },
    { name: "Vikram", role: "Co-Founder", image: "/placeholder.svg?height=300&width=300&text=Vikram", linkedin: "https://www.linkedin.com/in/vikram-raj-455082246/" },
  ]

  const pricingTiers = [
    {
      name: "Starter",
      price: "$1.80",
      period: "per interview",
      interviews: "10 interviews/month",
      features: ["Basic interviews", "Standard reports", "Email support", "Basic analytics"],
      popular: false,
    },
    {
      name: "Growth",
      price: "$1.50",
      period: "per interview",
      interviews: "50 interviews/month",
      features: ["Custom branding", "Bulk upload", "Advanced analytics", "Priority support"],
      popular: true,
    },
    {
      name: "Pro",
      price: "$1.20",
      period: "per interview",
      interviews: "200 interviews/month",
      features: ["Custom question sets", "API integration", "White-label options", "Dedicated support"],
      popular: false,
    },
    {
      name: "Enterprise",
      price: "$1.00",
      period: "per interview",
      interviews: "1000+ interviews/month",
      features: ["Full analytics suite", "Admin/team features", "SLA guarantee", "Custom integrations"],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrollY > 50 ? "bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <Image
                  src="/JoCruit_Logo/logo_full_dark.png"
                  alt="JoCruit AI"
                  width={120}
                  height={40}
                  className="h-10 w-auto"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  JoCruit AI X
                </h1>
                <p className="text-xs text-slate-400">Smarter Hiring Starts Here</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-slate-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-slate-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="#team" className="text-slate-300 hover:text-white transition-colors">
                Team
              </Link>
              <Link href="#contact" className="text-slate-300 hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="/auth/signin">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Get Started
                </Button>
              </Link>
            </div>

            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-slate-700">
              <div className="flex flex-col space-y-4 pt-4">
                <Link href="#features" className="text-slate-300 hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="text-slate-300 hover:text-white transition-colors">
                  Pricing
                </Link>
                <Link href="#team" className="text-slate-300 hover:text-white transition-colors">
                  Team
                </Link>
                <Link href="#contact" className="text-slate-300 hover:text-white transition-colors">
                  Contact
                </Link>
                <Link href="/auth/signin">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-cyan-300 border-cyan-500/30">
              🚀 AI-Powered Interview Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent leading-tight">
              Transform Your Hiring Process with AI
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Assess, screen, and generate detailed reports efficiently. Perfect for universities training students and
              companies evaluating candidates. Now with live video interviews and real-time AI analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signin">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg px-8 py-4">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-4 bg-transparent">
                  View Plans
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center space-x-8 text-slate-400">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span>Starting at $1.80/interview</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Pay-as-you-go</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full animate-pulse"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Powerful AI Features
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our cutting-edge AI technology revolutionizes the way you conduct interviews and assess candidates
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Driven Interviews",
                description: "Advanced AI conducts comprehensive interviews and generates detailed assessment reports",
              },
              {
                icon: Video,
                title: "Live Video Interviews",
                description: "Real-time video interviews with emotion analysis, cheating detection, and AI responses",
              },
              {
                icon: Shield,
                title: "Cheating Detection",
                description: "Multi-layered security with face recognition, screen sharing detection, and behavior analysis",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Comprehensive insights and performance metrics to track candidate progress",
              },
              {
                icon: Users,
                title: "Scalable Assessment",
                description: "Handle thousands of candidates simultaneously with cloud-based infrastructure",
              },
              {
                icon: Zap,
                title: "Real-time Feedback",
                description: "Instant coaching and guidance during interviews for better candidate performance",
              },
            ].map((feature, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Pay only for what you use. Scale up or down as needed with our flexible pricing model.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card
                key={index}
                className={`relative bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 ${
                  tier.popular ? "ring-2 ring-blue-500/50" : ""
                }`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-white text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-white">{tier.price}</span>
                    <span className="text-slate-400 ml-1">{tier.period}</span>
                  </div>
                  <p className="text-slate-300 text-sm mt-2">{tier.interviews}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center justify-center space-x-2 text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/signin">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Meet Our Founding Team
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Passionate innovators dedicated to revolutionizing the hiring process through AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {founders.map((founder, index) => (
              <Card
                key={index}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => window.open(founder.linkedin, '_blank')}
              >
                <CardHeader>
                  <div className="relative mx-auto mb-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gradient-to-r from-blue-500 to-cyan-500 p-1">
                      <Image
                        src={founder.image || "/placeholder.svg"}
                        alt={founder.name}
                        width={128}
                        height={128}
                        className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-xl">{founder.name}</CardTitle>
                  <CardDescription className="text-blue-400 font-medium">{founder.role}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-900/50 to-slate-800/50 rounded-2xl p-12 text-center border border-slate-700">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Ready to Transform Your Hiring?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of companies and universities already using JoCruit AI X to streamline their interview
              process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signin">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg px-8 py-4">
                  Start Your Free Trial
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-4 bg-transparent">
                  View All Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Get in Touch
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Ready to transform your hiring process? Let's discuss how JoCruit AI X can help your organization.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/JoCruit_Logo/logo_full_dark.png"
                  alt="JoCruit AI"
                  width={100}
                  height={32}
                  className="h-8 w-auto"
                />
                <h3 className="text-lg font-bold text-white">JoCruit AI X</h3>
              </div>
              <p className="text-slate-400 mb-4">
                Smarter Hiring Starts Here
              </p>
              <p className="text-sm text-slate-500">
                Revolutionizing the hiring process with AI-powered interviews and assessments.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="#features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="#team" className="hover:text-white transition-colors">
                    Team
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500">
            <p>&copy; 2024 JoCruit AI X. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  )
}
