import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;
  const pathname = request.nextUrl.pathname;

  // Public routes
  const publicRoutes = ["/", "/login", "/student-login"];

  // If logged in, prevent access to landing & login pages
  if (token && publicRoutes.includes(pathname)) {
    if (role === "student") {
      return NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
    }

    if (role === "institute") {
      return NextResponse.redirect(
        new URL("/institute-dashboard", request.url)
      );
    }
  }

  // Not logged in
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
  }

  // Student cannot access institute dashboard
  if (
    token &&
    pathname.startsWith("/institute-dashboard") &&
    role !== "institute"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  // Institute cannot access student dashboard
  if (
    token &&
    pathname.startsWith("/dashboard") &&
    role !== "student"
  ) {
    return NextResponse.redirect(
      new URL("/institute-dashboard", request.url)
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