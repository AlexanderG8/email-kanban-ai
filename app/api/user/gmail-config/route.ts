import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/user/gmail-config
 * Validates Gmail access and saves user configuration
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { referenceDate } = body;

    // Validate Gmail access using OAuth token
    if (!session.accessToken) {
      return NextResponse.json(
        {
          error: "No hay acceso a Gmail",
          message: "No se encontró el token de acceso. Por favor, inicia sesión nuevamente."
        },
        { status: 400 }
      );
    }

    // Test Gmail API access
    const gmailTestResponse = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/profile",
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!gmailTestResponse.ok) {
      const errorData = await gmailTestResponse.json().catch(() => ({}));

      // Check for specific errors
      if (gmailTestResponse.status === 401) {
        return NextResponse.json(
          {
            error: "Token expirado",
            message: "Tu sesión ha expirado. Por favor, cierra sesión e inicia sesión nuevamente.",
            code: "TOKEN_EXPIRED"
          },
          { status: 401 }
        );
      }

      if (gmailTestResponse.status === 403) {
        return NextResponse.json(
          {
            error: "Permisos insuficientes",
            message: "No tienes permisos para acceder a Gmail. Por favor, autoriza el acceso a Gmail al iniciar sesión.",
            code: "INSUFFICIENT_PERMISSIONS"
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error: "Error de Gmail API",
          message: `Error al conectar con Gmail: ${errorData.error?.message || gmailTestResponse.statusText}`,
          code: "GMAIL_API_ERROR"
        },
        { status: 400 }
      );
    }

    // Gmail access is valid - save configuration
    const gmailProfile = await gmailTestResponse.json();

    // Update user with configuration
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        // Mark that Gmail is configured by storing a flag
        // We use gmailApiKey to indicate configuration is complete
        gmailApiKey: "oauth_configured",
        referenceDate: referenceDate ? new Date(referenceDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: 30 days ago
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        gmailApiKey: true,
        referenceDate: true,
        lastImportAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Configuración de Gmail completada exitosamente",
      user: updatedUser,
      gmailEmail: gmailProfile.emailAddress,
    });

  } catch (error) {
    console.error("Error in gmail-config:", error);
    return NextResponse.json(
      {
        error: "Error interno",
        message: "Ocurrió un error al configurar Gmail. Por favor, intenta nuevamente."
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/gmail-config
 * Check current Gmail configuration status
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

    // Get user configuration
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        gmailApiKey: true,
        referenceDate: true,
        lastImportAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Check if Gmail is configured
    const isConfigured = user.gmailApiKey === "oauth_configured";

    // Verify OAuth access is still valid
    let hasValidAccess = false;
    if (session.accessToken) {
      try {
        const testResponse = await fetch(
          "https://www.googleapis.com/gmail/v1/users/me/profile",
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        hasValidAccess = testResponse.ok;
      } catch {
        hasValidAccess = false;
      }
    }

    return NextResponse.json({
      isConfigured,
      hasValidAccess,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        referenceDate: user.referenceDate,
        lastImportAt: user.lastImportAt,
      },
    });

  } catch (error) {
    console.error("Error in gmail-config GET:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
