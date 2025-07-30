import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

// Enhanced AI service for live interviews
export class EnhancedAIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

  // Generate contextual interview questions
  async generateInterviewQuestion(context: string, previousQuestions: string[], candidateInfo: any, position: string): Promise<any> {
    let responseText = ''
    try {
      const prompt = `Generate an interview question for a candidate. 

Context: ${context}
Position: ${position}
Candidate Info: ${JSON.stringify(candidateInfo)}
Previous Questions: ${previousQuestions.join(', ')}

Please return a JSON response with the following structure:
{
  "question": "the interview question",
  "category": "behavioral, technical, situational, or general",
  "difficulty": "easy, medium, or hard",
  "timeLimit": 120,
  "followUpQuestions": ["follow up question 1", "follow up question 2"]
}

Make the question relevant to the position and candidate's background.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      responseText = response.text()
      
      // Clean the response to extract JSON
      let jsonText = responseText.trim()
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      // Try to parse the JSON
      const parsed = JSON.parse(jsonText)
      
      // Validate the response structure
      if (!parsed.question) {
        throw new Error('Invalid response structure: missing question')
      }
      
      return {
        question: parsed.question,
        category: parsed.category || 'general',
        difficulty: parsed.difficulty || 'medium',
        timeLimit: parsed.timeLimit || 120,
        followUpQuestions: parsed.followUpQuestions || []
      }
    } catch (error) {
      console.error('Error generating interview question:', error)
      console.log('AI Response was:', responseText)
      
      // Return a fallback question
      return {
        question: "Tell me about a challenging project you worked on and how you overcame obstacles.",
        category: "behavioral",
        difficulty: "medium",
        timeLimit: 120,
        followUpQuestions: []
      }
    }
  }

  // Analyze candidate response in real-time
  async analyzeResponse(
    question: string,
    response: string,
    emotionData?: any,
    faceData?: any,
    gazeData?: any
  ): Promise<{
    confidenceScore: number
    truthfulness: number
    relevance: number
    completeness: number
    emotionAnalysis: any
    cheatingFlags: any[]
    suggestions: string[]
    nextQuestion?: string
  }> {
    const prompt = `Analyze this interview response comprehensively:

    Question: "${question}"
    Response: "${response}"
    Emotion Data: ${JSON.stringify(emotionData || {})}
    Face Data: ${JSON.stringify(faceData || {})}
    Gaze Data: ${JSON.stringify(gazeData || {})}

    Provide detailed analysis in JSON format:
    {
      "confidenceScore": 0.0-1.0,
      "truthfulness": 0.0-1.0,
      "relevance": 0.0-1.0,
      "completeness": 0.0-1.0,
      "emotionAnalysis": {
        "primaryEmotion": "string",
        "stressLevel": "low|medium|high",
        "engagement": "low|medium|high",
        "confidence": "low|medium|high"
      },
      "cheatingFlags": [
        {
          "type": "string",
          "severity": "low|medium|high",
          "description": "string"
        }
      ],
      "suggestions": ["string"],
      "nextQuestion": "string" (optional follow-up question)
    }`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return JSON.parse(text)
    } catch (error) {
      console.error('Error analyzing response:', error)
      return {
        confidenceScore: 0.7,
        truthfulness: 0.8,
        relevance: 0.8,
        completeness: 0.7,
        emotionAnalysis: {
          primaryEmotion: "neutral",
          stressLevel: "low",
          engagement: "medium",
          confidence: "medium"
        },
        cheatingFlags: [],
        suggestions: ["Provide more specific examples", "Elaborate on your role"]
      }
    }
  }

  // Generate AI interviewer response
  async generateAIResponse(
    analysis: any,
    questionContext: string,
    interviewStage: number
  ): Promise<{
    response: string
    tone: 'encouraging' | 'neutral' | 'challenging'
    nextAction: 'continue' | 'probe' | 'move_on'
  }> {
    const prompt = `You are an AI interviewer. Based on the analysis of the candidate's response, generate an appropriate AI response:

    Analysis: ${JSON.stringify(analysis)}
    Question Context: ${questionContext}
    Interview Stage: ${interviewStage}

    Generate a response that:
    1. Acknowledges their answer appropriately
    2. Provides constructive feedback if needed
    3. Maintains professional tone
    4. Guides the interview forward

    Respond in JSON format:
    {
      "response": "string",
      "tone": "encouraging|neutral|challenging",
      "nextAction": "continue|probe|move_on"
    }`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return JSON.parse(text)
    } catch (error) {
      console.error('Error generating AI response:', error)
      return {
        response: "Thank you for that response. Let's move on to the next question.",
        tone: "neutral",
        nextAction: "continue"
      }
    }
  }

  // Detect cheating behavior
  async detectCheating(
    response: string,
    faceData: any,
    gazeData: any,
    audioData?: any
  ): Promise<{
    cheatingDetected: boolean
    confidence: number
    flags: any[]
    riskLevel: 'low' | 'medium' | 'high'
  }> {
    const prompt = `Analyze this interview response for potential cheating indicators:

    Response: "${response}"
    Face Data: ${JSON.stringify(faceData)}
    Gaze Data: ${JSON.stringify(gazeData)}
    Audio Data: ${JSON.stringify(audioData || {})}

    Look for:
    - Suspicious eye movements
    - Multiple faces detected
    - Unusual audio patterns
    - Inconsistent responses
    - Signs of reading from another screen

    Respond in JSON format:
    {
      "cheatingDetected": boolean,
      "confidence": 0.0-1.0,
      "flags": [
        {
          "type": "string",
          "severity": "low|medium|high",
          "description": "string"
        }
      ],
      "riskLevel": "low|medium|high"
    }`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return JSON.parse(text)
    } catch (error) {
      console.error('Error detecting cheating:', error)
      return {
        cheatingDetected: false,
        confidence: 0.5,
        flags: [],
        riskLevel: "low"
      }
    }
  }

  // Analyze emotions from response
  async analyzeEmotions(
    response: string,
    emotionData: any,
    voiceData?: any
  ): Promise<{
    primaryEmotion: string
    secondaryEmotions: string[]
    stressLevel: 'low' | 'medium' | 'high'
    engagement: 'low' | 'medium' | 'high'
    confidence: 'low' | 'medium' | 'high'
  }> {
    const prompt = `Analyze the emotional state from this interview response:

    Response: "${response}"
    Emotion Data: ${JSON.stringify(emotionData)}
    Voice Data: ${JSON.stringify(voiceData || {})}

    Analyze for:
    - Primary emotion
    - Secondary emotions
    - Stress level
    - Engagement level
    - Confidence level

    Respond in JSON format:
    {
      "primaryEmotion": "string",
      "secondaryEmotions": ["string"],
      "stressLevel": "low|medium|high",
      "engagement": "low|medium|high",
      "confidence": "low|medium|high"
    }`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return JSON.parse(text)
    } catch (error) {
      console.error('Error analyzing emotions:', error)
      return {
        primaryEmotion: "neutral",
        secondaryEmotions: [],
        stressLevel: "low",
        engagement: "medium",
        confidence: "medium"
      }
    }
  }

  // Generate interview summary
  async generateInterviewSummary(
    questions: string[],
    responses: any[],
    analysis: any[]
  ): Promise<{
    overallScore: number
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    summary: string
  }> {
    const prompt = `Generate a comprehensive interview summary based on the following data:

    Questions: ${JSON.stringify(questions)}
    Responses: ${JSON.stringify(responses)}
    Analysis: ${JSON.stringify(analysis)}

    Provide a detailed summary including:
    - Overall score (0-100)
    - Key strengths
    - Areas for improvement
    - Recommendations
    - Executive summary

    Respond in JSON format:
    {
      "overallScore": number,
      "strengths": ["string"],
      "weaknesses": ["string"],
      "recommendations": ["string"],
      "summary": "string"
    }`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return JSON.parse(text)
    } catch (error) {
      console.error('Error generating interview summary:', error)
      return {
        overallScore: 75,
        strengths: ["Good communication skills", "Relevant experience"],
        weaknesses: ["Could provide more specific examples"],
        recommendations: ["Consider providing more detailed examples", "Practice technical questions"],
        summary: "The candidate demonstrated good communication skills and relevant experience, but could benefit from providing more specific examples."
      }
    }
  }

  // Generate follow-up questions
  async generateFollowUpQuestions(
    response: string,
    analysis: any,
    questionCategory: string
  ): Promise<string[]> {
    const prompt = `Based on this interview response, generate 2-3 relevant follow-up questions:

    Response: "${response}"
    Analysis: ${JSON.stringify(analysis)}
    Question Category: ${questionCategory}

    Generate follow-up questions that:
    1. Probe deeper into their response
    2. Ask for specific examples
    3. Challenge their thinking
    4. Are relevant to the position

    Respond as a JSON array of strings: ["question1", "question2", "question3"]`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return JSON.parse(text)
    } catch (error) {
      console.error('Error generating follow-up questions:', error)
      return [
        "Can you provide a specific example of that?",
        "How did you handle challenges in that situation?",
        "What would you do differently next time?"
      ]
    }
  }

  async analyzeEmotion(text: string): Promise<any> {
    let responseText = ''
    try {
      const prompt = `Analyze the emotional content of the following text and return a JSON response with emotion analysis:

Text: "${text}"

Please analyze and return a JSON object with the following structure:
{
  "primary_emotion": "the most dominant emotion (happy, sad, angry, anxious, confident, neutral, etc.)",
  "confidence": "confidence score between 0 and 1",
  "emotions": {
    "happy": 0.0-1.0,
    "sad": 0.0-1.0,
    "angry": 0.0-1.0,
    "anxious": 0.0-1.0,
    "confident": 0.0-1.0,
    "neutral": 0.0-1.0
  },
  "sentiment": "positive, negative, or neutral",
  "intensity": "low, medium, or high"
}

Focus on detecting emotions that would be relevant in an interview context.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      responseText = response.text()
      
      // Clean the response to extract JSON
      let jsonText = responseText.trim()
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      // Try to parse the JSON
      const parsed = JSON.parse(jsonText)
      
      // Validate the response structure
      if (!parsed.primary_emotion) {
        throw new Error('Invalid response structure: missing primary_emotion')
      }
      
      return parsed
    } catch (error) {
      console.error('Error analyzing emotion:', error)
      console.log('AI Response was:', responseText)
      
      // Return a fallback emotion analysis
      return {
        primary_emotion: 'neutral',
        confidence: 0.5,
        emotions: { neutral: 0.5 },
        sentiment: 'neutral',
        intensity: 'low'
      }
    }
  }
}

// Export singleton instance
export const enhancedAIService = new EnhancedAIService()

// Legacy function for backward compatibility
export async function analyzeWithGemini(prompt: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error with Gemini API:', error)
    return '{"error": "Failed to analyze with AI"}'
  }
}