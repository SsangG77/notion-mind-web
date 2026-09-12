import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/crypto";
import { fetchGraph } from "@/lib/notion";

export async function GET(req: NextRequest) {
  const tokenCookie = req.cookies.get("nm_token")?.value;
  if (!tokenCookie) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const graph = await fetchGraph(decrypt(tokenCookie));
    return NextResponse.json(graph);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown" },
      { status: 502 },
    );
  }
}
