'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { VideoInterview } from '@/components/video-interview'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function LiveInterviewPage() {
  const params = useParams()
  const interviewId = params.id as string
  const [isLoading, setIsLoading] = useState(true)
  const [interview, setInterview] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await fetch(`/api/interview/${interviewId}`)
        const result = await response.json()
        
        if (result.success) {
          setInterview(result.interview)
        } else {
          console.error('Failed to fetch interview:', result.error)
        }
      } catch (error) {
        console.error('Error fetching interview:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (interviewId) {
      fetchInterview()
    }
  }, [interviewId])

  const handleComplete = (interviewSummary: any) => {
    setSummary(interviewSummary)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading interview session...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Interview Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">The interview session could not be found or has expired.</p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <VideoInterview 
        interviewId={interviewId} 
        onComplete={handleComplete}
      />
    </div>
  )
} 