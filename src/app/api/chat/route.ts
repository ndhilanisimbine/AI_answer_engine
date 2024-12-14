const { Configuration, OpenAIApi } = require("openai");



import { Redis } from "@upstash/redis";
import { nanoid } from "nanoid";

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY!,
});

const openai = new OpenAIApi(configuration);

export async function POST(req: Request) {
  try {
    const { urls, messages } = await req.json();

    if (!urls || !Array.isArray(urls) || !messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const responseText = aiResponse.data.choices[0].message?.content || "No response";

    const conversationId = nanoid();
    await redis.set(
      `conversation:${conversationId}`,
      JSON.stringify({ messages, urls, responseText })
    );

    return new Response(
      JSON.stringify({
        success: true,
        conversationId,
        aiResponse: responseText,
        scrapedData: urls.map((url: string) => ({ url, content: "Sample scraped content" })),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
