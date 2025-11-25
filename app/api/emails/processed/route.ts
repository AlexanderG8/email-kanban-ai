import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { ProcessedEmailsResponse } from "@/types/emails";

/**
 * GET /api/emails/processed
 * Obtiene emails procesados con filtros y paginacion
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Parsear query parameters
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category");
    const taskStatus = searchParams.get("taskStatus");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Validar parametros de paginacion
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Parametros de paginacion invalidos" },
        { status: 400 }
      );
    }

    // Construir objeto where dinamicamente
    const where: any = {
      userId: session.user.id,
    };

    // Filtro por rango de fechas
    if (startDate && endDate) {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Validar que las fechas sean validas
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return NextResponse.json(
            { error: "Formato de fecha invalido" },
            { status: 400 }
          );
        }

        // Validar que startDate <= endDate
        if (start > end) {
          return NextResponse.json(
            { error: "La fecha de inicio debe ser menor o igual a la fecha de fin" },
            { status: 400 }
          );
        }

        where.receivedAt = {
          gte: start,
          lte: end,
        };
      } catch (error) {
        return NextResponse.json(
          { error: "Error al procesar fechas" },
          { status: 400 }
        );
      }
    }

    // Filtro por categoria
    if (category && category !== "Todas") {
      const validCategories = ["Cliente", "Lead", "Interno"];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: "Categoria invalida" },
          { status: 400 }
        );
      }
      where.category = category;
    }

    // Filtro por estado de tareas
    if (taskStatus && taskStatus !== "Todas") {
      if (taskStatus === "Con Tareas") {
        where.hasTask = true;
      } else if (taskStatus === "Sin Tareas") {
        where.hasTask = false;
      } else {
        return NextResponse.json(
          { error: "Estado de tareas invalido" },
          { status: 400 }
        );
      }
    }

    // Calcular skip para paginacion
    const skip = (page - 1) * limit;

    // Ejecutar queries en paralelo para mejor performance
    const [emails, total] = await Promise.all([
      prisma.email.findMany({
        where,
        include: {
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              dueDate: true,
            },
          },
        },
        orderBy: { receivedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.email.count({ where }),
    ]);

    // Calcular total de paginas
    const totalPages = Math.ceil(total / limit);

    // Formatear respuesta
    const response: ProcessedEmailsResponse = {
      emails: emails.map((email) => ({
        id: email.id,
        userId: email.userId,
        gmailId: email.gmailId,
        senderId: email.senderId,
        senderName: email.senderName,
        subject: email.subject,
        body: email.body,
        snippet: email.snippet,
        category: email.category,
        receivedAt: email.receivedAt.toISOString(),
        hasTask: email.hasTask,
        createdAt: email.createdAt.toISOString(),
        tasks: email.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        })),
      })),
      total,
      page,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching processed emails:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
