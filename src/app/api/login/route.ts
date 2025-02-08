// app/api/login/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  // in practice this would actually be a boolean value on user record in db
  const isAdmin = username === "admin_user";

  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  // Forward the login request to your Python API
  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/challenge/api/login`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!apiRes.ok) {
    // Add error logging
    const errorData = await apiRes.text();
    console.error("Login failed:", {
      status: apiRes.status,
      statusText: apiRes.statusText,
      error: errorData,
    });

    return NextResponse.json(
      { error: "Login failed", details: errorData },
      { status: apiRes.status },
    );
  }

  const data = await apiRes.json();
  const accessToken = jwt.sign({ username, isAdmin }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "5min",
  });

  const refreshToken = jwt.sign({ username, isAdmin }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "5min",
  })

  const response = NextResponse.json({ success: true, accessToken, isAdmin });
  response.cookies.set("refresh_token", data.refresh_token, {
    name: "refresh_token",
    value: refreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 15, // e.g., 15 minutes
  });

  return response;
}
