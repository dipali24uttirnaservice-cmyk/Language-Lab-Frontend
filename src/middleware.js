import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token");

  const pathname = request.nextUrl.pathname;

  if (
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/institute-dashboard")) &&
    !token
  ) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/institute-dashboard/:path*",
  ],
};