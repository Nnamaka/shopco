import { PrismaAdapter } from "@auth/prisma-adapter";
// import { getUserById } from "@/actions/dbUtils";
import authConfig from "@/auth.config";
import NextAuth from "next-auth";
import { prisma } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    async signIn({ account }) {
      if (account?.provider !== "credentials") return true;
      // const existingUser = await prisma.user.findUnique({ where: { email: user.email as string } });

      //   const existingUser = await getUserById(user.id as string);

      //   if (!existingUser?.emailVerified) return false;
      // you can filter users who login/signup with google here
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user || account) {
        token.role = "admin";
        token.accessToken = account?.access_token;
        token.id = account?.id_token;
        token.email = user.email; // Attach email to the JWT token
        token.picture = profile?.picture;
      }
      return token;

    },
    async session({ session, token }) {
      if (token.sub && session.user) {
       
        session.user.id = token.sub;
        session.user.email = token.email as string;
        session.user.image = token.picture;
        console.log("INside session ✅", session.user.image)
      }

      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});
