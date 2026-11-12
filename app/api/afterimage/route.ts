import { NextResponse } from "next/server";
import { analyse } from "@/lib/afterimage";
import { save } from "@/lib/db";
export const runtime = "nodejs";
const MAX = 5 * 1024 * 1024;
export async function POST(req: Request) {
  const f = (await req.formData().catch(() => null))?.get("file");
  if (!(f instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (f.size > MAX) return NextResponse.json({ error: "File is larger than 5 MB." }, { status: 413 });
  const b = Buffer.from(await f.arrayBuffer());
  const kind = b.subarray(0, 4).toString("latin1") === "%PDF" ? "pdf" : b[0] === 0xff && b[1] === 0xd8 ? "jpeg" : b.subarray(1, 4).toString("latin1") === "PNG" ? "png"
    : /\.(txt|md|csv)$/i.test(f.name) && !b.includes(0) ? "text" : null;
  if (!kind) return NextResponse.json({ error: "Unsupported file. Use PDF, JPEG, PNG, or a .txt/.md/.csv file." }, { status: 415 });
  const out = await analyse(b, kind); // the file itself is never stored
  await save(out.findings);
  return NextResponse.json(out);
}
