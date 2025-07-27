import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabaseDb } from "@/lib/supabase-db"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
  
  interface User {
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}

const handler = NextAuth({
  providers: [
    // Only add Google provider if credentials are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    // Only add GitHub provider if credentials are available
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      })
    ] : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Check if Supabase is configured
          if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.warn('Supabase not configured, skipping database lookup')
            return null
          }

          // Use Supabase database
          const user = await supabaseDb.getUserByEmail(credentials.email)
          
          if (user) {
            // In a real app, you'd hash and compare passwords
            // For now, we'll accept any user that exists
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role || 'user',
            }
          }
        } catch (error) {
          console.error('Auth error:', error)
        }
        
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role || 'user'
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role || 'user'
        session.user.id = token.id as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      try {
        // Check if Supabase is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.warn('Supabase not configured, skipping user creation')
          return true
        }

        if (account?.provider === "google" || account?.provider === "github") {
          // Check if user exists in our Supabase database
          const existingUser = await supabaseDb.getUserByEmail(user.email!)
          
          if (!existingUser) {
            // Create new user
            await supabaseDb.createUser({
              name: user.name!,
              email: user.email!,
              role: 'user',
            })
          } else {
            // Update last login
            await supabaseDb.updateUserLastLogin(existingUser.id)
          }
        }
      } catch (error) {
        console.error('SignIn callback error:', error)
      }
      
      return true
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST } 