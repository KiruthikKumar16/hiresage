import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

// Simple AI service for live interviews
export class EnhancedAIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

  // Generate interview question
  async generateInterviewQuestion(context: string, previousQuestions: string[], candidateInfo: any, position: string): Promise<any> {
    try {
      const prompt = `Generate an interview question for a candidate. 

Context: ${context}
Position: ${position}
Candidate Info: ${JSON.stringify(candidateInfo)}
Previous Questions: ${previousQuestions.join(', ')}

Return a JSON response with this structure:
{
  "question": "the interview question",
  "category": "behavioral, technical, situational, or general",
  "difficulty": "easy, medium, or hard",
  "timeLimit": 120,
  "followUpQuestions": ["follow up question 1", "follow up question 2"]
}`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const responseText = response.text()
      
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
      
      return {
        question: parsed.question || "Tell me about a challenging project you worked on and how you overcame obstacles.",
        category: parsed.category || 'behavioral',
        difficulty: parsed.difficulty || 'medium',
        timeLimit: parsed.timeLimit || 120,
        followUpQuestions: parsed.followUpQuestions || []
      }
    } catch (error) {
      console.error('Error generating interview question:', error)
      
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

  // Analyze emotion from text
  async analyzeEmotion(text: string): Promise<any> {
    try {
      const prompt = `Analyze the emotional content of this text and return a JSON response:

Text: "${text}"

Return a JSON object with this structure:
{
  "primary_emotion": "the most dominant emotion (happy, sad, angry, anxious, confident, neutral, etc.)",
  "confidence": 0.5,
  "emotions": {
    "happy": 0.0,
    "sad": 0.0,
    "angry": 0.0,
    "anxious": 0.0,
    "confident": 0.0,
    "neutral": 0.5
  },
  "sentiment": "positive, negative, or neutral",
  "intensity": "low, medium, or high"
}`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const responseText = response.text()
      
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
      
      return {
        primary_emotion: parsed.primary_emotion || 'neutral',
        confidence: parsed.confidence || 0.5,
        emotions: parsed.emotions || { neutral: 0.5 },
        sentiment: parsed.sentiment || 'neutral',
        intensity: parsed.intensity || 'low'
      }
    } catch (error) {
      console.error('Error analyzing emotion:', error)
      
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

  // Analyze response
  async analyzeResponse(question: string, response: string): Promise<any> {
    try {
      const prompt = `Analyze this interview response:

Question: "${question}"
Response: "${response}"

Return a JSON object with this structure:
{
  "confidenceScore": 0.7,
  "truthfulness": 0.8,
  "relevance": 0.8,
  "completeness": 0.7,
  "emotionAnalysis": {
    "primaryEmotion": "neutral",
    "stressLevel": "low",
    "engagement": "medium",
    "confidence": "medium"
  },
  "cheatingFlags": [],
  "suggestions": ["Provide more specific examples", "Elaborate on your role"]
}`

      const result = await this.model.generateContent(prompt)
      const aiResponse = await result.response
      const responseText = aiResponse.text()
      
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
      
      return {
        confidenceScore: parsed.confidenceScore || 0.7,
        truthfulness: parsed.truthfulness || 0.8,
        relevance: parsed.relevance || 0.8,
        completeness: parsed.completeness || 0.7,
        emotionAnalysis: parsed.emotionAnalysis || {
          primaryEmotion: "neutral",
          stressLevel: "low",
          engagement: "medium",
          confidence: "medium"
        },
        cheatingFlags: parsed.cheatingFlags || [],
        suggestions: parsed.suggestions || ["Provide more specific examples", "Elaborate on your role"]
      }
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