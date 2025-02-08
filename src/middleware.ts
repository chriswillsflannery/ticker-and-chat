import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const protectedRoutes = ["/dashboard", "/settings"];
const publicRoutes = ["/", "/login"];

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isProtectedRoute = protectedRoutes.includes(pathname);
    const isPublicRoute = publicRoutes.includes(pathname);

    const cookie = await cookies()
    const refreshToken = cookie.get('refresh_token')?.value
    
    // WARNING: This is unsafe for production use!
    // It only decodes the payload without verifying the signature
    // But I don't have the secret key which the jwt was signed with on the python server.
    const decodedToken = jwt.decode(refreshToken ?? "") as jwt.JwtPayload;
    // decodedToken { sub: 'admin_user', type: 'refresh', exp: 1717852800 }
    
    const isValidToken = refreshToken && decodedToken && 
        decodedToken.exp && decodedToken.exp > Math.floor(Date.now() / 1000);
    
    const isAdmin = decodedToken?.sub === 'admin_user';
    
    if (isProtectedRoute && !isValidToken) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // if the refresh token is valid, keep the user in the "logged in" views
    if (isPublicRoute && isValidToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // ideally these rules should be derived from a RBAC grid
    if (pathname === '/settings' && !isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    return NextResponse.next()
}