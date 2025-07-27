"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2, Rocket, CheckCircle } from "lucide-react"

const trialSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  company: z.string().optional(),
  plan: z.string().optional(),
  useCase: z.string().optional(),
})

type TrialFormData = z.infer<typeof trialSchema>

interface TrialSignupFormProps {
  triggerText?: string
  plan?: string
}

export function TrialSignupForm({ triggerText = "Get Started", plan }: TrialSignupFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TrialFormData>({
    resolver: zodResolver(trialSchema),
  })

  // Set plan if provided
  if (plan) {
    setValue("plan", plan)
  }

  const onSubmit = async (data: TrialFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/trial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        setIsSubmitted(true)
        reset()
        setTimeout(() => {
          setIsOpen(false)
          setIsSubmitted(false)
        }, 3000)
      } else {
        toast.error(result.message || "Something went wrong")
      }
    } catch (error) {
      console.error("Trial signup error:", error)
      toast.error("Failed to create trial account. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            Start Your Free Trial
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Get started with HireSage AI X today. No credit card required.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Trial Created!</h3>
            <p className="text-slate-300">
              Check your email for login details. Your trial account is ready to use.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                {...register("name")}
                placeholder="Your Name"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Input
                {...register("email")}
                type="email"
                placeholder="Your Email"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Input
                {...register("company")}
                placeholder="Company (Optional)"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div>
              <Select onValueChange={(value) => register("plan").onChange({ target: { value } })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Interested Plan (Optional)" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select onValueChange={(value) => register("useCase").onChange({ target: { value } })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Use Case (Optional)" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="hiring">Company Hiring</SelectItem>
                  <SelectItem value="university">University Training</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Trial...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Start Free Trial
                </>
              )}
            </Button>

            <p className="text-xs text-slate-400 text-center">
              By starting a trial, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 