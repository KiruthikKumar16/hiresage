# 🚀 Supabase Setup for JoCruit AI

## 📋 **Step 1: Create Supabase Project**

1. **Go to [Supabase](https://supabase.com)**
2. **Sign up/Login** with your account
3. **Create New Project**
   - Project name: `jocruit-ai`
   - Database password: `your-secure-password`
   - Region: Choose closest to your users

## 🔑 **Step 2: Get Environment Variables**

1. **Go to Project Settings** → **API**
2. **Copy these values:**
   - Project URL: `https://your-project-id.supabase.co`
   - Anon/Public Key: `your-anon-key`

3. **Add to your `.env.local`:**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🗄️ **Step 3: Set Up Database Schema**

1. **Go to SQL Editor** in Supabase Dashboard
2. **Copy and paste** the contents of `supabase-schema.sql`
3. **Run the SQL** to create all tables and policies

## 🔐 **Step 4: Configure Authentication**

1. **Go to Authentication** → **Settings**
2. **Add your site URL:**
   - Site URL: `http://localhost:3000` (development)
   - Redirect URLs: `http://localhost:3000/auth/callback`
3. **For production:** Add your Vercel domain

## 🚀 **Step 5: Test the Integration**

1. **Start your development server:**
```bash
pnpm dev
```

2. **Test database operations:**
   - Sign up a new user
   - Create a candidate
   - Start an interview
   - Check Supabase Dashboard for data

## 📊 **Step 6: Monitor in Supabase Dashboard**

- **Table Editor:** View and edit data
- **Logs:** Monitor API calls
- **Authentication:** Manage users
- **Storage:** File uploads (if needed)

## 🔧 **Step 7: Production Deployment**

1. **Update environment variables** in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Update Supabase Auth settings:**
   - Add your production domain
   - Update redirect URLs

## 🎯 **Features Enabled**

✅ **Real-time database** with PostgreSQL
✅ **Row Level Security** for data protection
✅ **Automatic timestamps** on all records
✅ **Type-safe queries** with TypeScript
✅ **Real-time subscriptions** for live updates
✅ **Built-in authentication** integration
✅ **Scalable architecture** for growth

## 🔍 **Database Tables**

- **users** - User accounts and profiles
- **candidates** - Job applicants
- **interviews** - Interview sessions
- **video_interviews** - Video interview data
- **organizations** - Company accounts
- **individual_users** - Personal user accounts

## 🚀 **Next Steps**

1. **Test all features** with the new database
2. **Monitor performance** in Supabase Dashboard
3. **Set up backups** (automatic with Supabase)
4. **Configure monitoring** and alerts
5. **Scale as needed** with Supabase Pro

---

**🎉 Your JoCruit AI app now has a production-ready database!** 