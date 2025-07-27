# JoCruit AI X - AI-Powered Interview Platform

A revolutionary AI-powered interview platform that transforms the hiring process with real-time emotion detection, cheating prevention, and comprehensive analytics.

## 🚀 Features

- **AI-Powered Interviews**: Advanced AI conducts comprehensive interviews and generates detailed assessment reports
- **Live Video Interviews**: Real-time video interviews with emotion analysis, cheating detection, and AI responses
- **Scalable Assessment**: Handle thousands of candidates simultaneously with cloud-based infrastructure
- **Visual Analytics**: Real-time dashboards and insights to track progress and performance metrics
- **Cheating Detection**: Multi-layered security with face recognition, screen sharing detection, and behavior analysis
- **Custom Integration**: Seamless API integration with existing HR systems and workflows

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **Authentication**: NextAuth.js
- **AI Integration**: Google Gemini API (FREE)
- **Database**: LocalStorage (client-side)
- **Deployment**: Vercel

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Google Gemini API key (FREE)

### Setup

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/jocruit.git
cd jocruit
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Set up environment variables**:
Create a `.env.local` file in the root directory:

```env
# NextAuth Configuration
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL=http://localhost:3000

# Google Gemini API (FREE)
GEMINI_API_KEY=your-gemini-api-key-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (Optional)
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

4. **Get your Gemini API key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the key to your `.env.local` file

5. **Run the development server**:
```bash
pnpm dev
```

6. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### For Individual Users

1. **Sign up** for a free account
2. **Start your first free interview** to experience the AI
3. **Choose a plan** that fits your needs
4. **Conduct interviews** with real-time AI analysis

### For Organizations

1. **Contact us** for enterprise pricing
2. **Set up team accounts** with admin features
3. **Integrate with your HR systems** via API
4. **Scale to thousands of interviews**

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration
- `GET /api/auth/session` - Get current session

### Interviews
- `GET /api/interviews` - List all interviews
- `POST /api/interviews` - Create new interview
- `GET /api/interviews/[id]` - Get specific interview
- `PUT /api/interviews/[id]` - Update interview
- `DELETE /api/interviews/[id]` - Cancel interview

### AI Integration
- `POST /api/ai/interview` - AI interview responses
- `POST /api/ai/analyze` - Response analysis

### Video Interviews
- `GET /api/video-interviews` - List video interviews
- `POST /api/video-interviews` - Create video interview
- `GET /api/video-interviews/[id]` - Get video interview

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on push to main branch

### Other Platforms

- **Netlify**: Set build command to `npm run build`
- **Railway**: Auto-detects Next.js configuration
- **AWS/GCP**: Use Docker or serverless deployment

## 📊 Analytics

The platform provides comprehensive analytics including:

- **Interview Performance**: Success rates, completion times
- **Candidate Insights**: Skills assessment, cultural fit scores
- **AI Analysis**: Emotion detection, confidence levels
- **System Usage**: Platform adoption, feature utilization

## 🔒 Security

- **NextAuth.js**: Secure authentication with multiple providers
- **JWT Tokens**: Stateless session management
- **Input Validation**: Zod schema validation
- **Rate Limiting**: API protection against abuse
- **Data Privacy**: Client-side storage with encryption

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@jocruit-ai.com or create an issue in the repository.

## 🙏 Acknowledgments

- **Google Gemini API** for free AI capabilities
- **NextAuth.js** for authentication
- **Shadcn/ui** for beautiful components
- **Vercel** for seamless deployment

**Built with ❤️ by the JoCruit AI X Team** 