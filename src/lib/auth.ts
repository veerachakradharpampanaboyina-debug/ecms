import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Client-side auth
import { adminDb } from "@/lib/firebase-admin"; // Server-side db

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          // Use Firebase client SDK to sign in
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );
          const user = userCredential.user;

          if (user) {
            // Fetch user role from your Firestore 'users' collection
            const userDoc = await adminDb.collection("users").doc(user.uid).get();
            const userData = userDoc.data();

            if (!userData) {
              // This case should ideally not happen if registration is done correctly
              throw new Error("User data not found in database.");
            }

            // Attach id and role to the user object for the session
            return {
              id: user.uid,
              email: user.email,
              name: user.displayName,
              role: userData.role, // Add role from Firestore
            };
          }
          return null;
        } catch (error: any) {
          // Handle Firebase errors (e.g., auth/wrong-password)
          console.error("Authorize error:", error);
          // You can throw a specific error message to be displayed on the client
          throw new Error(error.message || "Invalid credentials");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // When a user signs in, the `user` object from `authorize` is passed here
      if (user) {
        token.uid = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // The `token` object from `jwt` callback is passed here
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    // You can add other pages like signOut, error, etc.
  },
  secret: process.env.NEXTAUTH_SECRET,
};
