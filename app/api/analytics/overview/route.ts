import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { OverviewMetrics } from "@/types/analytics";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // Current period queries (last 30 days)
    const [activeTasks, completedTasks, allTasks, emailsToday, completedTasksWithTime] = await Promise.all([
      // Active tasks (Pendiente + En Progreso)
      prisma.task.count({
        where: {
          userId: session.user.id,
          status: { in: ["Pendiente", "En Progreso"] },
        },
      }),
      // Completed tasks in last 30 days
      prisma.task.count({
        where: {
          userId: session.user.id,
          status: "Completado",
          updatedAt: { gte: thirtyDaysAgo },
        },
      }),
      // All tasks created in last 30 days
      prisma.task.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      // Emails received today
      prisma.email.count({
        where: {
          userId: session.user.id,
          receivedAt: { gte: todayStart },
        },
      }),
      // Completed tasks with resolution time (last 30 days)
      prisma.task.findMany({
        where: {
          userId: session.user.id,
          status: "Completado",
          updatedAt: { gte: thirtyDaysAgo },
        },
        select: {
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    // Previous period queries (30-60 days ago) for trends
    const [prevActiveTasks, prevCompletedTasks, prevAllTasks, prevEmailsCount] = await Promise.all([
      prisma.task.count({
        where: {
          userId: session.user.id,
          status: { in: ["Pendiente", "En Progreso"] },
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      prisma.task.count({
        where: {
          userId: session.user.id,
          status: "Completado",
          updatedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      prisma.task.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      prisma.email.count({
        where: {
          userId: session.user.id,
          receivedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
    ]);

    // Calculate metrics
    const completionRate = allTasks > 0 ? (completedTasks / allTasks) * 100 : 0;
    const prevCompletionRate = prevAllTasks > 0 ? (prevCompletedTasks / prevAllTasks) * 100 : 0;

    // Calculate average resolution time in hours
    let avgResolutionTime = 0;
    if (completedTasksWithTime.length > 0) {
      const totalTime = completedTasksWithTime.reduce((acc, task) => {
        const timeToComplete = task.updatedAt.getTime() - task.createdAt.getTime();
        return acc + timeToComplete;
      }, 0);
      avgResolutionTime = totalTime / completedTasksWithTime.length / (1000 * 60 * 60); // Convert to hours
    }

    // Calculate trends (percentage change)
    const calculateTrend = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const metrics: OverviewMetrics = {
      activeTasks,
      completionRate: Math.round(completionRate * 10) / 10,
      emailsToday,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      trends: {
        activeTasks: Math.round(calculateTrend(activeTasks, prevActiveTasks) * 10) / 10,
        completionRate: Math.round((completionRate - prevCompletionRate) * 10) / 10,
        emailsToday: Math.round(calculateTrend(emailsToday, prevEmailsCount / 30) * 10) / 10,
        avgResolutionTime: 0, // Simplified for now
      },
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching overview metrics:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
