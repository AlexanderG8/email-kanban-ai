import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Usa la configuración ligera para el middleware (Edge Runtime)
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (including auth)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - images and other static assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)",
  ],
};
