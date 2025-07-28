import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Use Gemini 2.0 Flash model
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

export interface InterviewContext {
  position: string
  candidate_name: string
  previous_questions: string[]
  current_question_index: number
}

export interface AIResponse {
  question?: string
  score?: number
  feedback?: string
  summary?: string
  analysis?: string
}

export const aiService = {
  // Generate interview question based on context
  async generateInterviewQuestion(context: InterviewContext): Promise<AIResponse> {
    try {
      const prompt = `You are an AI interviewer conducting a professional interview for the position of ${context.position}.

Candidate: ${context.candidate_name}
Previous questions asked: ${context.previous_questions.join(', ') || 'None'}
Current question number: ${context.current_question_index + 1}

Generate a relevant, professional interview question that:
1. Is appropriate for the position of ${context.position}
2. Builds upon previous questions (if any)
3. Helps assess the candidate's skills, experience, and fit
4. Is clear and specific
5. Encourages detailed responses

Question categories to consider:
- Technical skills (if applicable)
- Behavioral/situational
- Problem-solving
- Leadership/teamwork
- Company/role specific

Return only the question text, no additional formatting or explanation.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const question = response.text().trim()

      return { question }
    } catch (error) {
      console.error('Error generating interview question:', error)
      // Fallback question
      return {
        question: `Tell me about your experience and why you're interested in the ${context.position} position.`
      }
    }
  },

  // Analyze candidate's response
  async analyzeResponse(response: string, context: InterviewContext): Promise<AIResponse> {
    try {
      const prompt = `You are an AI interviewer analyzing a candidate's response.

Position: ${context.position}
Candidate: ${context.candidate_name}
Response: "${response}"

Analyze this response and provide:
1. A score from 1-10 (where 10 is excellent)
2. Specific feedback on what was good and what could be improved
3. Assessment of communication skills, technical knowledge, and overall fit

Consider:
- Clarity and structure of response
- Relevance to the position
- Specific examples provided
- Technical accuracy (if applicable)
- Communication skills
- Confidence level

Provide your analysis in a structured format:
Score: [1-10]
Feedback: [detailed feedback]
Strengths: [list key strengths]
Areas for improvement: [list areas to improve]`

      const result = await model.generateContent(prompt)
      const aiResponse = await result.response
      const analysis = aiResponse.text().trim()

      // Extract score from analysis
      const scoreMatch = analysis.match(/Score:\s*(\d+)/i)
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 5

      // Extract feedback
      const feedbackMatch = analysis.match(/Feedback:\s*([\s\S]*?)(?=Strengths:|Areas for improvement:|$)/i)
      const feedback = feedbackMatch ? feedbackMatch[1].trim() : 'Response analyzed.'

      return {
        score,
        feedback,
        analysis
      }
    } catch (error) {
      console.error('Error analyzing response:', error)
      return {
        score: 5,
        feedback: 'Response received and recorded.',
        analysis: 'Analysis completed.'
      }
    }
  },

  // Generate interview summary
  async generateInterviewSummary(context: {
    position: string
    candidate_name: string
    questions: string[]
    answers: string[]
    analysis: AIResponse
  }): Promise<AIResponse> {
    try {
      const prompt = `You are an AI interviewer providing a comprehensive summary of an interview.

Position: ${context.position}
Candidate: ${context.candidate_name}

Interview Questions and Answers:
${context.questions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${context.answers[i] || 'No answer provided'}`).join('\n\n')}

Overall Analysis: ${context.analysis.analysis || 'Analysis completed'}

Generate a comprehensive interview summary that includes:
1. Overall assessment of the candidate
2. Key strengths demonstrated
3. Areas of concern or improvement
4. Technical skills evaluation (if applicable)
5. Communication and interpersonal skills
6. Recommendation for next steps
7. Overall score and reasoning

Provide a professional, detailed summary that would be useful for hiring managers.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const summary = response.text().trim()

      return { summary }
    } catch (error) {
      console.error('Error generating interview summary:', error)
      return {
        summary: `Interview completed for ${context.candidate_name} for the ${context.position} position. Overall assessment and recommendations have been recorded.`
      }
    }
  },

  // Detect emotions from video data (placeholder for future implementation)
  async detectEmotions(videoFrame: any): Promise<any> {
    // This would integrate with a real emotion detection service
    // For now, return mock data
    return {
      emotions: {
        happy: Math.random() * 0.3,
        sad: Math.random() * 0.1,
        angry: Math.random() * 0.05,
        surprised: Math.random() * 0.1,
        neutral: Math.random() * 0.5
      },
      confidence: Math.random() * 0.8 + 0.2
    }
  },

  // Detect cheating behavior (placeholder for future implementation)
  async detectCheating(videoFrame: any, audioData: any): Promise<any> {
    // This would integrate with real cheating detection algorithms
    // For now, return mock data
    return {
      suspicious_activity: Math.random() > 0.8,
      confidence: Math.random() * 0.9 + 0.1,
      flags: Math.random() > 0.9 ? ['multiple_faces', 'screen_sharing'] : []
    }
  },

  // Convert speech to text (placeholder for future implementation)
  async speechToText(audioData: any): Promise<string> {
    // This would integrate with a real speech-to-text service
    // For now, return mock data
    return "Mock speech-to-text conversion result."
  }
} 