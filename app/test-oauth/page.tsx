"use client"

import { useEffect, useState } from 'react'

export default function TestOAuth() {
  const [envVars, setEnvVars] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkEnv = async () => {
      try {
        const response = await fetch('/api/debug-oauth')
        const data = await response.json()
        setEnvVars(data)
      } catch (error) {
        console.error('Error checking env vars:', error)
      } finally {
        setLoading(false)
      }
    }

    checkEnv()
  }, [])

  const testGoogleOAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
    const redirectUri = `${window.location.origin}/auth/callback`
    const url = `https://accounts.google.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`
    
    console.log('Testing Google OAuth URL:', url)
    window.open(url, '_blank')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">OAuth Configuration Test</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Environment Variables:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(envVars?.env, null, 2)}
          </pre>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Test OAuth URLs:</h2>
          <div className="space-y-2">
            <div>
              <strong>Google OAuth URL:</strong>
              <div className="text-sm text-gray-600 break-all">
                https://accounts.google.com/oauth/authorize?client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID}&redirect_uri={window.location.origin}/auth/callback&response_type=code&scope=email profile
              </div>
            </div>
            <div>
              <strong>GitHub OAuth URL:</strong>
              <div className="text-sm text-gray-600 break-all">
                https://github.com/login/oauth/authorize?client_id={process.env.NEXT_PUBLIC_GITHUB_ID || process.env.GITHUB_ID}&redirect_uri={window.location.origin}/auth/callback&scope=user:email
              </div>
            </div>
          </div>
        </div>

        <div className="space-x-4">
          <button
            onClick={testGoogleOAuth}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test Google OAuth
          </button>
          <button
            onClick={() => window.location.href = '/auth/signin'}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    </div>
  )
} 