import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

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
        // برای تست لوکال از یوزر دیفالت استفاده کن
        if (process.env.NODE_ENV !== "production") {
          const DEFAULT_USER_ID = 1; // آیدی یوزر دیفالت
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

        // حالت عادی تلگرام
        if (!credentials?.id) throw new Error("Telegram ID is required");
        const telegramId = Number(credentials.id);

        let user = await prisma.user.findFirst({
          where: { username: `telegram_${telegramId}` },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              username: `telegram_${telegramId}`,
              firstName: credentials.first_name || null,
              lastName: credentials.last_name || null,
            },
          });
        } else {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              firstName: credentials.first_name || user.firstName,
              lastName: credentials.last_name || user.lastName,
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
        token.telegramId = user.telegramId;
        token.username = user.username;
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

  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
