import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      username: string;
      telegramId: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    telegramId: string;
  }

  interface JWT {
    id: string;
    username: string;
    telegramId: string;
  }
}
