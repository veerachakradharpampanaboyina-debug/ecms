import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { UserRole } from "@/lib/types"
import { ErrorHandler } from "@/lib/error-handler"
import { adminAuth, adminDb } from "./firebase-server"
import { doc, getDoc, setDoc } from "firebase/firestore"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw ErrorHandler.ValidationError("Email and password are required")
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(credentials.email)) {
            throw ErrorHandler.ValidationError("Invalid email format")
          }

          // Check password strength
          if (credentials.password.length < 6) {
            throw ErrorHandler.ValidationError("Password must be at least 6 characters long")
          }

          // Check if user exists in Firebase Auth
          const userRecord = await adminAuth.getUserByEmail(credentials.email.toLowerCase().trim())
          
          if (!userRecord) {
            throw ErrorHandler.UnauthorizedError("Invalid email or password")
          }

          // Get user data from Firestore
          const userDoc = await getDoc(doc(adminDb, 'users', userRecord.uid))
          
          if (!userDoc.exists()) {
            throw ErrorHandler.UnauthorizedError("User not found")
          }

          const userData = userDoc.data()

          if (!userData.isActive) {
            throw ErrorHandler.UnauthorizedError("Account is deactivated")
          }

          // Log successful login
          console.log(`Successful login for user: ${userRecord.email} (${userData.role})`)

          return {
            id: userRecord.uid,
            email: userRecord.email,
            name: userData.name || userRecord.displayName,
            role: userData.role,
            profileImage: userRecord.photoURL
          }
        } catch (error) {
          // Log authentication failures
          console.error(`Authentication failed for email: ${credentials?.email}`, error)
          
          // Re-throw the error to be handled by NextAuth
          throw error
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      try {
        if (user) {
          token.role = user.role
          token.uid = user.id
          token.profileImage = user.profileImage
          token.loginTime = Date.now()
        }

        // Handle session updates
        if (trigger === "update" && session) {
          token.name = session.user.name
          token.email = session.user.email
          token.profileImage = session.user.profileImage
        }

        return token
      } catch (error) {
        console.error("JWT callback error:", error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (token) {
          session.user.id = token.uid as string
          session.user.role = token.role as UserRole
          session.user.profileImage = token.profileImage as string
          
          // Add session metadata
          session.expires = new Date((token.loginTime as number) + 24 * 60 * 60 * 1000).toISOString()
        }
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        return session
      }
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const decodedToken = await adminAuth.verifyIdToken(account.id_token!)
          const userDoc = await getDoc(doc(adminDb, 'users', decodedToken.uid))
          
          if (!userDoc.exists()) {
            // Create user in Firestore
            await setDoc(doc(adminDb, 'users', decodedToken.uid), {
              email: user.email,
              name: user.name,
              role: 'STUDENT', // Default role
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }
        } catch (error) {
          console.error('Google sign-in error:', error)
          return false
        }
      }
      return true
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  secret: process.env.NEXTAUTH_SECRET!,
  debug: process.env.NODE_ENV === "development",
  events: {
    async signIn(message) {
      console.log(`Sign in event: ${message.user.email} (${message.user.role})`)
    },
    async signOut(message) {
      console.log(`Sign out event: ${message.session?.user?.email}`)
    },
    async createUser(message) {
      console.log(`Create user event: ${message.user.email}`)
    },
    async updateUser(message) {
      console.log(`Update user event: ${message.user.email}`)
    },
    async linkAccount(message) {
      console.log(`Link account event: ${message.user.email}`)
    },
    async session(message) {
      console.log(`Session event: ${message.session.user.email}`)
    }
  },
  logger: {
    error(code, metadata) {
      console.error(`NextAuth error [${code}]:`, metadata)
    },
    warn(code) {
      console.warn(`NextAuth warning [${code}]`)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.debug(`NextAuth debug [${code}]:`, metadata)
      }
    }
  }
}