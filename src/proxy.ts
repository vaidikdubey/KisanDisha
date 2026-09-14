import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
    const token = await getToken({ req });
    const { pathname, search } = req.nextUrl;
    const isOnboarded = token?.isOnboarding === true;

    const protectedRoutes = ["/home", "/prices", "/chat", "/nearby"];

    if (
        token &&
        (pathname === "/" ||
            pathname.startsWith("/sign-in") ||
            pathname.startsWith("/sign-up"))
    )
        return NextResponse.redirect(
            new URL(isOnboarded ? "/home" : "/onboarding", req.url),
        );

    if (pathname.startsWith("/onboarding")) {
        if (!token) return NextResponse.redirect(new URL("sign-in", req.url));
        if (isOnboarded)
            return NextResponse.redirect(new URL("/home", req.url));

        return NextResponse.next();
    }

    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route),
    );

    if (!token && isProtectedRoute) {
        const signInUrl = new URL("/sign-in", req.url);

        signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

        return NextResponse.redirect(signInUrl);
    }

    if (token && !isOnboarded && isProtectedRoute)
        return NextResponse.redirect(new URL("/onboarding", req.url));

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
