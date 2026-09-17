import { NextResponse } from "next/server";
import { sendUpcomingRenewalReminders } from "@/server/services/subscription-reminders";

/**
 * Corre una vez por día vía Vercel Cron, protegido por CRON_SECRET (ver
 * vercel.json).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await sendUpcomingRenewalReminders();
  return NextResponse.json(result);
}
