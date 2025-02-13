// app/api/refresh/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { refreshToken } = await request.json();

  if (!refreshToken) {
    return NextResponse.json(
      { error: "No refresh token found" },
      { status: 401 },
    );
  }

  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/challenge/api/refresh`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    },
  );

  if (!apiRes.ok) {
    const response = NextResponse.json(
      { error: "Refresh failed" },
      { status: 401 },
    );
    response.cookies.delete("refresh_token");
    return response;
  }

  const data = await apiRes.json();

  const response = NextResponse.json({ success: true, accessToken: data.access_token });
  response.cookies.set("refresh_token", data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 5, // specs said 5 mins so I am taking your word for it
  });

  return response;
}
