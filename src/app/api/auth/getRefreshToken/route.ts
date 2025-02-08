import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token");

  return NextResponse.json({
    refreshToken: refreshToken?.value,
  });
}
