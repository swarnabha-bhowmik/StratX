import { NextRequest, NextResponse } from "next/server";
import { searchCatalog, getComposioCatalog } from "@/lib/composioCatalog";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const category = req.nextUrl.searchParams.get("category") || undefined;
    const limitParam = req.nextUrl.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 60;

    const results = await searchCatalog(search, category, limit);

    return NextResponse.json({
      success: true,
      total: results.length,
      tools: results,
    });
  } catch (error: any) {
    console.error("Error in /api/agent/tools/catalog:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch tool catalog" },
      { status: 500 }
    );
  }
}
