import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 });
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/challenge/api/profile`, {
    headers: {
      Authorization: authHeader,
    },
  });

  const data = await response.json();

  return NextResponse.json(data);
}
