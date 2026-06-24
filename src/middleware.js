import { NextResponse } from "next/server";

export function middleware(request) {
  const token =
    request.cookies.get("token")?.value;

  const role =
    request.cookies.get("role")?.value;

  const pathname =
    request.nextUrl.pathname;

  // Not logged in
  if (!token) {
    if (
      pathname.startsWith(
        "/dashboard"
      ) ||
      pathname.startsWith(
        "/institute-dashboard"
      )
    ) {
      return NextResponse.redirect(
        new URL(
          "/login",
          request.url
        )
      );
    }
  }

  // Student trying to access institute routes
  if (
    pathname.startsWith(
      "/institute-dashboard"
    ) &&
    role !== "institute"
  ) {
    return NextResponse.redirect(
      new URL(
        "/dashboard",
        request.url
      )
    );
  }

  // Institute trying to access student routes
  if (
    pathname.startsWith(
      "/dashboard"
    ) &&
    role !== "student"
  ) {
    return NextResponse.redirect(
      new URL(
        "/institute-dashboard",
        request.url
      )
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