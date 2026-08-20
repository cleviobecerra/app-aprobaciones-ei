import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value;

  if (!token && pathname !== "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/inbox/:path*",
    "/sent/:path*",
    "/requests/:path*",
    "/settings/:path*",
    "/users/:path*",
    "/admin-requests/:path*",
    "/reports/:path*",
    "/login",
  ],
};
