import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt"; // import bcrypt
import { PrismaClient } from "@prisma/client"; // اگر Prisma داری

const prisma = new PrismaClient();

// تابع verifyPassword (اضافه شده)
async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error("خطا در چک رمز عبور:", error);
    return false;
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "ایمیل", type: "email" },
        password: { label: "رمز عبور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // پیدا کردن کاربر از DB (Prisma مثال)
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            return null; // کاربر پیدا نشد
          }

          // چک رمز عبور با تابع جدید
          const isValidPassword = await verifyPassword(
            credentials.password as string,
            user.password, // فرض: hashed در DB
          );

          if (!isValidPassword) {
            return null; // رمز غلط
          }

          // کاربر معتبر: id, email و... رو برگردون
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            // هر field دیگه‌ای که می‌خوای
          };
        } catch (error) {
          console.error("خطا در authorize:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login", // صفحه لاگین سفارشی
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
