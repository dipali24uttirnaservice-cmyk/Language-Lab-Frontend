import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;
  const pathname = request.nextUrl.pathname;

  const publicRoutes = ["/", "/login", "/student-login"];

  // ------------------------------------------
  // PUBLIC ROUTES
  // ------------------------------------------
  if (publicRoutes.includes(pathname)) {
    if (token && role === "student") {
      return NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
    }

    if (token && role === "institute") {
      return NextResponse.redirect(
        new URL("/institute-dashboard", request.url)
      );
    }

    return NextResponse.next();
  }

  // ------------------------------------------
  // NOT LOGGED IN
  // ------------------------------------------
  if (!token) {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(
        new URL("/student-login", request.url)
      );
    }

    if (pathname.startsWith("/institute-dashboard")) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    return NextResponse.next();
  }

  // ------------------------------------------
  // DASHBOARD ACCESS
  // Only check role if role actually exists.
  // ------------------------------------------

  if (
    pathname.startsWith("/dashboard") &&
    role &&
    role !== "student"
  ) {
    return NextResponse.redirect(
      new URL("/institute-dashboard", request.url)
    );
  }

  if (
    pathname.startsWith("/institute-dashboard") &&
    role &&
    role !== "institute"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/student-login",
    "/dashboard/:path*",
    "/institute-dashboard/:path*",
  ],
};