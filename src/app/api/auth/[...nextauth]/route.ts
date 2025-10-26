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
        try {
          console.log("🔐 NextAuth authorize شروع شد");
          console.log("📝 Credentials:", {
            id: credentials?.id,
            username: credentials?.username,
            first_name: credentials?.first_name,
          });

          if (!credentials?.id) {
            console.error("❌ Telegram ID موجود نیست");
            throw new Error("Telegram ID is required");
          }

          const telegramId = parseInt(credentials.id);

          if (isNaN(telegramId)) {
            console.error("❌ Telegram ID نامعتبر است");
            throw new Error("Invalid Telegram ID");
          }

          console.log("🔍 جستجوی کاربر با telegramId:", telegramId);

          let user = await prisma.user.findUnique({
            where: { telegramId: telegramId },
          });

          if (user) {
            console.log("✅ کاربر موجود یافت شد:", user.id);

            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                firstName: credentials.first_name || user.firstName,
                lastName: credentials.last_name || user.lastName,
                username: credentials.username || user.username,
                updatedAt: new Date(),
              },
            });
          } else {
            console.log("➕ ساخت کاربر جدید");

            // ✅ ساخت کاربر جدید
            user = await prisma.user.create({
              data: {
                telegramId: telegramId,
                username: credentials.username || `user_${telegramId}`,
                firstName: credentials.first_name || null,
                lastName: credentials.last_name || null,
              },
            });

            console.log("✅ کاربر جدید ساخته شد:", user.id);
          }

          const userData = {
            id: user.id.toString(),
            name:
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              "کاربر",
            email: user.email || null,
            telegramId: telegramId.toString(),
            username: user.username || null,
          };

          console.log("✅ کاربر احراز هویت شد:", userData);
          return userData;
        } catch (error: any) {
          console.error("❌ خطا در authorize:", error);
          console.error("Stack:", error.stack);
          throw error;
        }
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
        console.log("📋 Session callback - token:", token);
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

  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
