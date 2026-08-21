import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"

export async function proxy(req: NextRequest) { 
    const token = await getToken({ req })
    const url = req.nextUrl

    if (token && (
        url.pathname === "/" ||
        url.pathname.startsWith("/sign-in") ||
        url.pathname.startsWith("/sign-up") ||
        url.pathname.startsWith("/verify")
    )) return NextResponse.redirect(new URL("/home", req.url))

    if (!token && url.pathname.startsWith("/home")) return NextResponse.redirect(new URL("/sign-in", req.url))

        return NextResponse.next()
}

export const config = {
    matcher: [
        "/sign-in",
        "/sign-up",
        "/",
        "/home/:path*",
        "/verify/:path*"
    ]
}