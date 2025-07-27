import { Pricing } from '@/components/pricing'
import { Brain } from 'lucide-react'
import Image from 'next/image'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Image
                  src="/JoCruit_Logo/logo_light.png"
                  alt="JoCruit AI"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  JoCruit AI X
                </h1>
                <p className="text-xs text-slate-400">Smarter Hiring Starts Here</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <a href="/" className="text-slate-300 hover:text-white transition-colors">
                Home
              </a>
              <a href="/dashboard" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-4 py-2 rounded-lg text-white font-medium">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <Pricing />
      </div>
    </div>
  )
} 