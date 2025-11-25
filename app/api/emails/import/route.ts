import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fetchAndParseEmails } from "@/lib/gmail-api";
import { classifyEmail, generateTaskTitle } from "@/lib/gemini";

const MAX_EMAILS = 20;
const RATE_LIMIT_MINUTES = 5;

export async function POST() {
  try {
    // 1. Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // 2. Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // 3. Check if Gmail is configured
    if (user.gmailApiKey !== "oauth_configured") {
      return NextResponse.json(
        {
          error: "Gmail no configurado",
          message: "Debes configurar Gmail antes de sincronizar emails.",
        },
        { status: 400 }
      );
    }

    // 4. Check for active import (rate limiting)
    const activeImport = await prisma.importLog.findFirst({
      where: {
        userId: user.id,
        status: "processing",
      },
    });

    if (activeImport) {
      return NextResponse.json(
        {
          error: "Sincronización en progreso",
          message: "Ya hay una sincronización en curso. Espera a que termine.",
        },
        { status: 409 }
      );
    }

    // 5. Check rate limit (5 minutes between imports)
    const lastImport = await prisma.importLog.findFirst({
      where: {
        userId: user.id,
        status: "completed",
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    if (lastImport?.completedAt) {
      const timeSinceLastImport = Date.now() - lastImport.completedAt.getTime();
      const minTimeBetweenImports = RATE_LIMIT_MINUTES * 60 * 1000;

      if (timeSinceLastImport < minTimeBetweenImports) {
        const waitMinutes = Math.ceil(
          (minTimeBetweenImports - timeSinceLastImport) / 60000
        );
        return NextResponse.json(
          {
            error: "Rate limit",
            message: `Espera ${waitMinutes} minuto(s) antes de sincronizar nuevamente.`,
          },
          { status: 429 }
        );
      }
    }

    // 6. Create import log
    const importLog = await prisma.importLog.create({
      data: {
        userId: user.id,
        emailsProcessed: 0,
        emailsWithTasks: 0,
        tasksCreated: 0,
        status: "processing",
      },
    });

    try {
      // 7. Fetch emails from Gmail
      const emails = await fetchAndParseEmails(
        MAX_EMAILS,
        user.lastImportAt || undefined
      );

      if (emails.length === 0) {
        // No new emails
        await prisma.importLog.update({
          where: { id: importLog.id },
          data: {
            status: "completed",
            completedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: "No hay nuevos emails para sincronizar",
          summary: {
            emailsProcessed: 0,
            emailsWithTasks: 0,
            tasksCreated: 0,
            emailsSkipped: 0,
          },
        });
      }

      // 8. Process each email
      let emailsWithTasks = 0;
      let tasksCreated = 0;
      let emailsSkipped = 0;
      let totalTokensUsed = 0;

      for (const emailData of emails) {
        try {
          // Check if email already exists
          const existingEmail = await prisma.email.findUnique({
            where: { gmailId: emailData.gmailId },
          });

          if (existingEmail) {
            emailsSkipped++;
            continue;
          }

          // Classify email with Gemini
          const { classification, tokensUsed } = await classifyEmail(emailData);
          totalTokensUsed += tokensUsed;

          // Skip spam emails
          if (classification.category === "Spam") {
            emailsSkipped++;
            continue;
          }

          // Save email to database
          const savedEmail = await prisma.email.create({
            data: {
              userId: user.id,
              gmailId: emailData.gmailId,
              senderId: emailData.senderId,
              senderName: emailData.senderName,
              subject: emailData.subject,
              body: emailData.body,
              snippet: emailData.snippet,
              category: classification.category,
              receivedAt: emailData.receivedAt,
              hasTask: classification.hasTask,
            },
          });

          // Create tasks if detected
          if (classification.hasTask && classification.tasks.length > 0) {
            emailsWithTasks++;

            for (const task of classification.tasks) {
              await prisma.task.create({
                data: {
                  userId: user.id,
                  emailId: savedEmail.id,
                  title: generateTaskTitle(emailData, task.description),
                  description: task.description,
                  priority: task.priority,
                  status: "Pendiente",
                  dueDate: task.dueDate ? new Date(task.dueDate) : null,
                  aiConfidence: classification.confidence,
                },
              });
              tasksCreated++;
            }
          }
        } catch (emailError) {
          console.error(`Error processing email ${emailData.gmailId}:`, emailError);
          // Continue with next email
        }
      }

      // 9. Update import log
      await prisma.importLog.update({
        where: { id: importLog.id },
        data: {
          emailsProcessed: emails.length,
          emailsWithTasks,
          tasksCreated,
          status: "completed",
          completedAt: new Date(),
        },
      });

      // 10. Update user's last import date and token usage
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          lastImportAt: new Date(),
          tokensUsed: {
            increment: totalTokensUsed,
          },
        },
        select: {
          id: true,
          tokensUsed: true,
        },
      });

      console.log(`✅ Import completed. Tokens used in this import: ${totalTokensUsed} | User total: ${updatedUser.tokensUsed}`);

      // 11. Return summary
      return NextResponse.json({
        success: true,
        message: "Sincronización completada exitosamente",
        summary: {
          emailsProcessed: emails.length,
          emailsWithTasks,
          tasksCreated,
          emailsSkipped,
        },
      });
    } catch (processingError) {
      // Update import log with error
      await prisma.importLog.update({
        where: { id: importLog.id },
        data: {
          status: "failed",
          completedAt: new Date(),
          errorMessage: processingError instanceof Error
            ? processingError.message
            : "Error desconocido",
        },
      });

      throw processingError;
    }
  } catch (error) {
    console.error("Import error:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : "Error interno del servidor";

    return NextResponse.json(
      {
        error: "Error de sincronización",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/emails/import
 * Get import status and history
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Get last 5 import logs
    const importLogs = await prisma.importLog.findMany({
      where: { userId: session.user.id },
      orderBy: { startedAt: "desc" },
      take: 5,
    });

    // Get email and task counts
    const emailCount = await prisma.email.count({
      where: { userId: session.user.id },
    });

    const taskCount = await prisma.task.count({
      where: { userId: session.user.id },
    });

    // Check if there's an active import
    const activeImport = importLogs.find((log) => log.status === "processing");

    return NextResponse.json({
      isImporting: !!activeImport,
      emailCount,
      taskCount,
      importHistory: importLogs.map((log) => ({
        id: log.id,
        status: log.status,
        emailsProcessed: log.emailsProcessed,
        emailsWithTasks: log.emailsWithTasks,
        tasksCreated: log.tasksCreated,
        startedAt: log.startedAt,
        completedAt: log.completedAt,
        errorMessage: log.errorMessage,
      })),
    });
  } catch (error) {
    console.error("Error getting import status:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
