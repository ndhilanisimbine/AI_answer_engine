import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";

// Initialize Redis using both URL and token
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

// Continue with the rest of your middleware logic


// Initialize rate limiter with Redis
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
});

// Middleware function
export async function middleware(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  try {
    const { success, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    return response;
  } catch (error) {
    console.error("Rate limiting error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Middleware config
export const config = {
  matcher: ["/api/chat"], // Apply middleware to /api/chat
};
