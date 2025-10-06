import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const handler = NextAuth(authOptions);

// Wrap handlers to add no-cache headers
const GET = async (req: NextRequest) => {
  const response = await handler(req);

  // Force no cache for auth endpoints
  if (response instanceof NextResponse) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
};

const POST = async (req: NextRequest) => {
  const response = await handler(req);

  // Force no cache for auth endpoints
  if (response instanceof NextResponse) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
};

export { GET, POST };
