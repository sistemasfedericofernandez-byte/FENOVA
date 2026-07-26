import { NextResponse } from "next/server";
import { recalculateNeighborhoodRoi } from "@/server/services/roi";

/**
 * Pensado para ejecutarse periódicamente vía Vercel Cron u otro scheduler,
 * protegido por CRON_SECRET.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await recalculateNeighborhoodRoi();
  return NextResponse.json(result);
}
