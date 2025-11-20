import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/emails
 * Get all emails for the authenticated user
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

    const emails = await prisma.email.findMany({
      where: { userId: session.user.id },
      orderBy: { receivedAt: "desc" },
    });

    // Convert dates to ISO strings for JSON serialization
    const serializedEmails = emails.map((email) => ({
      id: email.id,
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
    }));

    return NextResponse.json({ emails: serializedEmails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
