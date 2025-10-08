// types/next-auth.d.ts
import { UserRole } from "@prisma/client"
import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      firstName?: string | null
      lastName?: string | null
      schoolId?: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role: UserRole
    firstName?: string | null
    lastName?: string | null
    schoolId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    firstName?: string | null
    lastName?: string | null
    schoolId?: string | null
  }
}