import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
  const isOnIntegracion = nextUrl.pathname.startsWith("/integracion");
  const isOnLogin = nextUrl.pathname === "/login";
  const isOnHome = nextUrl.pathname === "/";

  // Redirigir home a login si no está autenticado, o a dashboard si está autenticado
  if (isOnHome) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Proteger rutas del dashboard
  if (isOnDashboard || isOnIntegracion) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  // Redirigir usuarios autenticados del login al dashboard
  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

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
