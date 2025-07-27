import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
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

        // For now, we'll use a simple check against our localStorage users
        // In production, you'd want to use a proper database
        const users = await db.getUsers()
        const user = users.find(u => u.email === credentials.email)
        
        if (user) {
          // In a real app, you'd hash and compare passwords
          // For now, we'll accept any user that exists
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        }
        
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        // Check if user exists in our database
        const existingUser = await db.getUserByEmail(user.email!)
        
        if (!existingUser) {
          // Create new user
          await db.createUser({
            name: user.name!,
            email: user.email!,
            role: 'user',
          })
        } else {
          // Update last login
          await db.updateUserLastLogin(existingUser.id)
        }
      }
      
      return true
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST } 