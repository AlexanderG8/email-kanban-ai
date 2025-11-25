import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get("days");
    const days = daysParam ? parseInt(daysParam) : 30;

    // Calculate date range
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Fetch emails in the period
    const emails = await prisma.email.findMany({
      where: {
        userId: session.user.id,
        receivedAt: { gte: startDate },
      },
      select: {
        receivedAt: true,
        category: true,
      },
    });

    // Create timeline data structure grouped by date and category
    const timelineMap = new Map<string, { Cliente: number; Lead: number; Interno: number }>();

    // Initialize all days with 0
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = format(date, "yyyy-MM-dd");
      timelineMap.set(dateKey, { Cliente: 0, Lead: 0, Interno: 0 });
    }

    // Count emails by day and category
    emails.forEach((email) => {
      const dateKey = format(email.receivedAt, "yyyy-MM-dd");
      const existing = timelineMap.get(dateKey);
      if (existing && (email.category === "Cliente" || email.category === "Lead" || email.category === "Interno")) {
        existing[email.category]++;
      }
    });

    // Convert map to array
    const timeline = Array.from(timelineMap.entries())
      .map(([date, counts]) => ({
        date,
        Cliente: counts.Cliente,
        Lead: counts.Lead,
        Interno: counts.Interno,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ timeline });
  } catch (error) {
    console.error("Error fetching emails by category:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
