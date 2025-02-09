import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const { data: { selectedTicker }} = await request.json();
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 });
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/challenge/api/stocks/${selectedTicker}`, {
    headers: {
      Authorization: authHeader,
    },
  });

  const data = await response.json();

  return NextResponse.json(data);
}
