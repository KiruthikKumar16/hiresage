"use client"

import { useAuth } from '@/components/auth-provider'
import { useState } from 'react'

export default function SignInPage() {
  const { signInWithProvider } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null)

  const handleSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    setLoadingProvider(provider)
    try {
      await signInWithProvider(provider)
    } catch (error) {
      console.error('Sign-in error:', error)
    } finally {
      setIsLoading(false)
      setLoadingProvider(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      <div className="w-full max-w-md p-8 bg-slate-900/80 rounded-xl shadow-xl border border-slate-700">
        <div className="flex flex-col items-center mb-8">
          <img src="/JoCruit_Logo/logo_full_dark.png" alt="JoCruit AI" className="h-12 mb-2" />
          <h1 className="text-2xl font-bold mb-2">Sign in to JoCruit</h1>
        </div>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleSignIn('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded bg-white text-slate-900 font-semibold hover:bg-slate-100 border border-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingProvider === 'google' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C36.68 2.7 30.74 0 24 0 14.82 0 6.73 5.48 2.69 13.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.93 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.09c-1.13-3.36-1.13-6.97 0-10.33l-7.98-6.2C.99 15.1 0 19.39 0 24c0 4.61.99 8.9 2.69 12.44l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.74 0 12.42-2.23 16.56-6.07l-7.19-5.6c-2.01 1.35-4.6 2.15-7.37 2.15-6.38 0-11.87-3.63-14.33-8.89l-7.98 6.2C6.73 42.52 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
                Sign in with Google
              </>
            )}
          </button>
          <button
            onClick={() => handleSignIn('github')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded bg-slate-800 text-white font-semibold hover:bg-slate-700 border border-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingProvider === 'github' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 7.43c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"/></svg>
                Sign in with GitHub
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 