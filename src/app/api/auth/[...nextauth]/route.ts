import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET must be set in environment variables");
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      telegramId: number;
      username?: string;
      firstName?: string;
      lastName?: string;
    };
  }

  interface User {
    id: string;
    telegramId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    telegramId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }
}

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },

  providers: [
    CredentialsProvider({
      id: "telegram",
      name: "Telegram",
      credentials: {
        telegramId: { label: "Telegram ID", type: "text" },
        firstName: { label: "نام", type: "text" },
        lastName: { label: "نام خانوادگی", type: "text" },
        username: { label: "نام کاربری", type: "text" },
      },

      async authorize(credentials) {
        if (!credentials?.telegramId) {
          console.error("❌ Telegram ID ارائه نشده");
          return null;
        }

        const telegramId = parseInt(credentials.telegramId);

        if (isNaN(telegramId)) {
          console.error("❌ Telegram ID نامعتبر:", credentials.telegramId);
          return null;
        }

        try {
          let user = await prisma.user.findUnique({
            where: { telegramId },
            select: {
              id: true,
              telegramId: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                telegramId,
                username: credentials.username || `user_${telegramId}`,
                firstName: credentials.firstName || null,
                lastName: credentials.lastName || null,
              },
              select: {
                id: true,
                telegramId: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            });
          } else {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                firstName: credentials.firstName || user.firstName,
                lastName: credentials.lastName || user.lastName,
                username: credentials.username || user.username,
                updatedAt: new Date(),
              },
              select: {
                id: true,
                telegramId: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            });
          }

          return {
            id: user.id.toString(),
            telegramId: user.telegramId,
            username: user.username || undefined,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
          };
        } catch (error) {
          console.error("❌ خطا در احراز هویت:", error);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/",
    error: "/",
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.telegramId = user.telegramId;
        token.username = user.username;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }

      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          telegramId: token.telegramId as number,
          username: token.username as string | undefined,
          firstName: token.firstName as string | undefined,
          lastName: token.lastName as string | undefined,
        };
      }
      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
