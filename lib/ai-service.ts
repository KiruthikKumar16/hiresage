import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface InterviewContext {
  candidateName: string
  position: string
  experience: string
  skills: string[]
  previousQuestions: string[]
  currentEmotion?: string
  confidenceLevel?: number
  transcript: string
}

export interface AIResponse {
  question?: string
  followUp?: string
  feedback?: string
  coaching?: string
  emotion?: string
  confidence?: number
}

export class AIService {
  private static instance: AIService
  private genAI: GoogleGenerativeAI

  constructor() {
    this.genAI = genAI
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async generateInterviewQuestion(context: InterviewContext): Promise<AIResponse> {
    try {
      const prompt = this.buildInterviewPrompt(context)
      return await this.generateWithGemini(prompt, 'interview')
    } catch (error) {
      console.error('Error generating interview question:', error)
      // Fallback response
      return {
        question: "Can you tell me about a challenging project you worked on recently?",
        feedback: "I'm here to help you succeed in this interview.",
        confidence: 75
      }
    }
  }

  async analyzeResponse(response: string, context: InterviewContext): Promise<AIResponse> {
    try {
      const prompt = this.buildAnalysisPrompt(response, context)
      return await this.generateWithGemini(prompt, 'analysis')
    } catch (error) {
      console.error('Error analyzing response:', error)
      return {
        feedback: "Thank you for that response. Let's continue with the next question.",
        confidence: 70
      }
    }
  }

  async generateInterviewSummary(context: InterviewContext): Promise<string> {
    try {
      const prompt = `Generate a comprehensive interview summary for ${context.candidateName} applying for ${context.position}.

Interview transcript: ${context.transcript}

Provide a structured summary including:
1. Overall assessment
2. Key strengths
3. Areas for improvement
4. Technical evaluation
5. Cultural fit assessment
6. Final recommendation

Format as a professional report.`

      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text() || "Interview summary could not be generated."
    } catch (error) {
      console.error('Error generating interview summary:', error)
      return "Interview summary generation failed."
    }
  }

  private async generateWithGemini(prompt: string, type: 'interview' | 'analysis'): Promise<AIResponse> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const systemPrompt = type === 'interview' 
      ? `You are an expert AI interviewer for JoCruit AI. Your role is to conduct professional interviews that assess candidates' skills, experience, and cultural fit. 

Key responsibilities:
1. Ask relevant, challenging questions based on the candidate's background
2. Provide real-time feedback and coaching
3. Adapt questions based on the candidate's responses and emotions
4. Maintain a professional yet engaging interview style
5. Focus on both technical skills and soft skills

Respond with a JSON object containing:
{
  "question": "The next question to ask",
  "followUp": "Optional follow-up question or clarification",
  "feedback": "Real-time feedback on the candidate's response",
  "coaching": "Constructive coaching or suggestions",
  "emotion": "Detected emotion (if any)",
  "confidence": "Confidence level (0-100)"
}`
      : `You are an AI interview analyst for JoCruit AI. Analyze the candidate's response and provide insights.

Analyze for:
1. Technical accuracy and depth
2. Communication clarity
3. Problem-solving approach
4. Cultural fit indicators
5. Areas for improvement

Respond with a JSON object containing:
{
  "feedback": "Detailed analysis of the response",
  "coaching": "Specific coaching suggestions",
  "emotion": "Detected emotion from response",
  "confidence": "Confidence level (0-100)",
  "score": "Response score (0-100)"
}`

    const fullPrompt = `${systemPrompt}\n\n${prompt}`
    
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const content = response.text()
    
    if (!content) {
      throw new Error('No response from Gemini')
    }

    try {
      return JSON.parse(content) as AIResponse
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError)
      console.error('Raw response:', content)
      // Fallback response
      return type === 'interview' 
        ? {
            question: "Can you tell me about a challenging project you worked on recently?",
            feedback: "I'm here to help you succeed in this interview.",
            confidence: 75
          }
        : {
            feedback: "Thank you for that response. Let's continue with the next question.",
            confidence: 70
          }
    }
  }

  private buildInterviewPrompt(context: InterviewContext): string {
    return `Generate the next interview question for ${context.candidateName} applying for ${context.position}.

Context:
- Experience: ${context.experience}
- Skills: ${context.skills.join(', ')}
- Previous questions: ${context.previousQuestions.join(', ') || 'None'}
- Current transcript: ${context.transcript}
- Current emotion: ${context.currentEmotion || 'Not detected'}
- Confidence level: ${context.confidenceLevel || 'Not detected'}

Generate an appropriate next question that:
1. Builds on previous responses
2. Assesses relevant skills for the position
3. Provides opportunity for detailed answers
4. Maintains professional interview flow`
  }

  private buildAnalysisPrompt(response: string, context: InterviewContext): string {
    return `Analyze this interview response for ${context.candidateName} applying for ${context.position}.

Response: "${response}"

Context:
- Position: ${context.position}
- Experience: ${context.experience}
- Skills: ${context.skills.join(', ')}
- Current transcript: ${context.transcript}

Provide detailed analysis and coaching.`
  }
}

export const aiService = AIService.getInstance() 