import type { NextAuthConfig } from "next-auth";

// Configuración ligera para el middleware (Edge Runtime compatible)
// No incluye Prisma, callbacks pesados ni dependencias grandes
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 días
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnIntegracion = nextUrl.pathname.startsWith("/integracion");
      const isOnLogin = nextUrl.pathname === "/login";
      const isOnHome = nextUrl.pathname === "/";

      // Redirigir home a login si no está autenticado, o a dashboard si está autenticado
      if (isOnHome) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return Response.redirect(new URL("/login", nextUrl));
      }

      // Proteger rutas del dashboard
      if (isOnDashboard || isOnIntegracion) {
        if (!isLoggedIn) {
          return false; // Redirigir a login
        }
        return true;
      }

      // Redirigir usuarios autenticados del login al dashboard
      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Los providers se configuran en auth.ts
  trustHost: true,
} satisfies NextAuthConfig;
