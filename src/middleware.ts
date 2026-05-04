import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || 
                       req.nextUrl.pathname.startsWith("/register");
    const isDashboard = req.nextUrl.pathname.startsWith("/panel");
    const isPOS = req.nextUrl.pathname.startsWith("/pos");

    // Si está autenticado y trata de ir a login/register
    if (isAuthPage && isAuth) {
      // Verificar roles del empleado
      const isOwner = token.isOwner || token.isEmployeeOwner;
      const isCashier = token.isCashier;
      const isWaiter = token.isWaiter;
      const isManager = token.isManager;
      
      // Si es dueño o gerente, redirigir al panel
      if (isOwner || isManager) {
        return NextResponse.redirect(new URL("/panel", req.url));
      }
      
      // Si es cajero o mesero (sin ser dueño/gerente), redirigir al POS
      if (isCashier || isWaiter) {
        return NextResponse.redirect(new URL("/pos", req.url));
      }
      
      // Por defecto, redirigir al panel
      return NextResponse.redirect(new URL("/panel", req.url));
    }

    // Si no está autenticado y trata de ir a rutas protegidas
    if ((isDashboard || isPOS) && !isAuth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    // Proteger el panel: solo dueños y gerentes
    if (isDashboard && isAuth) {
      const isOwner = token.isOwner || token.isEmployeeOwner;
      const isManager = token.isManager;
      
      if (!isOwner && !isManager) {
        // Si no es dueño ni gerente, redirigir al POS
        return NextResponse.redirect(new URL("/pos", req.url));
      }
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
