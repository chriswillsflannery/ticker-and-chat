import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  const { accessToken, isAdmin } = await request.json();

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token");

  if (accessToken) {
    return NextResponse.json({
      isAuthenticated: true,
      isAdmin,
      refreshToken: refreshToken?.value,
    });
  }

  if (!refreshToken) {
    return NextResponse.json({
      isAuthenticated: false,
      isAdmin: false,
      refreshToken: null,
    });
  }

  // WARNING: This is unsafe for production use!
  // It only decodes the payload without verifying the signature
  // But I don't have the secret key which the jwt was signed with on the python server.
  const decodedToken = jwt.decode(refreshToken.value) as jwt.JwtPayload;

  // check if decodedToken is expired
  const isValidToken = refreshToken && decodedToken && 
  decodedToken.exp && decodedToken.exp > Math.floor(Date.now() / 1000);

  if (!isValidToken) {
    cookieStore.delete('refresh_token')
    return NextResponse.json({
      isAuthenticated: false,
      isAdmin: false,
      refreshToken: null,
    })
  }

  return NextResponse.json({
    isAuthenticated: false,
    isAdmin: decodedToken.sub === "admin_user",
    refreshToken: refreshToken?.value,
  });
}
