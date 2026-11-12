import { NextResponse } from "next/server";
import { list } from "@/lib/db";
import { graphInfo } from "@/lib/graphdb";
export const dynamic = "force-dynamic";
export async function POST() { return NextResponse.json(await graphInfo(await list())); }
