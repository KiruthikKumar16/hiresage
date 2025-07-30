'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing authentication...')
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const result = await authService.handleAuthCallback()
        
        if (result.success) {
          setStatus('success')
          setMessage('Authentication successful! Redirecting...')
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          setStatus('error')
          setMessage(result.error || 'Authentication failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred during authentication')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Authentication</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <p>{message}</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-8 h-8 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600">{message}</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-8 h-8 bg-red-500 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600">{message}</p>
              <button
                onClick={() => router.push('/auth/signin')}
                className="text-blue-600 hover:underline"
              >
                Try again
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 