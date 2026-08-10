import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/sign-in", "/sign-up"];

// The spec mentioned using getSessionCookie(), which might be from a custom utility or better-auth.
// Better Auth's default session cookie is 'better-auth.session_token'.
function getSessionCookie(request: NextRequest) {
  return request.cookies.get("better-auth.session_token") || request.cookies.get("__Secure-better-auth.session_token");
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isPublicRoute = pathname === "/" || publicRoutes.some((route) => pathname.startsWith(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
