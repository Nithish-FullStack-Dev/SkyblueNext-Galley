// lib/auth.ts

import NextAuth from "next-auth";

import Credentials from "next-auth/providers/credentials";

import prisma from "@/lib/prisma";

import bcrypt from "bcryptjs";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(
        credentials,
      ) {
        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          return null;
        }

        const user =
          await prisma.user.findUnique({
            where: {
              email:
                credentials.email as string,
            },
          });

        if (
          !user ||
          !user.password
        ) {
          return null;
        }

        if (
          user.status !==
          "Active"
        ) {
          throw new Error(
            "Your account is inactive. Please contact administrator.",
          );
        }

        const valid =
          await bcrypt.compare(
            credentials.password as string,
            user.password,
          );

        if (!valid) {
          return null;
        }

        return {
          id: user.id,

          email: user.email,

          name: user.name,

          role: user.role,

          permissions:
            user.permissions,

          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({
      token,
      user,
    }) {
      if (user) {
        token.id = user.id;

        token.role =
          (user as any).role;

        token.permissions =
          (user as any).permissions;

        token.image =
          (user as any).image;
      }

      return token;
    },

    async session({
      session,
      token,
    }) {
      if (session.user) {
        (session.user as any).id =
          token.id as string;

        (session.user as any).role =
          token.role;

        (session.user as any).permissions =
          token.permissions;

        (session.user as any).image =
          token.image;
      }

      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  trustHost: true,

  secret: process.env.NEXTAUTH_SECRET,
});