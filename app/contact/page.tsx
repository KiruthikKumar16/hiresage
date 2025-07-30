"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight, Mail, MapPin, Clock, Shield, Brain, Zap } from 'lucide-react'

export default function ContactPage() {
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
              <Link href="/pricing" className="text-gray-700 hover:text-orange-600 transition-colors">
                Pricing
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
            Let's Build
            <br />
            <span className="text-orange-600">Something</span>
            <br />
            Amazing
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Ready to transform your hiring process? Our enterprise solutions are tailored to your specific needs. 
            Get in touch and let's discuss how JoCruit AI can scale with your organization.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="pb-20 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <Card className="bg-white border-2 border-gray-100 shadow-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-3xl font-bold text-black">Get Started Today</CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Tell us about your needs and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 font-medium">Full Name *</Label>
                        <Input 
                          id="name" 
                          placeholder="John Doe" 
                          className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="john@company.com" 
                          className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          required 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-gray-700 font-medium">Company *</Label>
                        <Input 
                          id="company" 
                          placeholder="Your Company" 
                          className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700 font-medium">Phone</Label>
                        <Input 
                          id="phone" 
                          placeholder="+1 (555) 123-4567" 
                          className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-gray-700 font-medium">Subject *</Label>
                      <Input 
                        id="subject" 
                        placeholder="What's this about?" 
                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-gray-700 font-medium">Message *</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Describe your hiring challenges, specific requirements, and how JoCruit AI can help..."
                        rows={6}
                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        required 
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-4"
                    >
                      Send Message
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Enterprise Benefits */}
              <Card className="bg-black text-white border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Enterprise Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Enterprise Security</h4>
                        <p className="text-gray-300 text-sm">SOC 2 compliance, data encryption, and advanced security protocols</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Custom AI Models</h4>
                        <p className="text-gray-300 text-sm">Tailored AI models trained on your specific industry and requirements</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Dedicated Support</h4>
                        <p className="text-gray-300 text-sm">24/7 dedicated account manager and technical support</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Details */}
              <Card className="bg-gray-50 border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black">Get in Touch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Mail className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-semibold text-black">Email</p>
                      <p className="text-gray-600">enterprise@jocruit.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <MapPin className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-semibold text-black">Office</p>
                      <p className="text-gray-600">San Francisco, CA</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-semibold text-black">Response Time</p>
                      <p className="text-gray-600">Within 24 hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
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