import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "✅" : "❌",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "✅" : "❌",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅" : "❌",
      NODE_ENV: process.env.NODE_ENV,
    },
  });
}
