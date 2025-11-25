import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDay, getHours } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get("days");
    const days = daysParam ? parseInt(daysParam) : 30;

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

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

    // Initialize heatmap data structure
    // Days: 0 (Sunday) to 6 (Saturday)
    // Hours: 0 to 23
    const heatmapData: { day: number; hour: number; count: number }[] = [];
    const dataMap = new Map<string, number>();

    // Count tasks by day and hour
    completedTasks.forEach((task) => {
      const day = getDay(task.updatedAt); // 0-6 (Sunday-Saturday)
      const hour = getHours(task.updatedAt); // 0-23
      const key = `${day}-${hour}`;
      dataMap.set(key, (dataMap.get(key) || 0) + 1);
    });

    // Convert to array format
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        heatmapData.push({
          day,
          hour,
          count: dataMap.get(key) || 0,
        });
      }
    }

    return NextResponse.json({ heatmap: heatmapData });
  } catch (error) {
    console.error("Error fetching productivity heatmap:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
