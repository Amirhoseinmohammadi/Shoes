import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

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
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    telegramId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 روز
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

          console.log("✅ کاربر احراز هویت شد:", user.id);

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
        token = { ...token, ...session.user };
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          telegramId: token.telegramId,
          username: token.username,
          firstName: token.firstName,
          lastName: token.lastName,
        };
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const target = new URL(url);
        return target.origin === baseUrl ? url : baseUrl;
      } catch {
        return baseUrl;
      }
    },
  },

  debug: process.env.NODE_ENV === "development",

  logger: {
    error(code, metadata) {
      console.error(`NextAuth Error [${code}]:`, metadata);
    },
    warn(code) {
      console.warn(`NextAuth Warning [${code}]`);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development")
        console.log(`NextAuth Debug [${code}]:`, metadata);
    },
  },
};
