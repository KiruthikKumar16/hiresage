"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, ArrowLeft, CreditCard, Shield, Zap, Users, Building2, Brain, Star } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

const plans = {
  "free-trial": {
    id: "free-trial",
    name: "Free Trial",
    price: 0,
    interviews: 1,
    features: ["1 free interview", "Full AI analysis", "Video interview support", "Basic reports"],
    popular: true,
    trial: true,
    description: "Perfect for trying out our platform",
    period: "forever"
  },
  "basic": {
    id: "basic",
    name: "Basic",
    price: 29,
    interviews: 10,
    features: ["10 interviews per month", "Advanced emotion analysis", "Enhanced cheating detection", "Priority email support", "Detailed analytics", "Interview feedback", "Practice mode"],
    popular: true,
    trial: false,
    description: "Great for job seekers and professionals",
    period: "per month"
  },
  "premium": {
    id: "premium",
    name: "Premium",
    price: 79,
    interviews: 500,
    features: ["Unlimited interviews", "AI-powered coaching", "Real-time feedback", "Video recording", "Advanced analytics", "Priority support", "Custom interview scenarios", "Performance tracking"],
    popular: false,
    trial: false,
    description: "For serious career development",
    period: "per month"
  },
  "starter": {
    id: "starter",
    name: "Starter",
    price: 199,
    interviews: 10,
    features: ["Up to 10 users", "Basic video interviews", "Standard emotion analysis", "Cheating detection", "Email support", "Basic reporting", "Team dashboard"],
    popular: false,
    trial: false,
    description: "Perfect for small teams and startups",
    period: "per month"
  },
  "professional": {
    id: "professional",
    name: "Professional",
    price: 499,
    interviews: 50,
    features: ["Up to 50 users", "Advanced video interviews", "Enhanced emotion analysis", "Advanced cheating detection", "Priority support", "Advanced analytics", "Custom branding", "API access", "Bulk candidate management"],
    popular: true,
    trial: false,
    description: "For growing companies and HR teams",
    period: "per month"
  },
  "enterprise": {
    id: "enterprise",
    name: "Enterprise",
    price: 0,
    interviews: 1000,
    features: ["Unlimited users", "Custom AI models", "Advanced security", "Dedicated support", "Custom integrations", "White-label solution", "On-premise deployment", "SLA guarantees", "Custom training"],
    popular: false,
    trial: false,
    description: "For large organizations with custom needs",
    period: "contact us"
  }
}

function PurchasePageContent() {
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan') || 'free-trial'
  const type = searchParams.get('type') || 'individual'
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    website: "",
    paymentMethod: "credit-card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    upiId: "",
    bankName: "",
    billingAddress: "",
  })

  // Add error handling for invalid plan IDs
  const selectedPlan = plans[planId as keyof typeof plans] || plans['free-trial']

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePaymentMethodChange = (method: string) => {
    // Hide all payment fields
    const creditCardFields = document.getElementById('credit-card-fields')
    const upiFields = document.getElementById('upi-fields')
    const netBankingFields = document.getElementById('net-banking-fields')
    
    if (creditCardFields) creditCardFields.classList.add('hidden')
    if (upiFields) upiFields.classList.add('hidden')
    if (netBankingFields) netBankingFields.classList.add('hidden')
    
    // Show selected payment method fields
    if (method === 'credit-card' && creditCardFields) {
      creditCardFields.classList.remove('hidden')
    } else if (method === 'upi' && upiFields) {
      upiFields.classList.remove('hidden')
    } else if (method === 'net-banking' && netBankingFields) {
      netBankingFields.classList.remove('hidden')
    }
  }

  const handlePurchase = async () => {
    // Redirect to sign-in page for OAuth authentication
    window.location.href = "/auth/signin"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
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
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-slate-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/#pricing" className="text-slate-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/#team" className="text-slate-300 hover:text-white transition-colors">
                Team
              </Link>
              <Link href="/#contact" className="text-slate-300 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-24 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Complete Your Purchase
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Review your selected plan and provide payment information to get started
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Selected Plan Details */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Your Selected Plan</h2>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Plan Header */}
                    <div className="text-center space-y-4">
                      {selectedPlan.popular && (
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-sm">
                          <Star className="h-4 w-4 mr-2" /> Most Popular
                        </div>
                      )}
                      <h3 className="text-3xl font-bold text-white">{selectedPlan.name}</h3>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-black text-cyan-300">
                          ${selectedPlan.price}
                        </span>
                        <span className="text-lg text-slate-300 font-medium">/{selectedPlan.period}</span>
                      </div>
                      <p className="text-slate-400 text-lg">{selectedPlan.description}</p>
                    </div>

                    {/* Plan Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Plan Details</h3>
                      <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Plan Type:</span>
                          <span className="text-white font-semibold capitalize">{type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Interviews:</span>
                          <span className="text-white font-semibold">{selectedPlan.interviews} per month</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Status:</span>
                          <span className="text-white font-semibold">{selectedPlan.trial ? 'Free Trial' : 'Paid Plan'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Plan Features */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Plan Features</h3>
                      <div className="space-y-3">
                        {selectedPlan.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-200">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Plan Benefits */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">What You'll Get</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                            <Brain className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">AI-Powered Interviews</p>
                            <p className="text-slate-300 text-sm">Advanced analysis and feedback</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Secure Platform</p>
                            <p className="text-slate-300 text-sm">Enterprise-grade security</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Real-time Analysis</p>
                            <p className="text-slate-300 text-sm">Instant insights and feedback</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Scalable Solution</p>
                            <p className="text-slate-300 text-sm">Grow with your needs</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Payment Information</h2>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-slate-300 text-sm">Full Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white h-10"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-slate-300 text-sm">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white h-10"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="company" className="text-slate-300 text-sm">Company (Optional)</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange("company", e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white h-10"
                          placeholder="Your Company"
                        />
                      </div>
                    </div>
                    
                    {/* Additional Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Additional Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone" className="text-slate-300 text-sm">Phone Number</Label>
                          <Input
                            id="phone"
                            value={formData.phone || ""}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white h-10"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div>
                          <Label htmlFor="website" className="text-slate-300 text-sm">Website</Label>
                          <Input
                            id="website"
                            value={formData.website || ""}
                            onChange={(e) => handleInputChange("website", e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white h-10"
                            placeholder="https://yourcompany.com"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Information - Only show for paid plans */}
                    {!selectedPlan.trial && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Payment Method</h3>
                        
                        {/* Payment Method Selection */}
                        <div>
                          <Label htmlFor="paymentMethod" className="text-slate-300 text-sm">Select Payment Method *</Label>
                          <Select onValueChange={(value) => handlePaymentMethodChange(value)} defaultValue="credit-card">
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-blue-200 h-10">
                              <SelectValue placeholder="Choose payment method" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem value="credit-card" className="text-blue-200 hover:text-white">Credit/Debit Card</SelectItem>
                              <SelectItem value="upi" className="text-blue-200 hover:text-white">UPI</SelectItem>
                              <SelectItem value="net-banking" className="text-blue-200 hover:text-white">Net Banking</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Credit Card Details */}
                        <div className="space-y-4" id="credit-card-fields">
                          <div>
                            <Label htmlFor="cardNumber" className="text-slate-300 text-sm">Card Number *</Label>
                            <Input
                              id="cardNumber"
                              value={formData.cardNumber}
                              onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white h-10"
                              placeholder="1234 5678 9012 3456"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="expiryDate" className="text-slate-300 text-sm">Expiry Date *</Label>
                              <Input
                                id="expiryDate"
                                value={formData.expiryDate}
                                onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                                className="bg-slate-700 border-slate-600 text-white h-10"
                                placeholder="MM/YY"
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvv" className="text-slate-300 text-sm">CVV *</Label>
                              <Input
                                id="cvv"
                                value={formData.cvv}
                                onChange={(e) => handleInputChange("cvv", e.target.value)}
                                className="bg-slate-700 border-slate-600 text-white h-10"
                                placeholder="123"
                              />
                            </div>
                            <div className="flex items-end">
                              <div className="w-full h-10 bg-slate-700 border border-slate-600 rounded-md flex items-center justify-center">
                                <CreditCard className="w-4 h-4 text-slate-400" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* UPI Details */}
                        <div className="space-y-4 hidden" id="upi-fields">
                          <div>
                            <Label htmlFor="upiId" className="text-slate-300 text-sm">UPI ID *</Label>
                            <Input
                              id="upiId"
                              value={formData.upiId || ""}
                              onChange={(e) => handleInputChange("upiId", e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white h-10"
                              placeholder="username@upi"
                            />
                          </div>
                        </div>

                        {/* Net Banking Details */}
                        <div className="space-y-4 hidden" id="net-banking-fields">
                          <div>
                            <Label htmlFor="bankName" className="text-slate-300 text-sm">Select Bank *</Label>
                            <Select onValueChange={(value) => handleInputChange("bankName", value)}>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-10">
                                <SelectValue placeholder="Choose your bank" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                <SelectItem value="sbi">State Bank of India</SelectItem>
                                <SelectItem value="hdfc">HDFC Bank</SelectItem>
                                <SelectItem value="icici">ICICI Bank</SelectItem>
                                <SelectItem value="axis">Axis Bank</SelectItem>
                                <SelectItem value="kotak">Kotak Mahindra Bank</SelectItem>
                                <SelectItem value="yes">Yes Bank</SelectItem>
                                <SelectItem value="pnb">Punjab National Bank</SelectItem>
                                <SelectItem value="canara">Canara Bank</SelectItem>
                                <SelectItem value="union">Union Bank of India</SelectItem>
                                <SelectItem value="bank-of-baroda">Bank of Baroda</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="billingAddress" className="text-slate-300 text-sm">Billing Address</Label>
                          <Input
                            id="billingAddress"
                            value={formData.billingAddress}
                            onChange={(e) => handleInputChange("billingAddress", e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white h-10"
                            placeholder="123 Main St, City, State 12345"
                          />
                        </div>
                      </div>
                    )}

                    {/* Security Notice */}
                    <div className="flex items-center space-x-2 text-green-300 text-sm">
                      <Shield className="w-4 h-4" />
                      <span>Your payment information is secure and encrypted</span>
                    </div>

                    {/* Purchase Button */}
                    <Button
                      onClick={handlePurchase}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg font-bold py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      {selectedPlan.trial ? (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Start Free Trial
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Complete Purchase
                        </>
                      )}
                    </Button>

                    <p className="text-sm text-blue-300 text-center">
                      Need help? Contact our support team at support@jocruit.com
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PurchasePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading purchase page...</p>
        </div>
      </div>
    }>
      <PurchasePageContent />
    </Suspense>
  )
} 