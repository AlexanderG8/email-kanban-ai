import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const daysAheadParam = searchParams.get("daysAhead");
    const daysAhead = daysAheadParam ? parseInt(daysAheadParam) : 7;

    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    // Fetch tasks with upcoming due dates
    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        dueDate: {
          gte: now,
          lte: futureDate,
        },
        status: {
          in: ["Pendiente", "En Progreso"],
        },
      },
      include: {
        email: {
          select: {
            subject: true,
            senderName: true,
            category: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    // Calculate days until due for each task
    const tasksWithDaysUntil = tasks.map((task) => {
      const daysUntilDue = task.dueDate
        ? Math.ceil((task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        daysUntilDue,
        email: task.email,
      };
    });

    return NextResponse.json({ tasks: tasksWithDaysUntil });
  } catch (error) {
    console.error("Error fetching upcoming tasks:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
