import { NextResponse, type NextRequest } from "next/server";
import { read, authOn } from "@/lib/session";
export async function middleware(req: NextRequest) {
  if (!authOn() || (await read(req.cookies.get("pt_session")?.value))) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/api/")) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  return NextResponse.redirect(new URL("/login", req.url));
}
export const config = { matcher: ["/command/:path*", "/graph/:path*", "/afterimage/:path*", "/trustless/:path*", "/phantomdata/:path*", "/deceptionlab/:path*", "/reports/:path*", "/api/afterimage", "/api/trust", "/api/phantomdata", "/api/deception", "/api/events", "/api/graph", "/api/status", "/api/grok"] };
