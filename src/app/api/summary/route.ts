import { NextRequest, NextResponse } from "next/server";

export const config = { runtime: "nodejs" }; // Use Node.js runtime to avoid timeout?
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  console.log("Summary API: Request received");

  try {
    const body = await req.json();
    console.log("Summary API: Request body:", {
      hasTicker: !!body.ticker,
      hasAccessToken: !!body.accessToken,
      ticker: body.ticker,
    });

    const { ticker, accessToken } = body;

    if (!ticker) {
      console.log("Summary API: Missing ticker parameter");
      return NextResponse.json(
        { error: "Ticker query parameter is required." },
        { status: 400 },
      );
    }

    if (!accessToken) {
      console.log("Summary API: Missing access token");
      return NextResponse.json(
        { error: "Access token not configured." },
        { status: 500 },
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/challenge/api/summary/${ticker}`;
    console.log("Summary API: Calling external API:", {
      url: apiUrl,
      ticker,
      hasToken: !!accessToken,
    });

    try {
      const externalResponse = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log(
        "Summary API: External API response status:",
        externalResponse.status,
      );

      if (!externalResponse.ok) {
        const errorText = await externalResponse.text();
        console.error("Summary API: External API error:", {
          status: externalResponse.status,
          error: errorText,
        });
        return NextResponse.json(
          { error: errorText },
          { status: externalResponse.status },
        );
      }

      const responseData = await externalResponse.json();
      console.log("Summary API: External API success:", {
        hasAgentResponse: !!responseData.agent_response,
        responseLength: responseData.agent_response?.length || 0,
      });

      return NextResponse.json(
        { agent_response: responseData.agent_response },
        { status: 200 },
      );
    } catch (error) {
      console.error("Summary API: External API fetch error:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Summary API: JSON parsing error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}