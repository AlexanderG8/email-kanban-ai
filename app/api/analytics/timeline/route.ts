import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import type { TimelineResponse } from "@/types/analytics";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get("days");
    const days = daysParam ? parseInt(daysParam) : 30;

    // Calculate date range - start from beginning of day N days ago to end of today
    const now = new Date();
    const startDate = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0); // Start of the first day

    // Fetch completed tasks in the period
    const completedTasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        status: "Completado",
        updatedAt: { gte: startDate },
      },
      select: {
        updatedAt: true,
      },
    });

    // Fetch created tasks in the period
    const createdTasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
      },
    });

    // Create timeline data structure
    const timelineMap = new Map<string, { completed: number; created: number }>();

    // Initialize all days with 0
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = format(date, "yyyy-MM-dd");
      timelineMap.set(dateKey, { completed: 0, created: 0 });
    }

    // Count completed tasks by day
    completedTasks.forEach((task) => {
      const dateKey = format(task.updatedAt, "yyyy-MM-dd");
      const existing = timelineMap.get(dateKey);
      if (existing) {
        existing.completed++;
      }
    });

    // Count created tasks by day
    createdTasks.forEach((task) => {
      const dateKey = format(task.createdAt, "yyyy-MM-dd");
      const existing = timelineMap.get(dateKey);
      if (existing) {
        existing.created++;
      }
    });

    // Convert map to array
    const timeline = Array.from(timelineMap.entries())
      .map(([date, counts]) => ({
        date,
        completed: counts.completed,
        created: counts.created,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const response: TimelineResponse = {
      timeline,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching timeline data:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
