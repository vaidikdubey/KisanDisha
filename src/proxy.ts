import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
    const token = await getToken({ req });
    const { pathname, search } = req.nextUrl;

    const protectedRoutes = ["/home", "/prices", "/chat", "/nearby"];

    if (
        token &&
        (pathname === "/" ||
            pathname.startsWith("/sign-in") ||
            pathname.startsWith("/sign-up") ||
            pathname.startsWith("/onboarding"))
    )
        return NextResponse.redirect(new URL("/home", req.url));

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    if (!token && isProtectedRoute) {
        const targetUrl = `${pathname}${search}`
        const signInUrl = new URL("/sign-in", req.url)

        signInUrl.searchParams.set("callbackUrl", targetUrl)
        
        return NextResponse.redirect(signInUrl);
}
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/sign-in",
        "/sign-up",
        "/",
        "/home/:path*",
        "/onboarding/:path*",
        "/prices/:path*",
        "/chat/:path*",
        "/nearby/:path*",
    ],
};
