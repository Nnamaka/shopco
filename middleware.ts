import authConfig from "@/auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  publicRoutes,
  protectedRoutes,
  authRoutes,
} from "@/routes";

export default auth((req) => {
  const { nextUrl } = req;

  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  const isLoggedIn = !!req.auth;
  // const { token } = req.auth || {};

  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }
  
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute || isPublicRoute) {
    return; // Allow access to public and API routes
  }


  const isProtectedRoute = protectedRoutes.includes(nextUrl.pathname);
  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL("/admin/login", nextUrl)); // Redirect to login (or any other route)
  }

  return;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
