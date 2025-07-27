"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, ArrowLeft, CreditCard, Shield, Zap, Users, Building2, Brain } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const plans = [
  {
    id: "free-trial",
    name: "Free Trial",
    price: 0,
    interviews: 1,
    features: ["1 free interview", "Full AI analysis", "Video interview support", "Basic reports"],
    popular: true,
    trial: true,
  },
  {
    id: "starter",
    name: "Starter",
    price: 1.80,
    interviews: 10,
    features: ["Basic interviews", "Standard reports", "Email support", "Basic analytics"],
    popular: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: 1.50,
    interviews: 50,
    features: ["Custom branding", "Bulk upload", "Advanced analytics", "Priority support"],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 1.20,
    interviews: 200,
    features: ["Custom question sets", "API integration", "White-label options", "Dedicated support"],
    popular: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 1.00,
    interviews: 1000,
    features: ["Full analytics suite", "Admin/team features", "SLA guarantee", "Custom integrations"],
    popular: false,
  },
]

export default function PurchasePage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("")
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

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
  }

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
    if (!selectedPlan) {
      toast.error("Please select a plan")
      return
    }

    const selectedPlanData = plans.find(plan => plan.id === selectedPlan)
    const isFreeTrial = selectedPlanData?.trial

    if (isFreeTrial) {
      // Free trial - only need name and email
      if (!formData.name || !formData.email) {
        toast.error("Please fill in your name and email")
        return
      }

      toast.loading("Setting up your free trial...")
      
      setTimeout(() => {
        toast.success("Free trial activated! Welcome to JoCruit AI X")
        // Redirect to dashboard after successful trial activation
        window.location.href = "/dashboard"
      }, 2000)
         } else {
       // Paid plan - need payment details based on selected method
       if (!formData.name || !formData.email) {
         toast.error("Please fill in your name and email")
         return
       }

               // Get selected payment method from formData
        const paymentMethod = formData.paymentMethod
       
       if (!paymentMethod) {
         toast.error("Please select a payment method")
         return
       }

       // Validate based on payment method
       if (paymentMethod === "credit-card") {
         if (!formData.cardNumber || !formData.expiryDate || !formData.cvv) {
           toast.error("Please fill in all card details")
           return
         }
       } else if (paymentMethod === "upi") {
         if (!formData.upiId) {
           toast.error("Please enter your UPI ID")
           return
         }
       } else if (paymentMethod === "net-banking") {
         if (!formData.bankName) {
           toast.error("Please select your bank")
           return
         }
       }

      // Simulate payment processing
      toast.loading("Processing payment...")
      
      setTimeout(() => {
        toast.success("Payment successful! Welcome to JoCruit AI X")
        // Redirect to dashboard after successful payment
        window.location.href = "/dashboard"
      }, 2000)
    }
  }

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
             {/* Navigation */}
       <nav className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
         <div className="container mx-auto px-4 py-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-3">
               <Link href="/" className="flex items-center space-x-3">
                 <div className="relative">
                   <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                     <Brain className="w-6 h-6 text-white" />
                   </div>
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

                                         <div className="container mx-auto px-2 pt-24 pb-6">
         <div className="max-w-7xl mx-auto">
           <div className="text-center mb-6">
             <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
               Choose Your Plan
             </h1>
             <p className="text-lg text-slate-300 max-w-2xl mx-auto">
               Select the perfect plan for your needs and get started with AI-powered interviews today
             </p>
           </div>

           <div className="grid lg:grid-cols-2 gap-6">
             {/* Plan Selection */}
             <div>
               <h2 className="text-xl font-bold text-white mb-4">Available Plans</h2>
               
               {/* Free Trial - Prominent Display */}
               <div className="mb-4">
                 {plans.filter(plan => plan.trial).map((plan) => (
                   <Card
                     key={plan.id}
                     className={`cursor-pointer transition-all duration-300 ${
                       selectedPlan === plan.id
                         ? "bg-blue-600/20 border-blue-500 ring-2 ring-blue-500"
                         : "bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
                     }`}
                     onClick={() => handlePlanSelect(plan.id)}
                   >
                     <CardHeader className="pb-3">
                       <div className="flex items-center justify-between">
                         <div>
                           <CardTitle className="text-white text-lg">{plan.name}</CardTitle>
                           <div className="text-2xl font-bold text-white">
                             ${plan.price}
                             <span className="text-sm text-slate-400">/interview</span>
                           </div>
                                                       <CardDescription className="text-blue-200 text-sm">
                              {plan.interviews} interviews/month
                            </CardDescription>
                         </div>
                         {plan.popular && (
                           <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-xs">
                             Most Popular
                           </Badge>
                         )}
                       </div>
                     </CardHeader>
                                           <CardContent className="pt-2">
                        <div className="grid grid-cols-2 gap-2">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                              <span className="text-slate-300 text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                   </Card>
                 ))}
               </div>

               {/* Paid Plans - 2x2 Grid */}
               <div className="grid grid-cols-2 gap-3">
                 {plans.filter(plan => !plan.trial).map((plan) => (
                   <Card
                     key={plan.id}
                     className={`cursor-pointer transition-all duration-300 ${
                       selectedPlan === plan.id
                         ? "bg-blue-600/20 border-blue-500 ring-2 ring-blue-500"
                         : "bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
                     }`}
                     onClick={() => handlePlanSelect(plan.id)}
                   >
                                           <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-white text-base">{plan.name}</CardTitle>
                            <div className="text-xl font-bold text-white">
                              ${plan.price}
                              <span className="text-sm text-slate-400">/interview</span>
                            </div>
                            <CardDescription className="text-blue-200 text-sm">
                              {plan.interviews} interviews/month
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              <span className="text-slate-300 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                   </Card>
                 ))}
               </div>
             </div>

                         {/* Payment Form */}
             <div>
               <h2 className="text-xl font-bold text-white mb-3">Payment Information</h2>
               <Card className="bg-slate-800/50 border-slate-700">
                 <CardContent className="p-3">
                   <div className="space-y-3">
                                         {/* Personal Information */}
                     <div className="space-y-2">
                                                <h3 className="text-base font-semibold text-white">Personal Information</h3>
                       <div className="grid grid-cols-2 gap-2">
                                                 <div>
                                                    <Label htmlFor="name" className="text-slate-300 text-sm">Full Name *</Label>
                         <Input
                           id="name"
                           value={formData.name}
                           onChange={(e) => handleInputChange("name", e.target.value)}
                           className="bg-slate-700 border-slate-600 text-white h-8"
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
                           className="bg-slate-700 border-slate-600 text-white h-8"
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
                          className="bg-slate-700 border-slate-600 text-white h-8"
                          placeholder="Your Company"
                        />
                      </div>
                      
                      {/* Additional Information */}
                      <div className="space-y-2">
                        <h3 className="text-base font-semibold text-white">Additional Information</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="phone" className="text-slate-300 text-sm">Phone Number</Label>
                            <Input
                              id="phone"
                              value={formData.phone || ""}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white h-8"
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                          <div>
                            <Label htmlFor="website" className="text-slate-300 text-sm">Website</Label>
                            <Input
                              id="website"
                              value={formData.website || ""}
                              onChange={(e) => handleInputChange("website", e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white h-8"
                              placeholder="https://yourcompany.com"
                            />
                          </div>
                        </div>
                      </div>
                      </div>

                                         {/* Payment Information - Only show for paid plans */}
                     {selectedPlanData && !selectedPlanData.trial && (
                                               <div className="space-y-2">
                          {/* Payment Method Selection */}
                          <div>
                            <Label htmlFor="paymentMethod" className="text-slate-300 text-sm">Select Payment Method *</Label>
                            <Select onValueChange={(value) => handlePaymentMethodChange(value)} defaultValue="credit-card">
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-blue-200 h-8">
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
                         <div className="space-y-2" id="credit-card-fields">
                           <div>
                             <Label htmlFor="cardNumber" className="text-slate-300 text-sm">Card Number *</Label>
                             <Input
                               id="cardNumber"
                               value={formData.cardNumber}
                               onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                               className="bg-slate-700 border-slate-600 text-white h-8"
                               placeholder="1234 5678 9012 3456"
                             />
                           </div>
                           <div className="grid grid-cols-3 gap-2">
                             <div>
                               <Label htmlFor="expiryDate" className="text-slate-300 text-sm">Expiry Date *</Label>
                               <Input
                                 id="expiryDate"
                                 value={formData.expiryDate}
                                 onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                                 className="bg-slate-700 border-slate-600 text-white h-8"
                                 placeholder="MM/YY"
                               />
                             </div>
                             <div>
                               <Label htmlFor="cvv" className="text-slate-300 text-sm">CVV *</Label>
                               <Input
                                 id="cvv"
                                 value={formData.cvv}
                                 onChange={(e) => handleInputChange("cvv", e.target.value)}
                                 className="bg-slate-700 border-slate-600 text-white h-8"
                                 placeholder="123"
                               />
                             </div>
                             <div className="flex items-end">
                               <div className="w-full h-8 bg-slate-700 border border-slate-600 rounded-md flex items-center justify-center">
                                 <CreditCard className="w-3 h-3 text-slate-400" />
                               </div>
                             </div>
                           </div>
                         </div>

                         {/* UPI Details */}
                         <div className="space-y-2 hidden" id="upi-fields">
                           <div>
                             <Label htmlFor="upiId" className="text-slate-300 text-sm">UPI ID *</Label>
                             <Input
                               id="upiId"
                               value={formData.upiId || ""}
                               onChange={(e) => handleInputChange("upiId", e.target.value)}
                               className="bg-slate-700 border-slate-600 text-white h-8"
                               placeholder="username@upi"
                             />
                           </div>
                         </div>

                         {/* Net Banking Details */}
                         <div className="space-y-2 hidden" id="net-banking-fields">
                           <div>
                             <Label htmlFor="bankName" className="text-slate-300 text-sm">Select Bank *</Label>
                             <Select onValueChange={(value) => handleInputChange("bankName", value)}>
                               <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8">
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
                               className="bg-slate-700 border-slate-600 text-white h-8"
                               placeholder="123 Main St, City, State 12345"
                             />
                           </div>
                       </div>
                     )}

                                         {/* Selected Plan Summary */}
                     {selectedPlanData && (
                       <div className="bg-slate-700/50 rounded-lg p-2">
                         <h4 className="text-white font-semibold mb-1 text-sm">Selected Plan</h4>
                         <div className="flex items-center justify-between">
                           <div>
                             <p className="text-white text-sm">{selectedPlanData.name} Plan</p>
                             <p className="text-blue-200 text-xs">{selectedPlanData.interviews} interviews/month</p>
                           </div>
                           <div className="text-right">
                             <p className="text-white font-bold text-sm">${selectedPlanData.price}/interview</p>
                                                           <p className="text-blue-200 text-xs">Pay as you go</p>
                           </div>
                         </div>
                       </div>
                     )}

                                                              

                      {/* Security Notice */}
                      <div className="flex items-center space-x-2 text-green-300 text-xs">
                        <Shield className="w-2 h-2" />
                        <span>Your payment information is secure and encrypted</span>
                      </div>

                     {/* Purchase Button */}
                     <Button
                       onClick={handlePurchase}
                       disabled={!selectedPlan}
                       className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-base py-2"
                     >
                       {selectedPlanData?.trial ? (
                         <>
                           <Zap className="w-3 h-3 mr-2" />
                           Start Free Trial
                         </>
                       ) : (
                         <>
                           <CreditCard className="w-3 h-3 mr-2" />
                           Complete Purchase
                         </>
                       )}
                     </Button>

                                           <p className="text-xs text-blue-300 text-center">
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