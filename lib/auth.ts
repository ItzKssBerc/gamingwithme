import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import TwitchProvider from "next-auth/providers/twitch"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

// Típusdefiníciók kiterjesztése
declare module "next-auth" {
  interface User {
    id: string
    email: string
    username: string
    isAdmin: boolean
    onboardingCompleted: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      username: string
      isAdmin: boolean
      onboardingCompleted: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    username: string
    isAdmin: boolean
    onboardingCompleted: boolean
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            username: user.username,
            isAdmin: user.isAdmin,
            onboardingCompleted: user.onboardingCompleted,
          }
        } catch (error) {
          console.error("Authorize error:", error)
          return null
        }
      }
    }),
    TwitchProvider({
      clientId: process.env.IGDB_CLIENT_ID || "",
      clientSecret: process.env.IGDB_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.username = user.username
        token.isAdmin = user.isAdmin
        token.onboardingCompleted = user.onboardingCompleted
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.username = token.username
        session.user.isAdmin = token.isAdmin
        session.user.onboardingCompleted = token.onboardingCompleted
      }
      return session
    },
    async signIn({ user, account, profile }: { user: any; account: any; profile?: any }) {
      if (account?.provider === "twitch" || account?.provider === "google") {
        try {
          // Check if user exists in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          });

          // OAuth Registration Guard: Check if this started from the registration page
          const cookieStore = await cookies();
          const isSignUp = cookieStore.get('is_signup')?.value === 'true';

          if (isSignUp && existingUser) {
            // User already exists and we are in a registration flow
            return false; // This will redirect to /api/auth/error?error=AccessDenied
          }

          if (!existingUser) {
            // Create user if they don't exist
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                username: user.username || user.name || user.email.split('@')[0],
                avatar: user.image || user.avatar_url,
                isVerified: true,
              }
            });
            user.id = newUser.id;
            user.username = newUser.username;
            user.isAdmin = newUser.isAdmin;
            user.onboardingCompleted = newUser.onboardingCompleted;
          } else {
            // User exists - update details
            const updatedUser = await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                avatar: user.image || user.avatar_url || existingUser.avatar,
              }
            });
            user.id = updatedUser.id;
            user.username = updatedUser.username;
            user.isAdmin = updatedUser.isAdmin;
            user.onboardingCompleted = updatedUser.onboardingCompleted;
          }
        } catch (error) {
          console.error("Error during provider sign-in:", error);
          return false;
        }
      }
      return true;
    }
  },
  pages: {
    signIn: "/login",
  },
  events: {
    async signIn(message) { /* successful sign in */ },
    async signOut(message) { /* sign out */ },
    async createUser(message) { /* user created */ },
    async updateUser(message) { /* user updated - e.g. their email was verified */ },
    async linkAccount(message) { /* account linked to a user */ },
    async session(message) { /* session is active */ },

  },
  debug: process.env.NODE_ENV === 'development',
}