// app/api/login/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, password } = await request.json();

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

  // data should include access_token and refresh_token.
  // Set your tokens as cookies. These options can be adjusted
  // based on your security and expiration requirements.
  const response = NextResponse.json({ success: true });
  response.cookies.set("access_token", data.access_token, {
    httpOnly: true, // not accessible on the client
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // e.g., 1 hour
  });

  response.cookies.set("refresh_token", data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // e.g., 30 days
  });

  return response;
}
