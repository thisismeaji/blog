import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import clientPromise from "@/lib/mongodb"
import { verifyPassword } from "@/lib/crypto"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null

        try {
          const client = await clientPromise
          const db = client.db()
          
          // Query the user by email (stored in the 'type' field in the db schema)
          const emailLower = credentials.email.toLowerCase().trim()
          const user = await db.collection("users").findOne({
            type: emailLower,
          })

          if (user) {
            const passwordProvided = credentials.password
            
            // Verify hashed password if present, otherwise fallback to legacy demo password
            if (user.password) {
              if (verifyPassword(passwordProvided, user.password)) {
                return {
                  id: user.id.toString(),
                  name: user.header,
                  email: user.type,
                  role: user.role,
                }
              }
            } else {
              if (passwordProvided === "password123") {
                return {
                  id: user.id.toString(),
                  name: user.header,
                  email: user.type,
                  role: user.role,
                }
              }
            }
          }
        } catch (error) {
          console.error("Authorize error:", error)
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
