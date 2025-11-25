import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { TaskDistribution } from "@/types/analytics";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Fetch all tasks for the user
    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id },
      select: {
        status: true,
        priority: true,
      },
    });

    // Group by status
    const byStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by priority with breakdown by status
    const byPriority = tasks.reduce((acc, task) => {
      if (!acc[task.priority]) {
        acc[task.priority] = {
          total: 0,
          byStatus: {},
        };
      }
      acc[task.priority].total++;
      acc[task.priority].byStatus[task.status] =
        (acc[task.priority].byStatus[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, { total: number; byStatus: Record<string, number> }>);

    const distribution: TaskDistribution = {
      byStatus,
      byPriority,
    };

    return NextResponse.json(distribution);
  } catch (error) {
    console.error("Error fetching task distribution:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
