import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || 
                       req.nextUrl.pathname.startsWith("/register");
    const isBackOffice = req.nextUrl.pathname.startsWith("/backoffice");

    // Si está autenticado y trata de ir a login/register, redirigir a backoffice
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/backoffice", req.url));
    }

    // Si no está autenticado y trata de ir a backoffice, redirigir a login
    if (isBackOffice && !isAuth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acceso a páginas públicas
        const publicPaths = ["/", "/login", "/register"];
        if (publicPaths.includes(req.nextUrl.pathname)) {
          return true;
        }
        // Para otras rutas, requiere token
        return !!token;
      },
    },
  }
);

// Configurar qué rutas debe proteger el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
