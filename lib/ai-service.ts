import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export class AIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

  // Generate interview question
  async generateQuestion(context: string, previousQuestions: string[], candidateInfo: any, position: string): Promise<any> {
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

  // Analyze response with cheating detection
  async analyzeResponse(question: string, response: string, emotionData?: any, cheatingData?: any): Promise<any> {
    try {
      const prompt = `Analyze this interview response comprehensively:

Question: "${question}"
Response: "${response}"
Emotion Data: ${JSON.stringify(emotionData || {})}
Cheating Detection: ${JSON.stringify(cheatingData || {})}

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
  "suggestions": ["Provide more specific examples", "Elaborate on your role"],
  "nextQuestion": "optional follow-up question"
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
        suggestions: parsed.suggestions || ["Provide more specific examples", "Elaborate on your role"],
        nextQuestion: parsed.nextQuestion
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

  // Generate interview summary
  async generateSummary(questions: string[], responses: any[], analysis: any[]): Promise<any> {
    try {
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

Return a JSON object with this structure:
{
  "overallScore": 75,
  "strengths": ["Good communication skills", "Relevant experience"],
  "weaknesses": ["Could provide more specific examples"],
  "recommendations": ["Consider providing more detailed examples", "Practice technical questions"],
  "summary": "The candidate demonstrated good communication skills and relevant experience, but could benefit from providing more specific examples."
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
        overallScore: parsed.overallScore || 75,
        strengths: parsed.strengths || ["Good communication skills", "Relevant experience"],
        weaknesses: parsed.weaknesses || ["Could provide more specific examples"],
        recommendations: parsed.recommendations || ["Consider providing more detailed examples", "Practice technical questions"],
        summary: parsed.summary || "The candidate demonstrated good communication skills and relevant experience, but could benefit from providing more specific examples."
      }
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
}

// Export singleton instance
export const aiService = new AIService() 