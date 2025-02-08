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

  console.log("is here refreshToken", refreshToken);

  // WARNING: This is unsafe for production use!
  // It only decodes the payload without verifying the signature
  // But I don't have the secret key which the jwt was signed with on the python server.
  const decodedToken = jwt.decode(refreshToken.value) as jwt.JwtPayload;

  console.log("is here decodedToken", decodedToken);

  return NextResponse.json({
    isAuthenticated: true,
    isAdmin: decodedToken.sub === "admin_user",
    refreshToken: refreshToken?.value,
  });
}
