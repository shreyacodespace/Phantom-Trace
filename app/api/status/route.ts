import { NextResponse } from "next/server";
import { mode } from "@/lib/db";
import { neoOn } from "@/lib/graphdb";
import { authOn } from "@/lib/session";
export const dynamic = "force-dynamic";
// Only reports whether each integration is configured. Never returns a secret.
export const GET = () => NextResponse.json({ database: mode === "postgres", login: authOn() && !!process.env.ADMIN_PASSWORD && !!process.env.ANALYST_PASSWORD, ai: !!process.env.XAI_API_KEY, neo4j: neoOn });
