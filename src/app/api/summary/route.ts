import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { ticker, accessToken } = await req.json();

  if (!ticker) {
    return NextResponse.json(
      { error: "Ticker query parameter is required." },
      { status: 400 }
    );
  }

  if (!accessToken) {
    return NextResponse.json(
      { error: "Access token not configured." },
      { status: 500 }
    );
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/challenge/api/summary/${ticker}`;

  try {
    const externalResponse = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json"
      },
    });

    if (!externalResponse.ok) {
      const errorText = await externalResponse.text();
      return NextResponse.json(
        { error: errorText },
        { status: externalResponse.status }
      );
    }

    const { agent_response } = await externalResponse.json();

    return NextResponse.json({ agent_response }, { status: 200 });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
