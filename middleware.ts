import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  console.log("Middleware checking:", pathname);

  if (pathname.startsWith("/api/")) {
    console.log("Allowing API route:", pathname);
    return NextResponse.next();
  }

  const publicPaths = ["/", "/auth"];
  const isPublicPath = publicPaths.some((path) => pathname === path);

  const vkycRequiredPaths = [
    "/chatbot",
    "/library",
    "/document-processor",
    "/publish-report",
    "/profile",
  ];
  const isVKYCRequiredPath = vkycRequiredPaths.some((path) =>
    pathname.startsWith(path)
  );

  const isVKYCPath = pathname === "/vkyc";

  if (!token && (isVKYCRequiredPath || isVKYCPath)) {
    console.log("No token, redirecting to auth");
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (token && (isVKYCRequiredPath || isVKYCPath)) {
    try {
      const validateResponse = await fetch(
        new URL("/api/auth/validate", request.url),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }
      );

      const { valid } = await validateResponse.json();

      if (!valid) {
        throw new Error("Invalid token");
      }

      console.log("Token validated successfully");
    } catch (error) {
      // console.log("Token validation failed:", error);
      const response = NextResponse.redirect(new URL("/auth", request.url));
      response.cookies.delete("auth-token");
      return response;
    }
  }

  // console.log("Allowing request to proceed");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
