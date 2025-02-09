import { streamText, tool } from "ai";
import { openai as aisdkOpenai } from "@ai-sdk/openai";
import { z } from "zod";

const MAG7 = ["META", "AAPL", "GOOGL", "AMZN", "MSFT", "NVDA", "TSLA"];

export async function POST(req: Request) {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "";

  try {
    const { messages, accessToken } = await req.json();
    const latestMessage = messages[messages.length - 1]?.content || "";

    // check if latest message contains mention of MAG7
    const mentionedTickers = MAG7.filter((ticker) =>
      new RegExp(`\\b${ticker}\\b`, "i").test(latestMessage),
    );

    // tool which can fetch summary details
    const fetchSummaryTool = tool({
      description:
        "Fetch summary details for a given ticker from the /api/summary route. " +
        "Only call this tool when the user's prompt contains a MAG7 ticker.",
      parameters: z
        .object({
          ticker: z.string().describe("Ticker symbol to fetch summary for"),
        })
        .strict(),
      execute: async ({ ticker }) => {
				console.log("beginning execute")
        const res = await fetch(`${baseUrl}/api/summary`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accessToken, ticker }),
        });
        if (!res.ok) {
          throw new Error(`Error fetching summary for ticker ${ticker}`);
        }
        const data = await res.json();
				console.log('finishing execute, ', data)
        return data;
      },
    });

    const systemMessage = {
      role: "system",
      content: `You are an AI assistant tasked with answering user queries.
The user's prompt mentioned these tickers: ${mentionedTickers.join(
        ", ",
      )}, for each ticker mentioned, call the fetchSummary tool to retrieve up-to-date summary details and
integrate that information seamlessly into your response. For multiple ticker
mentions, make sure to fetch and clearly separate the relevant summaries in your answer.
If the user's prompt mentions a ticker which is NOT part of the MAG7 list: [${MAG7.join(", ")}],
Apologize profusely, and say that you only know about MAG7 tickers.`,
    };

    const { textStream, steps } = streamText({
      model: aisdkOpenai("gpt-4"),
      messages: [systemMessage, ...messages],
      // tools: { fetchSummary: fetchSummaryTool },
    });

    // set up streaming response headers
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
				console.log("ReadableStream start() callback invoked")
        try {
          for await (const text of textStream) {
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
