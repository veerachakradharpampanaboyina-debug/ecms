import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string; // Assuming role is a string
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string; // Assuming role is a string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string; // Assuming role is a string
  }
}
