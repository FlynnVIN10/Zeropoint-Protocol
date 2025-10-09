import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const res = NextResponse.next();
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // Content Security Policy
  // In development, allow inline/eval scripts and websockets for Next.js HMR/hydration.
  // In production, use a stricter policy.
  const isDev = process.env.NODE_ENV !== "production";
  const csp = isDev
    ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws: http://localhost:3000 http://127.0.0.1:3000; frame-ancestors 'none';"
    : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';";
  res.headers.set("Content-Security-Policy", csp);
  return res;
}
