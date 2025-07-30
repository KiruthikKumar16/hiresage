"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-gray-900">
            AI-Powered Interview Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of interviewing with our advanced AI system featuring 
            real-time cheating detection, emotion analysis, and comprehensive reporting.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/signin">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">View Pricing</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">🤖</span>
                AI Interview Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Progressive AI interviews with dynamic question generation based on your responses.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">👁️</span>
                Cheating Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time monitoring with gaze tracking, lip sync analysis, and voice matching.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">😊</span>
                Emotion Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Advanced emotion detection to assess confidence, stress levels, and engagement.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">📊</span>
                Comprehensive Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Detailed analysis with confidence scores, truthfulness metrics, and recommendations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">🔒</span>
                Enterprise Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Role-based access control, audit trails, and immutable interview logs.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                Multi-Tenant Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Support for universities, companies, and individual candidates with custom workflows.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
              1
            </div>
            <h3 className="text-xl font-semibold">Sign Up & Setup</h3>
            <p className="text-gray-600">
              Create your account, upload your resume, and configure your interview preferences.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
              2
            </div>
            <h3 className="text-xl font-semibold">Take AI Interview</h3>
            <p className="text-gray-600">
              Engage in a real-time video interview with AI questions and real-time analysis.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
              3
            </div>
            <h3 className="text-xl font-semibold">Get Results</h3>
            <p className="text-gray-600">
              Receive comprehensive reports with scores, feedback, and improvement suggestions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
            <CardDescription className="text-lg">
              Join thousands of candidates and companies using our AI interview platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center space-x-4">
              <Link href="/auth/signin">
                <Button size="lg">Start Free Trial</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg">View Plans</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
