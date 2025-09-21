import { adminAuth, clientAuth, adminDb } from './firebase'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Check if user exists in Firebase Auth
          const userRecord = await adminAuth.getUserByEmail(credentials.email)
          
          if (!userRecord) {
            return null
          }

          // Get user data from Firestore
          const userDoc = await getDoc(doc(adminDb, 'users', userRecord.uid))
          
          if (!userDoc.exists()) {
            return null
          }

          const userData = userDoc.data()

          return {
            id: userRecord.uid,
            email: userRecord.email,
            name: userData.name || userRecord.displayName,
            role: userData.role,
            image: userRecord.photoURL,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.uid = user.id
      }
      
      // Handle Google sign-in
      if (account?.provider === 'google' && account.idToken) {
        try {
          const decodedToken = await adminAuth.verifyIdToken(account.idToken)
          const userDoc = await getDoc(doc(adminDb, 'users', decodedToken.uid))
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            token.role = userData.role
            token.uid = decodedToken.uid
          }
        } catch (error) {
          console.error('Google sign-in error:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.uid as string
        session.user.role = token.role as string
      }
      return session
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
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}