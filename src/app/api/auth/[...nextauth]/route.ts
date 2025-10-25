import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { validateInitData, isInitDataExpired } from "@/lib/telegram-validator";

const buildInitDataString = (
  credentials: Record<string, string | undefined>,
): string => {
  const params = new URLSearchParams();
  for (const key in credentials) {
    if (credentials[key] !== undefined) {
      params.append(key, credentials[key] as string);
    }
  }
  return params.toString();
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "telegram",
      name: "Telegram",
      credentials: {
        id: { label: "Telegram ID", type: "text" },
        first_name: { label: "First Name", type: "text" },
        last_name: { label: "Last Name", type: "text" },
        username: { label: "Username", type: "text" },
        auth_date: { label: "Auth Date", type: "text" },
        hash: { label: "Hash", type: "text" },
      },
      async authorize(credentials) {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        if (process.env.NODE_ENV !== "production") {
          const DEFAULT_USER_ID = 1;
          const user = await prisma.user.findUnique({
            where: { id: DEFAULT_USER_ID },
          });
          if (!user) throw new Error("Default user not found");
          return {
            id: user.id.toString(),
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            email: user.email || null,
            username: user.username || null,
            telegramId: user.telegramId || null,
          };
        }

        if (!botToken) {
          console.error("TELEGRAM_BOT_TOKEN is missing!");
          return null;
        }

        const initDataString = buildInitDataString(
          credentials as Record<string, string | undefined>,
        );

        if (!validateInitData(initDataString, botToken)) {
          return null;
        }

        if (isInitDataExpired(credentials?.auth_date)) {
          return null;
        }

        if (!credentials?.id) return null;

        const telegramId = Number(credentials.id);

        let user = await prisma.user.findFirst({
          where: { username: `telegram_${telegramId}` },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              username: credentials.username || `telegram_${telegramId}`,
              firstName: credentials.first_name || null,
              lastName: credentials.last_name || null,
              telegramId: telegramId.toString(),
            },
          });
        } else {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              firstName: credentials.first_name || user.firstName,
              lastName: credentials.last_name || user.lastName,
              username: credentials.username || user.username,
            },
          });
        }

        return {
          id: user.id.toString(),
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          email: null,
          telegramId: telegramId.toString(),
          username: credentials.username || null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.telegramId = (user as any).telegramId;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = Number(token.id);
        session.user.telegramId = token.telegramId as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/",
    error: "/access-denied",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,

  // cookies: {
  //   sessionToken: {
  //     name: `__Secure-next-auth.session-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: "none",
  //       path: "/",
  //       secure: true,
  //     },
  //   },
  // },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
