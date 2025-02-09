// app/api/login/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  // in practice this would actually be a boolean value on user record in db
  const isAdmin = username === "admin_user";

  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/challenge/api/login`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!apiRes.ok) {
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

  // python server returns access_token and refresh_token as jwt
  const data = await apiRes.json();

  const response = NextResponse.json({ 
    success: true, 
    accessToken: data.access_token,
    isAdmin 
  });
  
  response.cookies.set("refresh_token", data.refresh_token, {
    name: "refresh_token",
    value: data.refresh_token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 5, // specs said 5 mins so I am taking your word for it
  });

  return response;
}
