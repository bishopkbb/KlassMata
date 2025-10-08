import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { compare } from "bcryptjs"; // ✅ Fix 2
import { UserRole } from "@prisma/client"; // ✅ Fix 1

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;

        const valid = await compare(credentials.password, user.password);
        if (!valid) return null;

        return user;
      },
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole; // ✅ fixed typing
        session.user.firstName = token.firstName as string | null;
        session.user.lastName = token.lastName as string | null;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role as UserRole;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
      }
      return token;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
};
