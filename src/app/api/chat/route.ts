import { streamText, tool } from "ai";
import { openai as aisdkOpenai } from "@ai-sdk/openai";
import { z } from "zod";

export const config = { runtime: "nodejs" }; // Use Node.js runtime to avoid timeout?
export const maxDuration = 60;

const HTTPS_LEN = 8;
const MAG7 = ["META", "AAPL", "GOOGL", "AMZN", "MSFT", "NVDA", "TSLA"];

// check if vercel automatically sets this
export async function POST(req: Request) {
  console.log("POST request received");
  let baseUrl = `${process.env.NEXT_PUBLIC_VERCEL_URL}`;

  if (baseUrl.length < HTTPS_LEN) {
    baseUrl = `${process.env.VERCEL_URL}`;
  }

  if (baseUrl.length < HTTPS_LEN) {
    baseUrl =
      process.env.NODE_ENV === "development" ? "http://localhost:3000" : "";
  }

  console.log("baseUrl: ", baseUrl);
  try {
    const body = await req.json();
    console.log("Request body received:", {
      messageCount: body.messages?.length,
      hasAccessToken: !!body.accessToken,
    });

    const { messages, accessToken } = body;
    const latestMessage = messages[messages.length - 1]?.content || "";
    console.log("Latest message:", latestMessage);

    // MAG7 tickers mentioned in user prompt
    const mentionedTickers = MAG7.filter((ticker) =>
      new RegExp(`\\b${ticker}\\b`, "i").test(latestMessage),
    );
    console.log("Mentioned tickers:", mentionedTickers);

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
        console.log("Executing fetchSummary tool for ticker:", ticker);
        const res = await fetch(`${baseUrl}/api/summary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, ticker }),
          signal: abortSignal,
        });
        if (!res.ok) {
          console.error(`Error fetching summary for ${ticker}:`, res.status);
          throw new Error(`Error fetching summary for ticker ${ticker}`);
        }
        const data = await res.json();
        console.log("Summary data received for ticker:", ticker, data);
        return data;
      },
    });

    console.log("Starting streamText...");
    const { textStream } = streamText({
      model: aisdkOpenai("gpt-4"),
      messages: [systemMessage, ...messages],
      tools: { fetchSummary: fetchSummaryTool },
      maxSteps: 5,
      onStepFinish({ text, toolCalls, toolResults }) {
        console.log("Step finished:", {
          textLength: text?.length,
          hasToolCalls: !!toolCalls?.length,
          toolResultsCount: toolResults?.length,
        });
      },
    });

    console.log("Setting up ReadableStream...");
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
          console.log("Stream complete, closing controller");
          controller.close();
        } catch (err) {
          console.error("Stream processing error:", err);
          controller.error(err);
        }
      },
    });

    console.log("Returning streaming response...");
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