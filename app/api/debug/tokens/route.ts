import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * DEBUG endpoint to check token usage
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        tokensUsed: true,
        lastImportAt: true,
      },
    });

    return NextResponse.json({
      user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in debug tokens:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

/**
 * DEBUG endpoint to manually set tokens (for testing)
 */
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { tokensToAdd } = await req.json();

    console.log(`🧪 DEBUG: Adding ${tokensToAdd} tokens manually`);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        tokensUsed: {
          increment: tokensToAdd || 100,
        },
      },
      select: {
        id: true,
        email: true,
        tokensUsed: true,
      },
    });

    console.log(`✅ DEBUG: User updated:`, updatedUser);

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in debug tokens POST:", error);
    return NextResponse.json(
      { error: "Error interno", details: String(error) },
      { status: 500 }
    );
  }
}
