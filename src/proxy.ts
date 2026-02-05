import { NextRequest, NextResponse } from "next/server"
import { getSessionWithCache } from "@/lib/session-cache"
import { db } from "@/lib/db"

// Routes publiques (accessibles sans authentification)
const publicRoutes = [
  "/",
  "/login",
  "/logout",
  "/register",
  "/verify-otp",
  "/reset-password",
  "/forgot-password",
  "/logout"
]

// Routes API publiques
const publicApiRoutes = [
  "/api/auth"
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permettre l'accès aux fichiers statiques et aux assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // fichiers avec extensions
  ) {
    return NextResponse.next()
  }

  // Permettre l'accès aux routes API d'auth
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Routes publiques accessibles sans session
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Pour les routes protégées, vérifier la session ET le rôle
  try {
    const session = await getSessionWithCache()
    
    // Redirection uniquement pour les requêtes GET vers /login
    if (session && pathname === "/login" && request.method === "GET") {
      return NextResponse.redirect(new URL("/new-reservation", request.url))
    }

    if (!session) {
      // Pas de session: rediriger vers login
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // IMPORTANT: Front Office = STUDENT uniquement
    if (session.user.role !== "STUDENT") {
      // Si l'utilisateur n'est pas STUDENT, le déconnecter silencieusement
      const response = NextResponse.redirect(new URL("/logout", request.url))

      // Supprimer les cookies de session
      response.cookies.delete("better-auth.session_token")

      return response
    }

    // Utilisateur STUDENT: accès autorisé
    return NextResponse.next()

  } catch (error) {
    // Erreur lors de la vérification: rediriger vers login
    console.error("Proxy error:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
