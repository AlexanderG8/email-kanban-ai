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
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : 10;

    // Fetch all emails with their tasks
    const emails = await prisma.email.findMany({
      where: { userId: session.user.id },
      select: {
        senderId: true,
        senderName: true,
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // Group by sender
    const senderMap = new Map<
      string,
      {
        senderName: string;
        senderId: string;
        emailCount: number;
        tasksGenerated: number;
        tasksCompleted: number;
      }
    >();

    emails.forEach((email) => {
      const key = email.senderId;
      const existing = senderMap.get(key);

      const tasksCount = email.tasks.length;
      const completedCount = email.tasks.filter(
        (task) => task.status === "Completado"
      ).length;

      if (existing) {
        existing.emailCount++;
        existing.tasksGenerated += tasksCount;
        existing.tasksCompleted += completedCount;
      } else {
        senderMap.set(key, {
          senderName: email.senderName,
          senderId: email.senderId,
          emailCount: 1,
          tasksGenerated: tasksCount,
          tasksCompleted: completedCount,
        });
      }
    });

    // Convert to array and calculate completion rate
    const senders = Array.from(senderMap.values())
      .map((sender) => ({
        ...sender,
        completionRate:
          sender.tasksGenerated > 0
            ? Math.round((sender.tasksCompleted / sender.tasksGenerated) * 100)
            : 0,
      }))
      .sort((a, b) => b.emailCount - a.emailCount)
      .slice(0, limit);

    return NextResponse.json({ senders });
  } catch (error) {
    console.error("Error fetching top senders:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
