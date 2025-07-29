# JoCruit AI - AI-Powered Interview Platform

A production-ready AI interview platform with real-time video interviews, progressive questioning, and comprehensive analytics.

## 🚀 Features

### Core Features
- **Live AI Interviews**: Real-time video interviews with progressive questioning
- **AI Analysis**: Comprehensive analysis of responses, emotions, and cheating detection
- **Enhanced Dashboard**: Real-time analytics and performance metrics
- **Role-Based Access**: System admin, university admin, and candidate roles
- **Report Generation**: Detailed interview reports and batch analytics
- **OAuth Authentication**: Google and GitHub login integration

### Technical Features
- **Next.js 15**: Latest React framework with App Router
- **TypeScript**: Full type safety
- **Supabase**: PostgreSQL database with real-time features
- **Google Gemini AI**: Advanced AI for interview questions and analysis
- **Tailwind CSS**: Modern, responsive design
- **Shadcn/ui**: Beautiful, accessible components

## 📋 Prerequisites

- Node.js 20.x or higher
- pnpm package manager
- Supabase account
- Google Cloud Console access (for Gemini API)
- GitHub account (for OAuth)

## 🛠️ Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-username/jocruit-ai.git
cd jocruit-ai
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup
Create a `.env.local` file:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# OAuth
GOOGLE_ID=your_google_oauth_client_id
GOOGLE_SECRET=your_google_oauth_client_secret
GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
```

### 4. Database Setup
1. Create a Supabase project
2. Run the database schema: `supabase-schema-enhanced.sql`
3. Set up Row Level Security (RLS) policies

### 5. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Push code to GitHub
   - Connect repository to Vercel
   - Import project in Vercel dashboard

2. **Environment Variables**
   - Add all variables from `.env.local` to Vercel
   - Update `NEXTAUTH_URL` to your Vercel domain

3. **Build Settings**
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

4. **Deploy**
   - Commit and push changes
   - Vercel will auto-deploy

### Manual Deployment

1. **Build Application**
   ```bash
   pnpm build
   ```

2. **Start Production Server**
   ```bash
   pnpm start
   ```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signin` - OAuth sign-in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get session

### Interviews
- `POST /api/interview/start-live` - Start live interview
- `POST /api/interview/answer` - Submit answer
- `POST /api/interview/next-question` - Generate next question
- `POST /api/interview/submit-live` - Complete interview

### AI Analysis
- `POST /api/ai/analyze` - Analyze response content

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/interviews/recent` - Get recent interviews

### Reports
- `POST /api/report/generate` - Generate reports
- `POST /api/email/batch-report` - Send batch emails

### Admin
- `GET /api/system/dashboard` - System admin dashboard
- `GET /api/uni/dashboard` - University admin dashboard

## 🔧 Configuration

### OAuth Setup

#### Google OAuth
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Create OAuth 2.0 Client ID
3. Add redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.vercel.app/auth/callback` (production)

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set callback URL:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.vercel.app/auth/callback` (production)

### Database Schema

The application uses the following main tables:
- `users` - User accounts and profiles
- `interviews` - Interview sessions and results
- `messages` - Interview conversation messages
- `subscriptions` - User subscription plans
- `reports` - Generated interview reports
- `ai_analysis_logs` - AI analysis tracking

## 🎯 Usage

### For Candidates
1. Sign in with Google/GitHub
2. Navigate to dashboard
3. Click "Start Interview"
4. Complete AI-powered interview
5. View results and analytics

### For Administrators
1. Access admin dashboard
2. View system-wide analytics
3. Generate reports
4. Manage user subscriptions

## 🔒 Security

- **Role-Based Access Control**: Different permissions for different user types
- **Input Validation**: All inputs validated with Zod
- **Session Management**: Secure session handling
- **CORS Protection**: Proper CORS configuration
- **Environment Variables**: Secure secret management

## 📈 Performance

- **Code Splitting**: Automatic code splitting for optimal loading
- **Image Optimization**: Next.js image optimization
- **Caching**: Strategic caching for better performance
- **Database Indexing**: Optimized database queries

## 🐛 Troubleshooting

### Common Issues

1. **OAuth Redirect Errors**
   - Verify redirect URIs in OAuth provider settings
   - Check environment variables
   - Ensure HTTPS in production

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Test connection with service role

3. **AI Service Errors**
   - Verify Gemini API key
   - Check API quotas
   - Monitor response times

4. **Build Failures**
   - Check Node.js version (20.x required)
   - Verify all dependencies installed
   - Check TypeScript errors

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review troubleshooting guides

---

**Built with ❤️ using Next.js, Supabase, and Google Gemini AI** 