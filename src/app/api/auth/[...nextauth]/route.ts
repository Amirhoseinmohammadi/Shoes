import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function validateTelegramAuth(authData: any, botToken: string): boolean {
  const { hash, ...data } = authData;

  const checkString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  return hash === calculatedHash;
}

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
        if (!credentials?.id) {
          throw new Error("Telegram ID is required");
        }

        const telegramId = parseInt(credentials.id);

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (botToken) {
          const isValid = validateTelegramAuth(credentials, botToken);
          if (!isValid) {
            throw new Error("Invalid Telegram authentication");
          }
        }

        let user = await prisma.user.findUnique({
          where: { telegramId: telegramId },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              telegramId: telegramId,
              username: credentials.username || `user_${telegramId}`,
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
              username: credentials.username || user.username,
            },
          });
        }

        return {
          id: user.id.toString(),
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          telegramId: telegramId.toString(),
          username: user.username || null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("🎫 JWT callback - user:", user);
        token.id = user.id;
        token.telegramId = user.telegramId;
        token.username = user.username;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = parseInt(token.id as string);
        session.user.telegramId = token.telegramId as string;
        session.user.username = token.username as string;
      }
      console.log("✅ Session ساخته شد:", session.user);
      return session;
    },
  },

  pages: {
    signIn: "/",
    error: "/",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 روز
  },

  secret: process.env.NEXTAUTH_SECRET,

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
