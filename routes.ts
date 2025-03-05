/**
 * Array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */

export const publicRoutes = [
  "/",
  "/admin/login",
  "/api/magic-link",
  "/api/verify-magic-link",
  "admin/verify",
];

/**
 * Array of routes that are only accessible by logged In
 * users
 * These routes require authentication
 * @type {string[]}
 */
export const protectedRoutes = ["/admin/dashboard"];

/**
 * Array of other protected routes.
 * @type {string[]}
 */
export const otherProtectedRoutes = [
  "/user/profile",
  "/user/settings",
  // Add other protected routes here
];

/**
 * This array of routes are used for authentication
 * @type {string[]}
 */
export const authRoutes = [
  "/admin/login",
  "/admin/verify",
  "/login",
  "/signup",
];

/**
 * This is the auth api route
 * it should be by default, accessible to the public
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * Default redirect path after login
 * @type {string}
 */

/**
 * Helper function to determine if a route is protected.
 * @param {string} pathname - The pathname of the route.
 * @returns {boolean} - True if the route is protected, false otherwise.
 */
export function isProtectedRoute(pathname: string): boolean {
  if (
    publicRoutes.includes(pathname) ||
    authRoutes.includes(pathname) ||
    pathname.startsWith(apiAuthPrefix)
  ) {
    return false;
  }
  if (pathname.startsWith("/admin")) {
    return !authRoutes.includes(pathname);
  }
  if (otherProtectedRoutes.includes(pathname)) {
    return true;
  }
  return false; // Default to not protected if no other rules match.
}

export const DEFAULT_LOGIN_REDIRECT = "/admin/dashboard";
