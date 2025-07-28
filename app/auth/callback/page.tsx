"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

function AuthCallbackContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        
        if (error) {
          setError('Authentication failed. Please try again.')
          return
        }

        if (!code) {
          setError('No authorization code received.')
          return
        }

        // Get the provider from sessionStorage
        const provider = sessionStorage.getItem('oauth_provider')
        if (!provider) {
          setError('No provider information found.')
          return
        }

        // Exchange code for tokens and user info
        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            provider,
            redirect_uri: `${window.location.origin}/auth/callback`
          })
        })

        const data = await response.json()

        if (data.success) {
          // Clear the provider from sessionStorage
          sessionStorage.removeItem('oauth_provider')
          
          // Redirect to dashboard
          window.location.href = '/dashboard'
        } else {
          setError(data.error || 'Authentication failed.')
        }
      } catch (error) {
        console.error('Callback error:', error)
        setError('Authentication failed. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Completing authentication...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Authentication Failed</h1>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/auth/signin'}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return null
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-slate-300">Loading...</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  )
} 