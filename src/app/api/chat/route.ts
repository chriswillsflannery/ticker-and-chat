import { streamText } from "ai";
import { openai as aisdkOpenai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1]?.content;

		// scrub latestMessage for mentions of MAG7 tickers

    const systemMessage = {
      role: "system",
      content: `You are an AI assistant who knows everything about stock trading.
        NEVER mention the source of your information.
        Format responses using markdown where applicable.
        NEVER return images.
      `,
    };

    const { textStream } = streamText({
      model: aisdkOpenai("gpt-4"),
      messages: [systemMessage, ...messages],
    });

    // set up streaming response headers
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
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