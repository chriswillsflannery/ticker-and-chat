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

  const decodedToken = jwt.verify(
    refreshToken.value,
    process.env.JWT_REFRESH_SECRET!,
  ) as jwt.JwtPayload;

  return NextResponse.json({
    isAuthenticated: true,
    isAdmin: decodedToken.isAdmin,
    refreshToken: refreshToken?.value,
  });
}
