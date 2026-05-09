import { NextResponse, NextRequest } from "next/server";

export const runtime = "experimental-edge";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const user = request.cookies.get("user")?.value;
  const { pathname } = request.nextUrl;

  // 1. Handle Root Redirect (The specific feature you wanted)
  if (pathname === "/") {
    return NextResponse.redirect(new URL(token ? "/dashboard" : "/login", request.url));
  }

  // 2. Protect Dashboard (The Pro-Tier Logic)
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Optional: If you want to be as strict as the other project:
    // if (!user) return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Prevent Login access if already authorized
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login"],
};
