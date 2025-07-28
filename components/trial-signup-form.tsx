"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface TrialSignupFormProps {
  triggerText?: string
  plan?: string
}

export function TrialSignupForm({ triggerText = "Get Started", plan }: TrialSignupFormProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push('/auth/signin')
  }

  return (
    <Button 
      onClick={handleClick}
      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
    >
      {triggerText}
    </Button>
  )
} 