# JoCruit AI - Deployment Guide

This guide provides step-by-step instructions for deploying JoCruit AI to production.

## Prerequisites

- Node.js 20.x or higher
- pnpm package manager
- Vercel account
- Supabase account
- Google Cloud Console access (for Gemini API)
- GitHub account (for OAuth)

## Environment Setup

### 1. Supabase Database Setup

1. Create a new Supabase project at https://supabase.com
2. Navigate to Settings > API to get your project URL and anon key
3. Run the database schema migration:

```sql
-- Copy and paste the contents of supabase-schema.sql
-- This will create all necessary tables and RLS policies
```

4. Set up Row Level Security (RLS) policies for each table
5. Create a service role key for server-side operations

### 2. Google Cloud Setup

1. Go to Google Cloud Console
2. Create a new project or select existing one
3. Enable the Gemini API
4. Create API credentials
5. Copy the API key

### 3. OAuth Setup

#### Google OAuth
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.vercel.app/auth/callback` (production)

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set callback URL:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.vercel.app/auth/callback` (production)

## Environment Variables

Create a `.env.local` file with the following variables:

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

# Email (Optional - for report emails)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

## Local Development

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables (see above)

3. Run the development server:
```bash
pnpm dev
```

4. Open http://localhost:3000

## Vercel Deployment

### 1. Connect Repository

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Import the project in Vercel dashboard

### 2. Configure Environment Variables

In Vercel dashboard, go to Settings > Environment Variables and add all the variables from your `.env.local` file.

### 3. Build Settings

- Framework Preset: Next.js
- Build Command: `pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`

### 4. Deploy

1. Commit and push your changes
2. Vercel will automatically deploy
3. Check the deployment logs for any errors

## Production Checklist

### Database
- [ ] All tables created with proper schema
- [ ] RLS policies configured
- [ ] Service role key configured
- [ ] Database backups enabled

### Authentication
- [ ] OAuth providers configured
- [ ] Redirect URIs set correctly
- [ ] Session management working
- [ ] Role-based access control implemented

### AI Integration
- [ ] Gemini API key configured
- [ ] AI service responding correctly
- [ ] Error handling implemented
- [ ] Rate limiting configured

### Security
- [ ] Environment variables secured
- [ ] CORS configured
- [ ] Input validation implemented
- [ ] RBAC middleware active

### Performance
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Caching configured
- [ ] CDN enabled

## Monitoring & Analytics

### 1. Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor performance metrics
- Track user interactions

### 2. Error Monitoring
- Set up error tracking (Sentry recommended)
- Monitor API response times
- Track failed authentication attempts

### 3. Database Monitoring
- Monitor Supabase usage
- Set up alerts for high usage
- Track query performance

## Troubleshooting

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

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
NODE_ENV=development
```

## Scaling Considerations

### Database
- Monitor connection pool usage
- Consider read replicas for high traffic
- Implement connection pooling

### API Routes
- Implement rate limiting
- Add request caching
- Consider edge functions for global performance

### AI Processing
- Implement queue system for long-running tasks
- Add retry logic for failed requests
- Monitor API usage and costs

## Backup & Recovery

### Database Backups
- Enable automatic backups in Supabase
- Test restore procedures
- Document backup schedules

### Code Deployment
- Use Git tags for releases
- Implement rollback procedures
- Test deployment in staging environment

## Security Best Practices

1. **Environment Variables**
   - Never commit secrets to Git
   - Use Vercel's encrypted environment variables
   - Rotate keys regularly

2. **Authentication**
   - Implement proper session management
   - Add rate limiting for auth endpoints
   - Monitor failed login attempts

3. **API Security**
   - Validate all inputs
   - Implement proper CORS
   - Use HTTPS in production

4. **Data Protection**
   - Encrypt sensitive data
   - Implement proper access controls
   - Regular security audits

## Support & Maintenance

### Regular Tasks
- Monitor error logs
- Update dependencies
- Review security patches
- Backup verification

### Performance Optimization
- Monitor Core Web Vitals
- Optimize bundle size
- Implement caching strategies
- Database query optimization

## Contact & Support

For technical support or questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review troubleshooting guides

---

**Note**: This deployment guide should be updated as the application evolves. Always test changes in a staging environment before deploying to production. 