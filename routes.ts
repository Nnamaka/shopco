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
  export const protectedRoutes = [
    "/admin/dashboard",
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
  export const DEFAULT_LOGIN_REDIRECT = "/admin/dashboard";
  