import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { getUserByEmail } from "@/actions/dbUtils";
import type { NextAuthConfig } from "next-auth";
import { LoginSchema } from "@/schemas";
import { prisma } from "./lib/db";
import { z } from "zod";
// import bcrypt from "bcryptjs";

export default {
  providers: [
    Google,
    Credentials({
      authorize: async (credentials) => {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email } = validatedFields.data;

          const user = await getUserByEmail(email);

          if (!user) {
            throw new Error("Invalid Credentials");
          }

          if (!user || !user.password) return null;

          // const passwordMatch = await bcrypt.compare(password, user.password);

          // if (!passwordMatch) throw new Error("Invalid Credentials");

          return { id: user.id, email: user.email };
          //   const user = await getUserByEmail(email);
          //   if (!user || !user.password) return null;

          //   const passwordMatch = await bcrypt.compare(password, user.password);

          //   if (passwordMatch) return user;
        }
        return null;
      },
    }),
    Credentials({
      id: "magic-link",
      name: "Magic Link",
      credentials: {
        email: { label: "Email", type: "text" },
        token: { label: "Magic Link", type: "text" },
      },
      async authorize(credentials) {
        const schema = z.object({
          email: z.string().email(),
          token: z.string().nonempty(),
        });

        const parsed = schema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, token } = parsed.data;

        // Check if token exists and is valid
        const magicLink = await prisma.magicLink.findUnique({
          where: { token },
        });

        if (!magicLink || magicLink.expiresAt < new Date()) {
          return null; // Expired or invalid token
        }

        // Delete the used token
        await prisma.magicLink.delete({ where: { token } });
        return { id: "admin", email };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
    signOut: "/admin/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  } as const,
  debug: true,
} satisfies NextAuthConfig;
