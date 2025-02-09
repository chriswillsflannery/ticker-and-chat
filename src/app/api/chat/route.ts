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

    // MAG7 tickers mentioned in user prompt
    const mentionedTickers = MAG7.filter((ticker) =>
      new RegExp(`\\b${ticker}\\b`, "i").test(latestMessage),
    );

    const systemMessage = {
      role: "system",
      content: `You are an AI assistant tasked with answering user queries.
The user's prompt mentioned these tickers: ${mentionedTickers.join(
        ", ",
      )}. For each ticker mentioned, call the fetchSummary tool to retrieve up‑to‑date summary details and integrate that information into your response.
If the prompt mentions any ticker outside of [${MAG7.join(
        ", ",
      )}], apologize and mention that you only have information on MAG7 tickers.`,
    };

    // Fetch call may take ~20 seconds swe forward any abortSignal from the SDK for cancellation if needed.
    const fetchSummaryTool = tool({
      description:
        "Fetch summary details for a given ticker from the /api/summary route. " +
        "Call this tool only when the user's prompt contains a MAG7 ticker.",
      parameters: z
        .object({
          ticker: z.string().describe("Ticker symbol to fetch summary for"),
        })
        .strict(),
      execute: async ({ ticker }, { abortSignal }) => {
        const res = await fetch(`${baseUrl}/api/summary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, ticker }),
          signal: abortSignal,
        });
        if (!res.ok) {
          throw new Error(`Error fetching summary for ticker ${ticker}`);
        }
        return res.json();
      },
    });

    const { textStream } = streamText({
      model: aisdkOpenai("gpt-4"),
      messages: [systemMessage, ...messages],
      tools: { fetchSummary: fetchSummaryTool },
      maxSteps: 5,
      onStepFinish({ text, toolCalls, toolResults }) {
        console.log("Step finished:", { text, toolCalls, toolResults });
      },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of textStream) {
            controller.enqueue(encoder.encode(chunk));
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
      headers: { "Content-Type": "application/json" },
    });
  }
}
