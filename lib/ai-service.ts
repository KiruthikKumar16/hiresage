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
  realTimeAnalysis?: RealTimeAnalysis[]
}

export interface AIResponse {
  question?: string
  followUp?: string
  feedback?: string
  coaching?: string
  emotion?: string
  confidence?: number
  nextAction?: 'continue' | 'probe' | 'redirect' | 'conclude'
  urgency?: 'low' | 'medium' | 'high'
}

export interface RealTimeAnalysis {
  speechToText: string
  currentEmotion: string
  confidenceScore: number
  deceptionScore: number
  stressLevel: number
  engagementLevel: number
  timestamp: Date
}

export interface EmotionAnalysis {
  primaryEmotion: string
  secondaryEmotion?: string
  confidence: number
  stressLevel: number
  engagementLevel: number
  deceptionIndicators: string[]
  microExpressions: string[]
}

export interface CheatingDetection {
  multipleFaces: boolean
  screenSharing: boolean
  backgroundNoise: boolean
  unusualMovements: boolean
  suspiciousBehavior: string[]
  riskLevel: 'low' | 'medium' | 'high'
  recommendations: string[]
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

  async generateRealTimeResponse(
    userSpeech: string, 
    emotionData: EmotionAnalysis, 
    context: InterviewContext
  ): Promise<AIResponse> {
    try {
      const prompt = this.buildRealTimePrompt(userSpeech, emotionData, context)
      return await this.generateWithGemini(prompt, 'realtime')
    } catch (error) {
      console.error('Error generating real-time response:', error)
      return {
        question: "That's interesting. Can you elaborate on that?",
        confidence: 70
      }
    }
  }

  async analyzeEmotionAndBehavior(
    videoFrame: string, // Base64 encoded image
    audioData: string, // Audio transcript
    context: InterviewContext
  ): Promise<{ emotion: EmotionAnalysis; cheating: CheatingDetection }> {
    try {
      const prompt = this.buildEmotionAnalysisPrompt(videoFrame, audioData, context)
      const response = await this.generateWithGemini(prompt, 'emotion')
      
      // Parse the AI response to extract emotion and cheating data
      return this.parseEmotionResponse(response)
    } catch (error) {
      console.error('Error analyzing emotion and behavior:', error)
      return {
        emotion: {
          primaryEmotion: 'neutral',
          confidence: 50,
          stressLevel: 30,
          engagementLevel: 60,
          deceptionIndicators: [],
          microExpressions: []
        },
        cheating: {
          multipleFaces: false,
          screenSharing: false,
          backgroundNoise: false,
          unusualMovements: false,
          suspiciousBehavior: [],
          riskLevel: 'low',
          recommendations: []
        }
      }
    }
  }

  async generateInterviewSummary(context: InterviewContext): Promise<string> {
    try {
      const prompt = `Generate a comprehensive interview summary for ${context.candidateName} applying for ${context.position}.

Interview transcript: ${context.transcript}

Real-time analysis: ${JSON.stringify(context.realTimeAnalysis || [])}

Provide a structured summary including:
1. Overall assessment
2. Key strengths
3. Areas for improvement
4. Technical evaluation
5. Cultural fit assessment
6. Emotional intelligence assessment
7. Deception indicators (if any)
8. Final recommendation

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

  private async generateWithGemini(prompt: string, type: 'interview' | 'analysis' | 'realtime' | 'emotion'): Promise<AIResponse> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const systemPrompt = type === 'interview' 
      ? `You are an expert AI interviewer for JoCruit AI. Your role is to conduct professional interviews that assess candidates' skills, experience, and cultural fit. 

Guidelines:
- Ask relevant, position-specific questions
- Adapt based on candidate responses
- Maintain professional tone
- Assess technical skills and soft skills
- Look for cultural fit indicators
- Provide constructive feedback when appropriate

Respond with a JSON object containing:
{
  "question": "The next interview question",
  "followUp": "Optional follow-up question",
  "feedback": "Brief feedback or encouragement",
  "confidence": 75,
  "nextAction": "continue|probe|redirect|conclude",
  "urgency": "low|medium|high"
}`

      : type === 'analysis'
      ? `You are an expert AI interviewer analyzing candidate responses. Your role is to provide insightful analysis and determine next steps.

Guidelines:
- Analyze response quality and relevance
- Assess technical depth and communication skills
- Identify strengths and areas for improvement
- Determine appropriate follow-up questions
- Maintain professional, constructive tone

Respond with a JSON object containing:
{
  "feedback": "Analysis of the response",
  "coaching": "Constructive guidance",
  "confidence": 75,
  "nextAction": "continue|probe|redirect|conclude",
  "urgency": "low|medium|high"
}`

      : type === 'realtime'
      ? `You are an expert AI interviewer conducting real-time video interviews. Your role is to respond naturally to candidate speech while analyzing emotions and behavior.

Guidelines:
- Respond conversationally and naturally
- Adapt to candidate's emotional state
- Ask probing questions when needed
- Maintain interview flow and engagement
- Assess confidence and stress levels

Respond with a JSON object containing:
{
  "question": "Natural follow-up question",
  "feedback": "Brief response or acknowledgment",
  "confidence": 75,
  "nextAction": "continue|probe|redirect|conclude",
  "urgency": "low|medium|high"
}`

      : `You are an expert AI analyzing video interview data for emotions and suspicious behavior. Your role is to provide detailed analysis of facial expressions, voice patterns, and behavior.

Guidelines:
- Analyze emotional indicators from video and audio
- Detect potential cheating or suspicious behavior
- Assess stress, confidence, and engagement levels
- Provide detailed analysis with confidence scores
- Identify micro-expressions and deception indicators

Respond with a JSON object containing:
{
  "emotion": {
    "primaryEmotion": "happy|sad|angry|surprised|neutral|confused|stressed",
    "secondaryEmotion": "optional secondary emotion",
    "confidence": 85,
    "stressLevel": 45,
    "engagementLevel": 70,
    "deceptionIndicators": ["list of indicators"],
    "microExpressions": ["list of micro-expressions"]
  },
  "cheating": {
    "multipleFaces": false,
    "screenSharing": false,
    "backgroundNoise": false,
    "unusualMovements": false,
    "suspiciousBehavior": ["list of behaviors"],
    "riskLevel": "low|medium|high",
    "recommendations": ["list of recommendations"]
  }
}`

    const fullPrompt = `${systemPrompt}\n\nContext: ${prompt}\n\nRespond only with valid JSON.`
    
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()
    
    try {
      return JSON.parse(text)
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      return {
        question: "Can you tell me more about your experience?",
        confidence: 70
      }
    }
  }

  private buildInterviewPrompt(context: InterviewContext): string {
    return `Candidate: ${context.candidateName}
Position: ${context.position}
Experience: ${context.experience}
Skills: ${context.skills.join(', ')}
Previous Questions: ${context.previousQuestions.join(' | ')}
Current Emotion: ${context.currentEmotion || 'neutral'}
Confidence Level: ${context.confidenceLevel || 70}

Generate the next interview question based on the candidate's responses and current emotional state.`
  }

  private buildAnalysisPrompt(response: string, context: InterviewContext): string {
    return `Candidate Response: "${response}"
Candidate: ${context.candidateName}
Position: ${context.position}
Previous Questions: ${context.previousQuestions.join(' | ')}
Current Emotion: ${context.currentEmotion || 'neutral'}
Confidence Level: ${context.confidenceLevel || 70}

Analyze this response and provide feedback.`
  }

  private buildRealTimePrompt(
    userSpeech: string, 
    emotionData: EmotionAnalysis, 
    context: InterviewContext
  ): string {
    return `Candidate Speech: "${userSpeech}"
Current Emotion: ${emotionData.primaryEmotion}
Stress Level: ${emotionData.stressLevel}
Engagement Level: ${emotionData.engagementLevel}
Confidence: ${emotionData.confidence}
Position: ${context.position}
Previous Questions: ${context.previousQuestions.slice(-3).join(' | ')}

Generate a natural, conversational response based on the candidate's speech and emotional state.`
  }

  private buildEmotionAnalysisPrompt(
    videoFrame: string, 
    audioData: string, 
    context: InterviewContext
  ): string {
    return `Video Frame Data: ${videoFrame.substring(0, 100)}...
Audio Transcript: "${audioData}"
Candidate: ${context.candidateName}
Position: ${context.position}

Analyze the video frame and audio data for emotional indicators and suspicious behavior.`
  }

  private parseEmotionResponse(response: AIResponse): { emotion: EmotionAnalysis; cheating: CheatingDetection } {
    // This would parse the AI response to extract emotion and cheating data
    // For now, return structured data
    return {
      emotion: {
        primaryEmotion: 'neutral',
        confidence: 70,
        stressLevel: 40,
        engagementLevel: 65,
        deceptionIndicators: [],
        microExpressions: []
      },
      cheating: {
        multipleFaces: false,
        screenSharing: false,
        backgroundNoise: false,
        unusualMovements: false,
        suspiciousBehavior: [],
        riskLevel: 'low',
        recommendations: []
      }
    }
  }
}

export const aiService = AIService.getInstance() 